"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { ParticipantsList } from "./participants-list";

interface Participant {
  id: string;
  name: string;
}

interface Vote {
  value: string;
  participants: { name: string };
}

interface ModeratorDashboardProps {
  roomId: string;
  participants: Participant[];
  voterIds: Set<string>;
  isRevealed: boolean;
  votes: Vote[];
  currentParticipantId?: string;
}

export function ModeratorDashboard({
  roomId,
  participants,
  voterIds,
  isRevealed,
  votes,
  currentParticipantId,
}: Readonly<ModeratorDashboardProps>) {
  if (isRevealed) {
    // --- VISTA DE RESULTADOS (TABELA) ---
    const voteCounts = votes.reduce((acc, vote) => {
      acc[vote.value] = (acc[vote.value] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const maxCount = Math.max(...Object.values(voteCounts));
    const mostFrequentVotes = Object.keys(voteCounts).filter(
      (value) => voteCounts[value] === maxCount
    );

    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Resultados da Votação</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="p-2">Participante</th>
                <th className="p-2 text-right">Voto</th>
              </tr>
            </thead>
            <tbody>
              {votes.map((vote) => (
                <tr key={vote.participants.name} className="border-b">
                  <td className="p-2">{vote.participants.name}</td>
                  <td className="p-2 text-right font-bold">{vote.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-center mt-6">
            {mostFrequentVotes.length > 0 && mostFrequentVotes[0] && (
              <div>
                <p className="text-sm font-bold text-muted-foreground">
                  VOTO EM DESTAQUE
                </p>
                <p className="text-5xl font-bold text-primary">
                  {mostFrequentVotes.join(", ")}
                </p>
                <p className="text-sm text-muted-foreground">
                  com {maxCount} {maxCount > 1 ? "votos" : "voto"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // --- VISTA DE ACOMPANHAMENTO ---
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Users className="w-6 h-6" />
          Acompanhamento da Votação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          Aguarde os participantes votarem. Você verá um check (✓) ao lado do
          nome de quem já votou.
        </p>
        <div className="rounded-lg border bg-background p-4">
          <ParticipantsList
            roomId={roomId}
            participants={participants}
            voterIds={voterIds}
            isModerator={true}
            currentParticipantId={currentParticipantId}
          />
        </div>
      </CardContent>
    </Card>
  );
}
