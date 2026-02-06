import {prisma} from "@/lib/prisma/prisma";

export class ParticipantService {
  /**
   * Adiciona um participante a uma sala
   */
  async addParticipant(data: {roomId: string; name: string; isModerator?: boolean; color?: string;}) {
    return prisma.participant.create({
      data: {
        roomId: data.roomId,
        name: data.name,
        isModerator: data.isModerator ?? false,
        color: data.color,
      },
    });
  }

  /**
   * Busca um participante pelo ID
   */
  async getParticipantById(id: string) {
    return prisma.participant.findUnique({
      where: {id},
      include: {
        room: true,
      },
    });
  }

  /**
   * Busca participantes de uma sala
   */
  async getParticipantsByRoom(roomId: string) {
    return prisma.participant.findMany({
      where: {roomId},
      orderBy: {joinedAt: "asc"},
    });
  }

  /**
   * Verifica se um nome já está em uso na sala
   */
  async isNameTaken(roomId: string, name: string): Promise<boolean> {
    const participant = await prisma.participant.findFirst({
      where: {
        roomId,
        name: {
          equals: name,
          mode: 'insensitive'
        }
      },
    });
    return !!participant;
  }

  /**
   * Remove um participante da sala
   */
  async removeParticipant(id: string) {
    return prisma.participant.delete({
      where: {id},
    });
  }
}

export const participantService = new ParticipantService();
