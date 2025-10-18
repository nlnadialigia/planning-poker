"use client";

import { joinRoom } from "@/app/actions/rooms";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function JoinRoomForm() {
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");

    const result = await joinRoom(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (result?.success) {
      router.push(`/room/${result.roomId}?pid=${result.participantId}`);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LogIn className="w-5 h-5" />
          Entrar em uma Sala
        </CardTitle>
        <CardDescription>
          Use o código da sala para participar de uma sessão existente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Código da Sala</Label>
            <Input
              id="code"
              name="code"
              placeholder="ABC123"
              required
              disabled={loading}
              className="uppercase"
              maxLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="joinUserName">Seu Nome</Label>
            <Input
              id="joinUserName"
              name="userName"
              placeholder="Maria Santos"
              required
              disabled={loading}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            className="w-full"
            // variant="secondary"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar na Sala"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
