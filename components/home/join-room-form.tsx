"use client";

import { joinRoom } from "@/app/actions/join-rooms";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormState } from "@/types/room.types";
import { LogIn } from "lucide-react";
import { useActionState } from "react";
import { SubmitButton } from "../ui/submit-button";

const initialState: FormState = {
  error: "",
  success: false,
};

export function JoinRoomForm() {
  const [state, formAction] = useActionState(joinRoom, initialState);

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
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Código da Sala</Label>
            <Input
              id="code"
              name="code"
              placeholder="ABC123"
              required
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
            />
          </div>

          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <SubmitButton loadingText="Entrando..." className="w-full">
            Entrar na Sala
          </SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
