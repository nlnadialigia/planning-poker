import { RoomClientView } from "@/components/room/room-client-view";
import { RoomHeader } from "@/components/room/room-header";
import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

type RoomPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function RoomPage(props: RoomPageProps) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const { id: roomId } = params;

  const supabase = await createServerClient();
  const participantId =
    typeof searchParams.pid === "string" ? searchParams.pid : undefined;

  if (!participantId) {
    return notFound();
  }

  const { data: participant, error: participantError } = await supabase
    .from("participants")
    .select("id, name, is_moderator")
    .eq("id", participantId)
    .eq("room_id", roomId)
    .single();

  if (participantError || !participant) {
    return notFound();
  }

  return (
    <div className="flex flex-col h-screen">
      <RoomHeader roomId={roomId} participantId={participant.id} />
      <main className="flex-grow container mx-auto px-4 py-6 overflow-y-auto">
        <RoomClientView
          roomId={roomId}
          participantId={participant.id}
          isModerator={participant.is_moderator}
          userName={participant.name}
        />
      </main>
    </div>
  );
}
