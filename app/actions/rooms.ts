"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Gerar código único de 6 caracteres
function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function createRoom(formData: FormData) {
  const supabase = await createServerClient()

  const roomName = formData.get("roomName") as string
  const userName = formData.get("userName") as string
  const moderatorPassword = formData.get("moderatorPassword") as string

  if (!roomName || !userName || !moderatorPassword) {
    return { error: "Todos os campos são obrigatórios." }
  }

  // Verifica se a sala já existe
  const { data: existingRoom } = await supabase
    .from("rooms")
    .select("id, moderator_password")
    .eq("name", roomName)
    .single()

  if (existingRoom) {
    // Se a sala existir, verifica a senha do moderador
    if (existingRoom.moderator_password !== moderatorPassword) {
      return { error: "Senha de moderador incorreta para esta sala." }
    }

    // Senha correta. Apenas cria um novo participante como moderador.
    // A lógica de "re-login" é complexa e pode ser adicionada no futuro se necessário.
    // Por agora, isso permite que múltiplos moderadores com o mesmo nome entrem.
    const { data: participant, error } = await supabase
      .from("participants")
      .insert({ room_id: existingRoom.id, name: userName, is_moderator: true })
      .select("id")
      .single()

    if (error) {
      return { error: "Erro ao entrar como moderador: " + error.message }
    }
    return { success: true, roomId: existingRoom.id, participantId: participant.id }
  }

  // --- Lógica para criar uma nova sala ---
  let code = generateRoomCode()
  let attempts = 0
  while (attempts < 10) {
    const { data: existing } = await supabase.from("rooms").select("id").eq("code", code).single()
    if (!existing) break
    code = generateRoomCode()
    attempts++
  }

  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .insert({
      name: roomName,
      code: code,
      is_active: true,
      moderator_password: moderatorPassword,
    })
    .select("id")
    .single()

  if (roomError) {
    return { error: "Erro ao criar sala: " + roomError.message }
  }

  const { data: participant, error: participantError } = await supabase
    .from("participants")
    .insert({
      room_id: room.id,
      name: userName,
      is_moderator: true,
    })
    .select("id")
    .single()

  if (participantError) {
    return { error: "Erro ao adicionar participante: " + participantError.message }
  }

  revalidatePath("/")
  return { success: true, roomId: room.id, participantId: participant.id }
}

export async function joinRoom(formData: FormData) {
  const supabase = await createServerClient()

  const code = (formData.get("code") as string).toUpperCase()
  const userName = formData.get("userName") as string

  if (!code || !userName) {
    return { error: "Código da sala e seu nome são obrigatórios" }
  }

  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("id")
    .eq("code", code)
    .eq("is_active", true)
    .single()

  if (roomError || !room) {
    return { error: "Sala não encontrada" }
  }

  // Simplesmente cria um novo participante. Permite nomes duplicados.
  const { data: participant, error: participantError } = await supabase
    .from("participants")
    .insert({
      room_id: room.id,
      name: userName,
      is_moderator: false,
    })
    .select("id")
    .single()

  if (participantError) {
    return { error: "Erro ao entrar na sala: " + participantError.message }
  }

  revalidatePath("/")
  return { success: true, roomId: room.id, participantId: participant.id }
}

// --- AÇÕES DE VOTAÇÃO ---

export async function startNewVotingRound(roomId: string) {
  const supabase = await createServerClient();

  // 1. Opcional: Arquivar rodadas anteriores para esta sala
  await supabase
    .from("stories")
    .update({ is_revealed: true })
    .eq("room_id", roomId);

  // 2. Criar uma nova "história" que representa a rodada de votação atual
  const { data: story, error } = await supabase
    .from("stories")
    .insert({
      room_id: roomId,
      title: `Votação ${new Date().toLocaleString()}`,
      is_revealed: false,
    })
    .select("id")
    .single();

  if (error) {
    return { error: "Erro ao iniciar nova votação: " + error.message };
  }

  // 3. Limpar votos antigos da rodada anterior (se houver) não é mais necessário,
  // pois os novos votos serão atrelados ao novo story.id

  revalidatePath(`/room/${roomId}`);
  return { success: true, storyId: story.id };
}

export async function submitVote(formData: FormData) {
  const supabase = await createServerClient();

  const storyId = formData.get("storyId") as string;
  const participantId = formData.get("participantId") as string;
  const value = formData.get("value") as string;
  const roomId = formData.get("roomId") as string;

  if (!storyId || !participantId || !value) {
    return { error: "Informações insuficientes para votar." };
  }

  // Upsert garante que se o usuário votar de novo, o voto é atualizado.
  const { error } = await supabase.from("votes").upsert({
    story_id: storyId,
    participant_id: participantId,
    value: value,
  });

  if (error) {
    return { error: "Erro ao salvar voto: " + error.message };
  }

  revalidatePath(`/room/${roomId}`);
  return { success: true };
}

export async function revealVotes(formData: FormData) {
  const supabase = await createServerClient();
  const storyId = formData.get("storyId") as string;
  const roomId = formData.get("roomId") as string;

  const { error } = await supabase
    .from("stories")
    .update({ is_revealed: true })
    .eq("id", storyId);

  if (error) {
    return { error: "Erro ao revelar votos: " + error.message };
  }

  revalidatePath(`/room/${roomId}`);
  return { success: true };
}

export async function resetVotingRound(formData: FormData) {
  const supabase = await createServerClient();
  const storyId = formData.get("storyId") as string;
  const roomId = formData.get("roomId") as string;

  // Deleta os votos da rodada atual
  await supabase.from("votes").delete().eq("story_id", storyId);

  // Esconde os cards novamente
  await supabase
    .from("stories")
    .update({ is_revealed: false })
    .eq("id", storyId);

  revalidatePath(`/room/${roomId}`);
  return { success: true };
}

export async function leaveRoom(formData: FormData) {
  const supabase = await createServerClient();

  const roomId = formData.get("roomId") as string;
  const participantId = formData.get("participantId") as string;

  if (!participantId) {
    return { error: "ID do participante não encontrado." };
  }

  const { error } = await supabase
    .from("participants")
    .delete()
    .eq("id", participantId);

  if (error) {
    return { error: "Erro ao sair da sala: " + error.message };
  }

  revalidatePath(`/room/${roomId}`);
  return { success: true };
}

export async function removeParticipant(formData: FormData) {
  const supabase = await createServerClient();

  const roomId = formData.get("roomId") as string;
  const participantId = formData.get("participantId") as string;

  if (!participantId) {
    return { error: "ID do participante não encontrado." };
  }

  const { error } = await supabase
    .from("participants")
    .delete()
    .eq("id", participantId);

  if (error) {
    return { error: "Erro ao remover participante: " + error.message };
  }

  revalidatePath(`/room/${roomId}`);
  return { success: true };
}
