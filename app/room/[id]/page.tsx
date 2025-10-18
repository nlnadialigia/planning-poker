import { createServerClient } from "@/lib/supabase/server"
import { RoomHeader } from "@/components/room/room-header"
import { notFound } from "next/navigation"
import { RoomClientView } from "@/components/room/room-client-view"

type RoomPageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function RoomPage(props: RoomPageProps) {
  const searchParams = await props.searchParams;
  const params = await props.params;

  const {
    id
  } = params;

  const supabase = await createServerClient()
  const participantId = typeof searchParams.pid === "string" ? searchParams.pid : undefined

  if (!participantId) {
    return notFound()
  }

  // 1. Buscar dados do participante atual pelo seu ID único
  const { data: participant, error: participantError } = await supabase
    .from("participants")
    .select("id, name, is_moderator")
    .eq("id", participantId)
    .eq("room_id", id) // Garante que o participante pertence a esta sala
    .single()

  if (participantError || !participant) {
    return notFound()
  }

  // 2. Buscar todos os participantes da sala
  const { data: participants } = await supabase
    .from("participants")
    .select("id, name, is_moderator")
    .eq("room_id", id)

  // 3. Buscar a rodada de votação (story) ativa para a sala
  const { data: activeStory } = await supabase
    .from("stories")
    .select("id, is_revealed")
    .eq("room_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  // 4. Buscar todos os votos para a rodada ativa
  const { data: votes } = activeStory
    ? await supabase
        .from("votes")
        .select("value, participant_id, participants(name)")
        .eq("story_id", activeStory.id)
    : { data: [] }

  return (
    // A estrutura flexível começa aqui
    <div className="flex flex-col h-screen">
      <RoomHeader roomId={id} participantId={participant.id} />
      <main className="flex-grow container mx-auto px-4 py-6 overflow-y-auto">
        <RoomClientView
          roomId={id}
          initialStory={activeStory}
          initialVotes={votes || []}
          initialParticipants={participants || []}
          participantId={participant.id}
          isModerator={participant.is_moderator}
          userName={participant.name}
        />
      </main>
    </div>
  );
}
