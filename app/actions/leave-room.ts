"use server";

import {pusherServer} from "@/lib/pusher/server";
import {participantService} from "@/lib/services/participant.service";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";

export async function leaveRoom(formData: FormData) {
  const participantId = formData.get("participantId") as string;

  if (!participantId) {
    return {error: "ID do participante não fornecido."};
  }

  try {
    // 1. Remover participante do banco via Prisma
    await participantService.removeParticipant(participantId);

    // Como o redirecionamento acontece logo após, podemos disparar o evento mas quem fica na sala que recebe
    // Precisamos saber o roomId para disparar no canal certo
    const participant = await participantService.getParticipantById(participantId);
    if (participant) {
      await pusherServer.trigger(`room-${participant.roomId}`, "room-updated", {});
    }

    revalidatePath("/");
    redirect("/");
  } catch (error: any) {
    if (error.message === "NEXT_REDIRECT") throw error;
    console.error("Erro ao sair da sala:", error);
    return {error: "Erro ao sair da sala."};
  }
}
