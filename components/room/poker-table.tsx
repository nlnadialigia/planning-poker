"use client";

import { cn } from "@/lib/utils";
import { Check, Crown } from "lucide-react";
import type { CSSProperties } from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";

interface Participant {
  id: string;
  name: string;
  color: string;
  is_moderator: boolean;
}

interface PokerTableProps {
  participants: Participant[];
  voterIds: Set<string>;
  currentParticipantId?: string;
}

const getTextColor = (bgColor: string) => {
  if (bgColor.startsWith("#")) {
    const r = Number.parseInt(bgColor.slice(1, 3), 16);
    const g = Number.parseInt(bgColor.slice(3, 5), 16);
    const b = Number.parseInt(bgColor.slice(5, 7), 16);
    return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? "black" : "white";
  }
  return "white";
};

export function PokerTable({
  participants,
  voterIds,
  currentParticipantId,
}: Readonly<PokerTableProps>) {
  const moderator = participants.find((p) => p.is_moderator);
  const players = participants.filter((p) => !p.is_moderator);
  const playerCount = players.length;

  const getPlayerStyle = (index: number): CSSProperties => {
    const angle = (index / playerCount) * 2 * Math.PI;

    const radius = 190;

    const centerX = 300;
    const centerY = 200;

    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    const rotation = angle * (180 / Math.PI);

    return {
      position: "absolute",
      left: `${x}px`,
      top: `${y}px`,
      transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
      // transformOrigin: "center",
    };
  };

  return (
    <div className="relative w-[600px] h-[400px] mx-auto">
      {moderator && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-2">
          <Avatar className="w-12 h-12 border-4 border-amber-400 shadow-lg">
            <AvatarFallback
              style={{
                backgroundColor: moderator.color,
                color: getTextColor(moderator.color),
              }}
              className="text-2xl font-bold"
            >
              <Crown />
            </AvatarFallback>
          </Avatar>
          <p className="font-bold text-md bg-background/80 px-3 py-1 rounded-md">
            {moderator.name}
          </p>
        </div>
      )}

      {/* Jogadores ao redor */}
      {players.map((player, index) => {
        const hasVoted = voterIds.has(player.id);
        const angle = (index / playerCount) * 2 * Math.PI;
        const rotation = angle * (180 / Math.PI);

        return (
          <div
            key={player.id}
            className="transition-all duration-500"
            style={getPlayerStyle(index)}
          >
            <div
              className="flex flex-col items-center gap-1"
              style={{ transform: `rotate(${-rotation}deg)` }}
            >
              <div
                className={cn(
                  "w-12 h-20 rounded-md border-2 flex items-center justify-center transition-all duration-300",
                  hasVoted
                    ? "shadow-2xl scale-105"
                    : "bg-card/50 backdrop-blur-sm",
                  player.id === currentParticipantId && "border-primary"
                )}
                style={{
                  backgroundColor: hasVoted ? player.color : undefined,
                }}
              >
                {hasVoted && (
                  <Check
                    className="w-8 h-8"
                    style={{ color: getTextColor(player.color) }}
                  />
                )}
              </div>
              <p className="font-medium text-sm bg-background/80 px-2 py-0.5 rounded-md truncate max-w-[100px]">
                {player.name}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
