"use client";

import { submitVote } from "@/app/actions/vote";
import { useRoomQuery } from "@/lib/hooks/use-room-query";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ModeratorControls } from "./moderator-controls";
import { ModeratorDashboard } from "./moderator-dashboard";
import { ParticipantsList } from "./participants-list";
import { VotingCards } from "./voting-cards";

interface RoomClientViewProps {
  roomId: string;
  participantId: string;
  isModerator: boolean;
  userName: string;
}

export function RoomClientView({
  roomId,
  participantId,
  isModerator,
  userName,
}: Readonly<RoomClientViewProps>) {
  const queryClient = useQueryClient();
  const { data: roomState, isLoading, isError, error } = useRoomQuery(roomId);

  const [currentUserVote, setCurrentUserVote] = useState<string | null>(null);

  // Todos os hooks são chamados aqui, no topo.
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`room-realtime:${roomId}`)
      .on("postgres_changes", { event: "*", schema: "public" }, () => {
        queryClient.invalidateQueries({ queryKey: ["room", roomId] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, roomId]);

  useEffect(() => {
    if (roomState) {
      const userVote =
        roomState.votes.find(
          (v) => v.participants && v.participants.name === userName
        )?.value || null;
      setCurrentUserVote(userVote);
    }
  }, [roomState, userName]);

  const handleVote = useCallback(
    async (value: string) => {
      setCurrentUserVote(value);
      if (roomState?.activeStory) {
        const formData = new FormData();
        formData.append("storyId", roomState.activeStory.id);
        formData.append("participantId", participantId);
        formData.append("value", value);
        formData.append("roomId", roomId);
        await submitVote(formData);
        queryClient.invalidateQueries({ queryKey: ["room", roomId] });
      }
    },
    [roomState?.activeStory, participantId, roomId, queryClient]
  );

  const sortedParticipants = useMemo(() => {
    if (!roomState?.participants) return [];
    return [...roomState.participants].sort((a, b) => {
      if (a.is_moderator && !b.is_moderator) return -1;
      if (!a.is_moderator && b.is_moderator) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [roomState?.participants]);

  // --- Lógica de Renderização ---

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Carregando sala...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-destructive">
        <p>Ocorreu um erro ao carregar a sala:</p>
        <p className="font-mono text-sm">{error?.message}</p>
      </div>
    );
  }

  // A desestruturação e as variáveis derivadas agora estão depois dos 'returns'.
  const { activeStory, votes = [] } = roomState || {};
  const voterIds = new Set(votes.map((v) => v.participant_id));

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
        {!activeStory || activeStory.is_revealed ? (
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
        ) : (
          <VotingCards userVote={currentUserVote} onVote={handleVote} />
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
