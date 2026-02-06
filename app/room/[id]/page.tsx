import {RoomClientView} from "@/components/room/room-client-view";
import {RoomHeader} from "@/components/room/room-header";
import {participantService} from "@/lib/services/participant.service";
import {notFound} from "next/navigation";

type RoomPageProps = {
  params: Promise<{id: string;}>;
  searchParams: Promise<{[key: string]: string | string[] | undefined;}>;
};

export default async function RoomPage(props: RoomPageProps) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const {id: roomId} = params;

  const participantId =
    typeof searchParams.pid === "string" ? searchParams.pid : undefined;

  if (!participantId) {
    return notFound();
  }

  try {
    const participant = await participantService.getParticipantById(participantId);

    if (!participant || participant.roomId !== roomId) {
      return notFound();
    }

    return (
      <div className="flex flex-col h-screen">
        <RoomHeader
          roomId={roomId}
          participantId={participant.id}
          roomName={participant.room.name}
          roomCode={participant.room.code}
        />
        <main className="flex-grow container mx-auto px-4 py-6 overflow-y-auto">
          <RoomClientView
            roomId={roomId}
            participantId={participant.id}
            isModerator={participant.isModerator}
            userName={participant.name}
          />
        </main>
      </div>
    );
  } catch (error) {
    console.error("Erro ao carregar sala:", error);
    return notFound();
  }
}
