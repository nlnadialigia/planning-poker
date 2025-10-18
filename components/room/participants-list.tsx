"use client";

import { removeParticipant } from "@/app/actions/participant";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check, User, X } from "lucide-react";
import { useTransition } from "react";
import { Button } from "../ui/button";

interface Participant {
  id: string;
  name: string;
}

interface ParticipantsListProps {
  roomId: string;
  participants: Participant[];
  voterIds: Set<string>;
  isModerator?: boolean;
  currentParticipantId?: string;
}

export function ParticipantsList({
  roomId,
  participants,
  voterIds,
  isModerator,
  currentParticipantId,
}: Readonly<ParticipantsListProps>) {
  const [isPending, startTransition] = useTransition();

  const handleRemove = (participantId: string) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("roomId", roomId);
      formData.append("participantId", participantId);
      await removeParticipant(formData);
    });
  };

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <User className="w-5 h-5" />
          Participantes ({participants.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {participants.map((participant) => (
            <div key={participant.id} className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback
                  className={cn(
                    "transition-colors",
                    voterIds.has(participant.id)
                      ? "bg-green-500/20 text-green-700"
                      : "bg-primary/10 text-primary",
                    participant.id === currentParticipantId &&
                      "bg-foreground text-background"
                  )}
                >
                  {participant.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{participant.name}</p>
              </div>
              {voterIds.has(participant.id) && (
                <Check className="w-5 h-5 text-green-600" />
              )}
              {isModerator && participant.id !== currentParticipantId && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleRemove(participant.id)}
                  disabled={isPending}
                  title={`Remover ${participant.name}`}
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
