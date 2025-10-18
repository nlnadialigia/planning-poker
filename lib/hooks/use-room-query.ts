"use client";

import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

// Definindo os tipos de dados que o hook retornará
export interface Participant {
  id: string;
  name: string;
  is_moderator: boolean;
  color: string;
}

export interface Story {
  id: string;
  is_revealed: boolean;
}

export interface Vote {
  participant_id: string;
  value: string;
  participants: { name: string };
}

export interface RoomState {
  participants: Participant[];
  activeStory: Story | null;
  votes: Vote[];
}

const fetchRoomState = async (roomId: string): Promise<RoomState> => {
  const supabase = createClient();

  const { data: participants, error: participantsError } = await supabase
    .from("participants")
    .select("id, name, is_moderator, color")
    .eq("room_id", roomId);
  if (participantsError) throw new Error(participantsError.message);

  const { data: activeStory } = await supabase
    .from("stories")
    .select("id, is_revealed")
    .eq("room_id", roomId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  let votes: Vote[] = [];
  if (activeStory) {
    const { data: votesData, error: votesError } = await supabase
      .from("votes")
      .select("value, participant_id, participants!inner(name)")
      .eq("story_id", activeStory.id);
    if (votesError) throw new Error(votesError.message);

    votes =
      votesData?.map((vote: any) => ({
        ...vote,
        participants: Array.isArray(vote.participants)
          ? vote.participants[0]
          : vote.participants,
      })) || [];
  }

  return {
    participants: participants || [],
    activeStory,
    votes,
  };
};

export const useRoomQuery = (roomId: string) => {
  return useQuery<RoomState, Error>({
    queryKey: ["room", roomId],
    queryFn: () => fetchRoomState(roomId),
  });
};
