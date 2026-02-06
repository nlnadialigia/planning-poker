"use server";

import {pusherServer} from "@/lib/pusher/server";
import {participantService} from "@/lib/services/participant.service";
import {revalidatePath} from "next/cache";

export async function removeParticipant(formData: FormData) {
  const roomId = formData.get("roomId") as string;
  const participantId = formData.get("participantId") as string;

  if (!participantId) {
    return {error: "ID do participante não encontrado."};
  }

  try {
    await participantService.removeParticipant(participantId);

    await pusherServer.trigger(`room-${roomId}`, "room-updated", {});

    revalidatePath(`/room/${roomId}`);
    return {success: true};
  } catch (error: any) {
    console.error("Erro ao remover participante:", error);
    return {error: "Erro ao remover participante: " + error.message};
  }
}
