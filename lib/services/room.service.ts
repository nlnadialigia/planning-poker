import {prisma} from "@/lib/prisma/prisma";

export class RoomService {
  /**
   * Busca uma sala pelo nome
   */
  async getRoomByName(name: string) {
    return prisma.room.findUnique({
      where: {name},
      select: {
        id: true,
        name: true,
        code: true,
        moderatorPassword: true,
        isActive: true,
      },
    });
  }

  /**
   * Busca uma sala pelo código
   */
  async getRoomByCode(code: string) {
    return prisma.room.findUnique({
      where: {code},
    });
  }

  /**
   * Cria uma nova sala
   */
  async createRoom(data: {name: string; moderatorPassword: string; code: string;}) {
    return prisma.room.create({
      data: {
        name: data.name,
        moderatorPassword: data.moderatorPassword,
        code: data.code,
        isActive: true,
      },
    });
  }

  /**
   * Verifica se a senha do moderador está correta
   */
  async verifyModeratorPassword(roomId: string, password: string): Promise<boolean> {
    const room = await prisma.room.findUnique({
      where: {id: roomId},
      select: {moderatorPassword: true},
    });
    return room?.moderatorPassword === password;
  }
}

export const roomService = new RoomService();
