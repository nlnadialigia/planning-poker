"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function leaveRoom(formData: FormData) {
  const supabase = await createServerClient();
  const roomId = formData.get("roomId") as string;
  const participantId = formData.get("participantId") as string;
  if (!participantId) {
    return { error: "ID do participante não encontrado." };
  }
  const { error } = await supabase
    .from("participants")
    .delete()
    .eq("id", participantId);
  if (error) {
    return { error: "Erro ao sair da sala: " + error.message };
  }
  revalidatePath(`/room/${roomId}`);
  return { success: true };
}
