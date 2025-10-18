"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PokerTable } from "./poker-table";

interface Participant {
  id: string;
  name: string;
  color: string;
  is_moderator: boolean;
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

  // --- VISTA DE ACOMPANHAMENTO (MESA DE POKER) ---
  return (
    <div className="pt-4">
      <div className="w-[600px] h-[400px] mx-auto bg-primary/20 rounded-full">
        <PokerTable
          participants={participants}
          voterIds={voterIds}
          currentParticipantId={currentParticipantId}
        />
      </div>
    </div>
  );
}
