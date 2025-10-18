"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function startNewVotingRound(roomId: string) {
  const supabase = await createServerClient();
  await supabase
    .from("stories")
    .update({ is_revealed: true })
    .eq("room_id", roomId)
    .eq("is_revealed", false);
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
  const { error: deleteError } = await supabase
    .from("votes")
    .delete()
    .eq("story_id", storyId);
  if (deleteError) {
    return { error: "Erro ao limpar votos: " + deleteError.message };
  }
  const { error: updateError } = await supabase
    .from("stories")
    .update({ is_revealed: false })
    .eq("id", storyId);
  if (updateError) {
    return { error: "Erro ao reiniciar votação: " + updateError.message };
  }
  revalidatePath(`/room/${roomId}`);
  return { success: true };
}
