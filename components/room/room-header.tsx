"use client";

import { leaveRoom } from "@/app/actions/join-rooms";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Check, Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

interface RoomHeaderProps {
  roomId: string;
  participantId?: string;
}

export function RoomHeader({
  roomId,
  participantId,
}: Readonly<RoomHeaderProps>) {
  const [room, setRoom] = useState<{ name: string; code: string } | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchRoomDetails() {
      const { data, error } = await supabase
        .from("rooms")
        .select("name, code")
        .eq("id", roomId)
        .single();

      if (error) {
        console.error("Erro ao buscar detalhes da sala:", error);
        router.push("/");
      } else {
        setRoom(data);
      }
    }

    fetchRoomDetails();
  }, [roomId, supabase, router]);

  const handleCopyCode = () => {
    if (!room?.code) return;
    navigator.clipboard.writeText(room.code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleLeaveRoom = () => {
    if (!participantId) {
      router.push("/");
      return;
    }
    startTransition(async () => {
      const formData = new FormData();
      formData.append("roomId", roomId);
      formData.append("participantId", participantId);
      await leaveRoom(formData);
      router.push("/");
    });
  };

  return (
    <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Botão Voltar à Esquerda */}
        <div className="w-1/3">
          <Button
            variant="ghost"
            onClick={handleLeaveRoom}
            disabled={isPending}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {isPending ? "Saindo..." : "Voltar"}
          </Button>
        </div>

        {/* Nome e Código da Sala Centralizados */}
        <div className="w-1/3 text-center">
          {room ? (
            <div className="flex flex-col items-center gap-1">
              <h1 className="text-lg font-bold truncate" title={room.name}>
                {room.name}
              </h1>
              <Badge
                variant="secondary"
                className="cursor-pointer"
                onClick={handleCopyCode}
                title="Clique para copiar o código"
              >
                Código: {room.code}
                {isCopied ? (
                  <Check className="w-3 h-3 ml-2 text-green-500" />
                ) : (
                  <Copy className="w-3 h-3 ml-2" />
                )}
              </Badge>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 animate-pulse">
              <div className="h-6 bg-muted rounded-md w-48"></div>
              <div className="h-5 bg-muted rounded-md w-24"></div>
            </div>
          )}
        </div>

        {/* Espaço Vazio à Direita para manter o centro */}
        <div className="w-1/3"></div>
      </div>
    </header>
  );
}
