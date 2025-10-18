"use client";

import { submitVote } from "@/app/actions/rooms";
import { createClient } from "@/lib/supabase/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ModeratorControls } from "./moderator-controls";
import { ModeratorDashboard } from "./moderator-dashboard";
import { ParticipantsList } from "./participants-list";
import { VotingCards } from "./voting-cards";

interface Story {
  id: string;
  is_revealed: boolean;
}

interface Participant {
  id: string;
  name: string;
  is_moderator: boolean;
}

interface Vote {
  participant_id: string;
  value: string;
  participants: { name: string };
}

interface RoomClientViewProps {
  roomId: string;
  initialStory: Story | null;
  initialVotes: Vote[];
  initialParticipants: Participant[];
  participantId: string;
  isModerator: boolean;
  userName: string;
}

export function RoomClientView({
  roomId,
  initialStory,
  initialVotes,
  initialParticipants,
  participantId,
  isModerator,
  userName,
}: Readonly<RoomClientViewProps>) {
  const [activeStory, setActiveStory] = useState<Story | null>(initialStory);
  const [votes, setVotes] = useState<Vote[]>(initialVotes);
  const [participants, setParticipants] =
    useState<Participant[]>(initialParticipants);
  const [currentUserVote, setCurrentUserVote] = useState<string | null>(() => {
    return (
      initialVotes.find((v) => v.participants.name === userName)?.value || null
    );
  });
  const supabase = createClient();

  const fetchRoomState = useCallback(async () => {
    const { data: participantData } = await supabase
      .from("participants")
      .select("id, name, is_moderator")
      .eq("room_id", roomId);
    setParticipants(participantData || []);

    const { data: storyData } = await supabase
      .from("stories")
      .select("id, is_revealed")
      .eq("room_id", roomId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    setActiveStory(storyData);

    if (storyData) {
      const { data: votesData } = await supabase
        .from("votes")
        .select("value, participant_id, participants(name)")
        .eq("story_id", storyData.id);
      setVotes((votesData as any[]) || []);
      const userVote =
        votesData?.find((v: any) => v.participants.name === userName)?.value ||
        null;
      setCurrentUserVote(userVote);
    } else {
      setVotes([]);
      setCurrentUserVote(null);
    }
  }, [roomId, supabase, userName]);

  useEffect(() => {
    const channel = supabase
      .channel(`room-realtime:${roomId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "stories" },
        fetchRoomState
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "votes" },
        fetchRoomState
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "participants" },
        fetchRoomState
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRoomState, roomId, supabase]);

  const handleVote = useCallback(
    async (value: string) => {
      setCurrentUserVote(value);
      if (activeStory) {
        const formData = new FormData();
        formData.append("storyId", activeStory.id);
        formData.append("participantId", participantId);
        formData.append("value", value);
        formData.append("roomId", roomId);
        await submitVote(formData);
      }
    },
    [activeStory, participantId, roomId]
  );

  const voterIds = new Set(votes.map((v) => v.participant_id));

  // Ordena a lista de participantes antes de renderizar
  const sortedParticipants = useMemo(() => {
    return [...participants].sort((a, b) => {
      if (a.is_moderator && !b.is_moderator) return -1;
      if (!a.is_moderator && b.is_moderator) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [participants]);

  if (isModerator) {
    return (
      <div className="space-y-6">
        <ModeratorControls
          roomId={roomId}
          storyId={activeStory?.id}
          isRevealed={activeStory?.is_revealed}
        />
        <ModeratorDashboard
          roomId={roomId}
          participants={sortedParticipants}
          voterIds={voterIds}
          isRevealed={activeStory?.is_revealed || false}
          votes={votes}
          currentParticipantId={participantId}
        />
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[1fr_300px] gap-6">
      <div className="space-y-6">
        {activeStory && !activeStory.is_revealed ? (
          <VotingCards userVote={currentUserVote} onVote={handleVote} />
        ) : (
          <div className="text-center py-12 px-4 rounded-lg bg-card border shadow-sm">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-500">
              {activeStory?.is_revealed
                ? "Votos Revelados!"
                : "Tudo pronto para começar!"}
            </h2>
            <p className="text-muted-foreground mt-2">
              {activeStory?.is_revealed
                ? "Aguarde o moderador iniciar a próxima rodada de votação."
                : "Pegue um café ☕️ e aguarde o moderador iniciar a votação."}
            </p>
          </div>
        )}
      </div>
      <aside>
        <ParticipantsList
          roomId={roomId}
          participants={sortedParticipants}
          voterIds={voterIds}
          currentParticipantId={participantId}
        />
      </aside>
    </div>
  );
}
