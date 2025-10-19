"use server";

import { Participant } from "@/lib/hooks/use-room-query";
import { createServerClient } from "@/lib/supabase/server";

type JoinRoomState = {
  error?: string;
  participant?: Participant;
  success: boolean;
};

export async function joinRoom(
  prevState: JoinRoomState,
  formData: FormData
): Promise<JoinRoomState> {
  const supabase = await createServerClient();
  const roomId = formData.get("roomId") as string;
  const userName = formData.get("userName") as string;
  const moderatorPassword = formData.get("moderatorPassword") as string;

  if (!userName) {
    return { success: false, error: "O nome é obrigatório." };
  }

  // Se a senha do moderador for fornecida, valide-a
  if (moderatorPassword) {
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select("moderator_password")
      .eq("id", roomId)
      .single();

    if (roomError || !room) {
      return { success: false, error: "Sala não encontrada." };
    }

    if (room.moderator_password !== moderatorPassword) {
      return { success: false, error: "Senha de moderador incorreta." };
    }

    // Upsert (cria ou atualiza) o participante como moderador
    const { data: participant, error: upsertError } = await supabase
      .from("participants")
      .upsert(
        {
          room_id: roomId,
          name: userName,
          is_moderator: true,
        },
        { onConflict: "room_id, name", ignoreDuplicates: false }
      )
      .select()
      .single();

    if (upsertError) {
      return {
        success: false,
        error: "Erro ao entrar na sala como moderador.",
      };
    }
    return { success: true, participant };
  }

  // Se nenhuma senha for fornecida, entre como participante normal
  const { data: participant, error: insertError } = await supabase
    .from("participants")
    .insert({
      room_id: roomId,
      name: userName,
      is_moderator: false,
    })
    .select()
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      // Violação de constraint unique (room_id, name)
      return {
        success: false,
        error: "Um participante com este nome já existe na sala.",
      };
    }
    return { success: false, error: "Erro ao entrar na sala." };
  }

  return { success: true, participant };
}
