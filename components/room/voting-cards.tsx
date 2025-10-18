"use client";

import { cn } from "@/lib/utils";
import { Brain, Coffee } from "lucide-react";

const VOTING_CARDS = ["1", "2", "3", "5", "8", "13", "?", "☕️"];

interface VotingCardsProps {
  userVote: string | null;
  onVote: (value: string) => void;
}

type IconMap = {
  [key: string]: React.ReactElement;
};

export function VotingCards({ userVote, onVote }: Readonly<VotingCardsProps>) {
  const pyramid = [
    VOTING_CARDS.slice(0, 1),
    VOTING_CARDS.slice(1, 3),
    VOTING_CARDS.slice(3, 6),
    VOTING_CARDS.slice(6, 8),
  ];

  const iconMap: IconMap = {
    "?": <Brain className="w-8 h-8 md:w-10 md:h-10" />,
    "☕️": <Coffee className="w-8 h-8 md:w-10 md:h-10 text-amber-500" />,
  };

  return (
    <div className="flex flex-col items-center gap-2 sm:gap-3 py-4 sm:py-8">
      {pyramid.map((row, rowIndex) => (
        <div
          key={`${row[0]}-${rowIndex}`}
          className="flex justify-center gap-2 sm:gap-3"
        >
          {row.map((card) => (
            <button
              key={card}
              onClick={() => onVote(card)}
              className={cn(
                "aspect-[2/3] w-16 sm:w-20 md:w-24 rounded-lg border-2 flex items-center justify-center text-2xl md:text-3xl font-bold transition-all duration-200",
                "hover:scale-105 hover:shadow-xl active:scale-95",
                userVote === card
                  ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105"
                  : "bg-card text-card-foreground border-border hover:border-primary"
              )}
            >
              {iconMap[card] ?? card}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
