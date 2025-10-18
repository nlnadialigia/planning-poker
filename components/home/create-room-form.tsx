"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { createRoom } from "@/app/actions/rooms"

export function CreateRoomForm() {
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError("")

    const result = await createRoom(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else if (result?.success) {
      router.push(`/room/${result.roomId}?pid=${result.participantId}`)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Criar Nova Sala
        </CardTitle>
        <CardDescription>Crie uma sala e receba um código para compartilhar com seu time</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="roomName">Nome da Sala</Label>
            <Input
              id="roomName"
              name="roomName"
              placeholder="Sprint Planning - Time Alpha"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="userName">Seu Nome</Label>
            <Input id="userName" name="userName" placeholder="João Silva" required disabled={loading} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="moderatorPassword">Senha do Moderador</Label>
            <Input
              id="moderatorPassword"
              name="moderatorPassword"
              type="password"
              placeholder="••••••••"
              disabled={loading}
              required
            />
            <p className="text-xs text-muted-foreground">
              Se a sala já existir, você precisará da senha para entrar como moderador.
            </p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Criando..." : "Criar Sala"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
