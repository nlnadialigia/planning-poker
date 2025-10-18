"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { VotingCards } from "./voting-cards"
import { Eye, RotateCcw } from "lucide-react"

interface VotingAreaProps {
  roomId: string
}

const FIBONACCI = ["0", "1", "2", "3", "5", "8", "13", "21", "34", "55", "89", "?", "☕"]

export function VotingArea({ roomId }: VotingAreaProps) {
  const [storyTitle, setStoryTitle] = useState("")
  const [selectedCard, setSelectedCard] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [currentStory, setCurrentStory] = useState<string | null>(null)

  const handleVote = async (value: string) => {
    setSelectedCard(value)

    try {
      await fetch("/api/votes/cast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, storyId: currentStory, value }),
      })
    } catch (error) {
      console.error("Erro ao votar:", error)
    }
  }

  const handleReveal = async () => {
    setRevealed(true)
    try {
      await fetch("/api/votes/reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, storyId: currentStory }),
      })
    } catch (error) {
      console.error("Erro ao revelar:", error)
    }
  }

  const handleReset = async () => {
    setSelectedCard(null)
    setRevealed(false)
    setStoryTitle("")
    setCurrentStory(null)

    try {
      await fetch("/api/votes/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId }),
      })
    } catch (error) {
      console.error("Erro ao resetar:", error)
    }
  }

  const handleStartVoting = async () => {
    if (!storyTitle.trim()) return

    try {
      const response = await fetch("/api/stories/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, title: storyTitle }),
      })

      if (response.ok) {
        const { storyId } = await response.json()
        setCurrentStory(storyId)
      }
    } catch (error) {
      console.error("Erro ao criar história:", error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>História Atual</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Digite o título da história..."
              value={storyTitle}
              onChange={(e) => setStoryTitle(e.target.value)}
              disabled={currentStory !== null}
            />
            {!currentStory && (
              <Button onClick={handleStartVoting} disabled={!storyTitle.trim()}>
                Iniciar
              </Button>
            )}
          </div>
          {currentStory && (
            <div className="flex gap-2">
              <Button onClick={handleReveal} disabled={revealed} className="flex-1">
                <Eye className="w-4 h-4 mr-2" />
                Revelar Votos
              </Button>
              <Button onClick={handleReset} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Nova Votação
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Escolha seu Card</CardTitle>
        </CardHeader>
        <CardContent>
          <VotingCards
            cards={FIBONACCI}
            selectedCard={selectedCard}
            onSelect={handleVote}
            disabled={!currentStory || revealed}
          />
        </CardContent>
      </Card>
    </div>
  )
}
