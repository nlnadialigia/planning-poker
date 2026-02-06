import {z} from "zod";

export const roomSchema = z.object({
  name: z.string().min(3, "O nome da sala deve ter pelo menos 3 caracteres"),
  moderatorPassword: z.string().min(4, "A senha deve ter pelo menos 4 caracteres"),
});

export const participantSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  roomId: z.string().uuid("ID da sala inválido"),
  isModerator: z.boolean().default(false),
  color: z.string().optional(),
});

export const storySchema = z.object({
  roomId: z.string().uuid(),
  title: z.string().min(1, "O título da história é obrigatório"),
  description: z.string().optional(),
});

export const voteSchema = z.object({
  storyId: z.string().uuid(),
  participantId: z.string().uuid(),
  value: z.string().min(1, "O valor do voto é obrigatório"),
});

export const createRoomSchema = z.object({
  roomName: roomSchema.shape.name,
  userName: participantSchema.shape.name,
  moderatorPassword: roomSchema.shape.moderatorPassword,
});

export const joinRoomSchema = z.object({
  roomId: z.string().uuid(),
  userName: participantSchema.shape.name,
});
