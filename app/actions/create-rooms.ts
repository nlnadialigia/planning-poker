"use server";

import { createServerClient } from "@/lib/supabase/server";
import { FormState } from "@/types/room.types";

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
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

  const existingRoom = await getExistingRoom(supabase, roomName);
  if (existingRoom && existingRoom.moderator_password !== moderatorPassword) {
    return {
      success: false,
      error: "Senha de moderador incorreta para esta sala.",
    };
  }

  const moderatorParticipant = await getModeratorParticipant(
    supabase,
    existingRoom.id,
    userName
  );
  if (moderatorParticipant) {
    return {
      success: false,
      error: "Esta sala já possui um moderador com um nome diferente.",
    };
  }

  const participantNameExists = await doesParticipantNameExist(
    supabase,
    existingRoom.id,
    userName
  );
  if (participantNameExists) {
    return { success: false, error: "Este nome já está em uso nesta sala." };
  }

  const roomId = await createNewRoom(
    supabase,
    roomName,
    userName,
    moderatorPassword
  );
  return { success: true, roomId };
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

async function getModeratorParticipant(
  supabase: any,
  roomId: string,
  userName: string
): Promise<any> {
  return await supabase
    .from("participants")
    .select("id, name")
    .eq("room_id", roomId)
    .eq("is_moderator", true)
    .eq("name", userName)
    .single();
}

async function doesParticipantNameExist(
  supabase: any,
  roomId: string,
  userName: string
): Promise<boolean> {
  return await supabase
    .from("participants")
    .select("id")
    .eq("room_id", roomId)
    .eq("name", userName)
    .limit(1)
    .count()
    .then(({ count }: any) => count > 0);
}

async function createNewRoom(
  supabase: any,
  roomName: string,
  userName: string,
  moderatorPassword: string
): Promise<string> {
  const roomId = generateRoomCode();
  await supabase.from("rooms").insert({
    id: roomId,
    name: roomName,
    moderator_password: moderatorPassword,
    is_active: true,
    is_revealed: false,
    active_story_id: null,
    created_at: new Date().toISOString(),
    created_by: userName,
  });
  return roomId;
}
