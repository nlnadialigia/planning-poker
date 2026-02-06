"use server";

import {participantService} from "@/lib/services/participant.service";
import {roomService} from "@/lib/services/room.service";
import {createRoomSchema} from "@/lib/validations/room.schema";
import {FormState} from "@/types/room.types";
import {redirect} from "next/navigation";

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
  const rawData = {
    roomName: formData.get("roomName") as string,
    userName: formData.get("userName") as string,
    moderatorPassword: formData.get("moderatorPassword") as string,
  };

  // 1. Validação com Zod
  const result = createRoomSchema.safeParse(rawData);
  if (!result.success) {
    const errorMsg = result.error.issues.map(e => e.message).join(", ");
    return {success: false, error: errorMsg};
  }

  const {roomName, userName, moderatorPassword} = result.data;

  try {
    // 2. Verificar se a sala já existe
    const existingRoom = await roomService.getRoomByName(roomName);

    if (existingRoom) {
      // Verificar senha se a sala já existe
      if (existingRoom.moderatorPassword !== moderatorPassword) {
        return {
          success: false,
          error: "Senha de moderador incorreta para esta sala.",
        };
      }

      // Verificar se o usuário já é o moderador ou adicionar como moderador
      const participants = await participantService.getParticipantsByRoom(existingRoom.id);
      let moderator = participants.find(p => p.name === userName && p.isModerator);

      if (!moderator) {
        moderator = await participantService.addParticipant({
          roomId: existingRoom.id,
          name: userName,
          isModerator: true,
        });
      }

      redirect(`/room/${existingRoom.id}?pid=${moderator.id}`);
    }

    // 3. Criar nova sala se não existir
    const roomCode = generateRoomCode();
    const newRoom = await roomService.createRoom({
      name: roomName,
      moderatorPassword,
      code: roomCode,
    });

    // 4. Adicionar o criador como moderador
    const moderator = await participantService.addParticipant({
      roomId: newRoom.id,
      name: userName,
      isModerator: true,
    });

    redirect(`/room/${newRoom.id}?pid=${moderator.id}`);
  } catch (error: any) {
    if (error.message === "NEXT_REDIRECT") throw error;
    console.error("Erro ao criar sala:", error);
    return {success: false, error: "Falha ao processar a criação da sala."};
  }
}
