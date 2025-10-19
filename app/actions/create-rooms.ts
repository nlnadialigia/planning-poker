"use server";

import { createServerClient } from "@/lib/supabase/server";
import { FormState } from "@/types/room.types";
import { redirect } from "next/navigation";

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function createNewRoom(
  supabase: any,
  roomName: string,
  userName: string,
  moderatorPassword: string
): Promise<{ roomId: string; participantId: string }> {
  const roomCode = generateRoomCode();
  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .insert({
      name: roomName,
      code: roomCode,
      moderator_password: moderatorPassword,
      is_active: true,
      created_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (roomError) {
    throw new Error(`Falha ao criar a sala. Erro: ${roomError.message}`);
  }

  if (!room) {
    throw new Error("Falha ao criar a sala. Nenhuma sala criada.");
  }

  const { data: participant, error: participantError } = await supabase
    .from("participants")
    .insert({
      room_id: room.id,
      name: userName,
      is_moderator: true,
    })
    .select("id")
    .single();

  if (participantError) {
    throw new Error("Falha ao adicionar o moderador à sala.");
  }

  return { roomId: room.id, participantId: participant.id };
}

export async function createRoom(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createServerClient();
  const roomName = formData.get("roomName") as string;
  const userName = formData.get("userName") as string;
  const moderatorPassword = formData.get("moderatorPassword") as string;

  const validationErrors = validateInputFields(
    roomName,
    userName,
    moderatorPassword
  );
  if (validationErrors.length > 0) {
    return { success: false, error: validationErrors.join(", ") };
  }

  const { data: existingRoom, error: existingRoomError } =
    await getExistingRoom(supabase, roomName);

  if (existingRoomError && existingRoomError.code !== "PGRST116") {
    return { success: false, error: "Erro ao verificar a sala." };
  }

  if (existingRoom) {
    if (existingRoom.moderator_password !== moderatorPassword) {
      return {
        success: false,
        error: "Senha de moderador incorreta para esta sala.",
      };
    }

    const { data: participant, error: participantError } = await supabase
      .from("participants")
      .select("id")
      .eq("room_id", existingRoom.id)
      .eq("name", userName)
      .eq("is_moderator", true)
      .single();

    if (participantError || !participant) {
      const { data: newParticipant, error: newParticipantError } =
        await supabase
          .from("participants")
          .insert({
            room_id: existingRoom.id,
            name: userName,
            is_moderator: true,
          })
          .select("id")
          .single();

      if (newParticipantError) {
        return {
          success: false,
          error: "Falha ao adicionar o moderador à sala.",
        };
      }
      redirect(`/room/${existingRoom.id}?pid=${newParticipant.id}`);
    }

    redirect(`/room/${existingRoom.id}?pid=${participant.id}`);
  }

  try {
    const { roomId, participantId } = await createNewRoom(
      supabase,
      roomName,
      userName,
      moderatorPassword
    );
    redirect(`/room/${roomId}?pid=${participantId}`);
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

function validateInputFields(
  roomName: string,
  userName: string,
  moderatorPassword: string
): string[] {
  const errors: string[] = [];
  if (!roomName || !userName || !moderatorPassword) {
    errors.push("Todos os campos são obrigatórios.");
  }
  return errors;
}

async function getExistingRoom(supabase: any, roomName: string): Promise<any> {
  return await supabase
    .from("rooms")
    .select("id, moderator_password")
    .eq("name", roomName)
    .single();
}
