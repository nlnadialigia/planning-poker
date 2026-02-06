import {useQuery} from "@tanstack/react-query";

export function useRoomQuery(roomId: string, participantId: string) {
  return useQuery({
    queryKey: ["room", roomId, participantId],
    queryFn: async () => {
      const response = await fetch(`/api/room/${roomId}?pid=${participantId}`);
      if (!response.ok) {
        throw new Error("Falha ao buscar dados da sala");
      }
      return response.json();
    },
    refetchInterval: 2000,
  });
}
