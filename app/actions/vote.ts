"use server";

import {pusherServer} from "@/lib/pusher/server";
import {storyService, voteService} from "@/lib/services/vote.service";
import {voteSchema} from "@/lib/validations/room.schema";
import {revalidatePath} from "next/cache";

export async function startNewVotingRound(roomId: string) {
  try {
    // 1. Revelar histórias anteriores (se houver)
    await storyService.revealPreviousStories(roomId);

    // 2. Criar nova história para votação
    const story = await storyService.createStory(
      roomId,
      `Votação ${new Date().toLocaleString()}`
    );

    await pusherServer.trigger(`room-${roomId}`, "room-updated", {});

    revalidatePath(`/room/${roomId}`);
    return {success: true, storyId: story.id};
  } catch (error: any) {
    console.error("Erro ao iniciar nova votação:", error);
    return {error: "Erro ao iniciar nova votação: " + error.message};
  }
}

export async function submitVote(formData: FormData) {
  const rawData = {
    storyId: formData.get("storyId") as string,
    participantId: formData.get("participantId") as string,
    value: formData.get("value") as string,
  };
  const roomId = formData.get("roomId") as string;

  // 1. Validação com Zod
  const result = voteSchema.safeParse(rawData);
  if (!result.success) {
    return {error: "Informações insuficientes ou inválidas para votar."};
  }

  try {
    // 2. Salvar voto (Upsert)
    await voteService.submitVote(result.data);

    await pusherServer.trigger(`room-${roomId}`, "room-updated", {});

    revalidatePath(`/room/${roomId}`);
    return {success: true};
  } catch (error: any) {
    console.error("Erro ao salvar voto:", error);
    return {error: "Erro ao salvar voto: " + error.message};
  }
}

export async function revealVotes(formData: FormData) {
  const storyId = formData.get("storyId") as string;
  const roomId = formData.get("roomId") as string;

  if (!storyId) return {error: "ID da história é obrigatório."};

  try {
    // 1. Revelar votos na história
    await storyService.revealVotes(storyId);

    await pusherServer.trigger(`room-${roomId}`, "room-updated", {});

    revalidatePath(`/room/${roomId}`);
    return {success: true};
  } catch (error: any) {
    console.error("Erro ao revelar votos:", error);
    return {error: "Erro ao revelar votos: " + error.message};
  }
}

export async function resetVotingRound(formData: FormData) {
  const storyId = formData.get("storyId") as string;
  const roomId = formData.get("roomId") as string;

  if (!storyId) return {error: "ID da história é obrigatório."};

  try {
    // 1. Resetar rodada (deleta votos e oculta história)
    await storyService.resetStory(storyId);

    await pusherServer.trigger(`room-${roomId}`, "room-updated", {});

    revalidatePath(`/room/${roomId}`);
    return {success: true};
  } catch (error: any) {
    console.error("Erro ao reiniciar votação:", error);
    return {error: "Erro ao reiniciar votação: " + error.message};
  }
}
