"use server";

import { createServerClient } from "@/lib/supabase/server";
import { FormState } from "@/types/room.types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function generateParticipantColor(): string {
  const h = Math.floor(Math.random() * 360);
  const s = (Math.floor(Math.random() * 20) + 80) / 100;
  const l = (Math.floor(Math.random() * 20) + 50) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;
  if (h >= 0 && h < 60) [r, g, b] = [c, x, 0];
  else if (h >= 60 && h < 120) [r, g, b] = [x, c, 0];
  else if (h >= 120 && h < 180) [r, g, b] = [0, c, x];
  else if (h >= 180 && h < 240) [r, g, b] = [0, x, c];
  else if (h >= 240 && h < 300) [r, g, b] = [x, 0, c];
  else if (h >= 300 && h < 360) [r, g, b] = [c, 0, x];
  const toHex = (val: number) => {
    const hex = Math.round(val * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r + m)}${toHex(g + m)}${toHex(b + m)}`;
}

export async function joinRoom(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createServerClient();
  const code = (formData.get("code") as string).toUpperCase();
  const userName = formData.get("userName") as string;

  if (!code || !userName) {
    return {
      success: false,
      error: "Código da sala e seu nome são obrigatórios",
    };
  }

  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("id")
    .eq("code", code)
    .eq("is_active", true)
    .single();

  if (roomError || !room) {
    return { success: false, error: "Sala não encontrada ou inativa." };
  }

  const { data: existingParticipant, error: nameCheckError } = await supabase
    .from("participants")
    .select("id")
    .eq("room_id", room.id)
    .eq("name", userName)
    .limit(1)
    .single();

  if (nameCheckError && nameCheckError.code !== "PGRST116") {
    return {
      success: false,
      error: "Erro ao verificar participante: " + nameCheckError.message,
    };
  }

  if (existingParticipant) {
    return { success: false, error: "Este nome já está em uso nesta sala." };
  }

  const { data: participant, error: participantError } = await supabase
    .from("participants")
    .insert({
      room_id: room.id,
      name: userName,
      is_moderator: false,
      color: generateParticipantColor(),
    })
    .select("id")
    .single();

  if (participantError) {
    return {
      success: false,
      error: "Erro ao entrar na sala: " + participantError.message,
    };
  }

  revalidatePath("/");
  redirect(`/room/${room.id}?pid=${participant.id}`);
}
