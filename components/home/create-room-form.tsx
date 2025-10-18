"use client";

import { createRoom } from "@/app/actions/create-rooms";
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
import { Plus } from "lucide-react";
import { useActionState } from "react";
import { SubmitButton } from "../ui/submit-button";

const initialState: FormState = {
  error: "",
  success: false,
};

export function CreateRoomForm() {
  const [state, formAction] = useActionState(createRoom, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Criar Nova Sala
        </CardTitle>
        <CardDescription>
          Crie uma sala e receba um código para compartilhar com seu time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="roomName">Nome da Sala</Label>
            <Input
              id="roomName"
              name="roomName"
              placeholder="Sprint Planning - Time Alpha"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="userName">Seu Nome</Label>
            <Input
              id="userName"
              name="userName"
              placeholder="João Silva"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="moderatorPassword">Senha do Moderador</Label>
            <Input
              id="moderatorPassword"
              name="moderatorPassword"
              type="password"
              placeholder="••••••••"
              required
            />
            <p className="text-xs text-muted-foreground">
              Se a sala já existir, você precisará da senha para entrar como
              moderador.
            </p>
          </div>

          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <SubmitButton loadingText="Criando..." className="w-full">
            Criar Sala
          </SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
