import {prisma} from "@/lib/prisma/prisma";

export class StoryService {
  /**
   * Cria uma nova história para votação
   */
  async createStory(roomId: string, title: string) {
    return prisma.story.create({
      data: {
        roomId,
        title,
        isRevealed: false,
      },
    });
  }

  /**
   * Revela os votos de uma história
   */
  async revealVotes(storyId: string) {
    return prisma.story.update({
      where: {id: storyId},
      data: {isRevealed: true},
    });
  }

  /**
   * Reseta uma rodada de votação (limpa votos e esconde história)
   */
  async resetStory(storyId: string) {
    // Primeiro removemos os votos
    await prisma.vote.deleteMany({
      where: {storyId},
    });

    // Depois resetamos o estado da história
    return prisma.story.update({
      where: {id: storyId},
      data: {isRevealed: false},
    });
  }

  /**
   * Marca histórias anteriores como reveladas
   */
  async revealPreviousStories(roomId: string) {
    return prisma.story.updateMany({
      where: {
        roomId,
        isRevealed: false,
      },
      data: {isRevealed: true},
    });
  }
}

export class VoteService {
  /**
   * Registra ou atualiza um voto
   */
  async submitVote(data: {storyId: string; participantId: string; value: string;}) {
    return prisma.vote.upsert({
      where: {
        storyId_participantId: {
          storyId: data.storyId,
          participantId: data.participantId,
        },
      },
      update: {
        value: data.value,
      },
      create: {
        storyId: data.storyId,
        participantId: data.participantId,
        value: data.value,
      },
    });
  }

  /**
   * Limpa todos os votos de uma história
   */
  async clearVotes(storyId: string) {
    return prisma.vote.deleteMany({
      where: {storyId},
    });
  }
}

export const storyService = new StoryService();
export const voteService = new VoteService();
