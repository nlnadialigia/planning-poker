"use server";

import {pusherServer} from "@/lib/pusher/server";
import {participantService} from "@/lib/services/participant.service";
import {roomService} from "@/lib/services/room.service";
import {FormState} from "@/types/room.types";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";

function generateParticipantColor(): string {
  const h = Math.floor(Math.random() * 360);
  const s = (Math.floor(Math.random() * 20) + 80) / 100;
  const l = (Math.floor(Math.random() * 20) + 50) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;
  if (h >= 0 && h < 60) [r, g, b] = [c, x, 0];
  else if (h >= 60 && h < 120) [r, g, b] = [x, c, 0];
  else if (h >= 120 && h < 180) [r, g, b] = [0, c, x];
  else if (h >= 180 && h < 240) [r, g, b] = [0, x, c];
  else if (h >= 240 && h < 300) [r, g, b] = [x, 0, c];
  else if (h >= 300 && h < 360) [r, g, b] = [c, 0, x];
  const toHex = (val: number) => {
    const hex = Math.round(val * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r + m)}${toHex(g + m)}${toHex(b + m)}`;
}

export async function joinRoom(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const code = (formData.get("code") as string)?.toUpperCase();
  const userName = formData.get("userName") as string;

  if (!code || !userName) {
    return {
      success: false,
      error: "Código da sala e seu nome são obrigatórios",
    };
  }

  try {
    // 1. Buscar sala ativa pelo código
    const room = await roomService.getRoomByCode(code);

    if (!room || !room.isActive) {
      return {success: false, error: "Sala não encontrada ou inativa."};
    }

    // 2. Verificar se o nome já está em uso na sala
    const nameTaken = await participantService.isNameTaken(room.id, userName);

    if (nameTaken) {
      return {success: false, error: "Este nome já está em uso nesta sala."};
    }

    // 3. Adicionar participante
    const participant = await participantService.addParticipant({
      roomId: room.id,
      name: userName,
      isModerator: false,
      color: generateParticipantColor(),
    });

    await pusherServer.trigger(`room-${room.id}`, "room-updated", {});

    revalidatePath("/");
    redirect(`/room/${room.id}?pid=${participant.id}`);
  } catch (error: any) {
    if (error.message === "NEXT_REDIRECT") throw error;
    console.error("Erro ao entrar na sala:", error);
    return {success: false, error: "Falha ao entrar na sala."};
  }
}
