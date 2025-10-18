"use client";

import {
  resetVotingRound,
  revealVotes,
  startNewVotingRound,
} from "@/app/actions/vote";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, PlusCircle, RotateCcw } from "lucide-react";
import { useTransition } from "react";

interface ModeratorControlsProps {
  roomId: string;
  storyId?: string;
  isRevealed?: boolean;
}

export function ModeratorControls({
  roomId,
  storyId,
  isRevealed,
}: Readonly<ModeratorControlsProps>) {
  const [isPending, startTransition] = useTransition();

  const handleStartNew = () => {
    startTransition(async () => {
      const result = await startNewVotingRound(roomId);
      if (result?.error) {
        console.error("Erro ao iniciar votação:", result.error);
      }
    });
  };

  const handleReveal = () => {
    if (!storyId) return;
    const formData = new FormData();
    formData.append("storyId", storyId);
    formData.append("roomId", roomId);
    startTransition(async () => {
      const result = await revealVotes(formData);
      if (result?.error) {
        console.error("Erro ao revelar votos:", result.error);
      }
    });
  };

  const handleReset = () => {
    if (!storyId) return;
    const formData = new FormData();
    formData.append("storyId", storyId);
    formData.append("roomId", roomId);
    startTransition(async () => {
      const result = await resetVotingRound(formData);
      if (result?.error) {
        console.error("Erro ao limpar votos:", result.error);
      }
    });
  };

  return (
    <Card className="w-[600px] mx-auto">
      <CardContent className="flex flex-wrap items-center justify-center gap-2">
        <Button onClick={handleStartNew} disabled={isPending}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Iniciar Nova Votação
        </Button>
        <Button
          onClick={handleReveal}
          disabled={!storyId || isRevealed || isPending}
        >
          <Eye className="w-4 h-4 mr-2" />
          Revelar Votos
        </Button>
        <Button
          onClick={handleReset}
          variant="outline"
          disabled={!storyId || isPending}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Limpar Votos
        </Button>
      </CardContent>
    </Card>
  );
}
