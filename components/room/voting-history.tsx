"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface VoteResult {
  storyTitle: string
  votes: { userName: string; value: string }[]
  average: number
  consensus: boolean
  createdAt: string
}

interface VotingHistoryProps {
  roomId: string
}

export function VotingHistory({ roomId }: VotingHistoryProps) {
  const [history, setHistory] = useState<VoteResult[]>([])

  useEffect(() => {
    fetchHistory()
  }, [roomId])

  const fetchHistory = async () => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/history`)
      if (response.ok) {
        const data = await response.json()
        setHistory(data.history)
      }
    } catch (error) {
      console.error("Erro ao carregar histórico:", error)
    }
  }

  if (history.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Votações</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((result, index) => (
            <div key={index} className="border-b pb-4 last:border-0">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold">{result.storyTitle}</h4>
                <div className="flex items-center gap-2">
                  <Badge variant={result.consensus ? "default" : "secondary"}>
                    {result.consensus ? "Consenso" : "Sem consenso"}
                  </Badge>
                  <span className="text-sm font-bold">Média: {result.average}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.votes.map((vote, voteIndex) => (
                  <div key={voteIndex} className="text-xs bg-muted px-2 py-1 rounded">
                    {vote.userName}: <span className="font-bold">{vote.value}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">{new Date(result.createdAt).toLocaleString("pt-BR")}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
