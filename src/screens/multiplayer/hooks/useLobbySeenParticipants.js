import { useEffect, useRef } from 'react';

export default function useLobbySeenParticipants({
  currentJoinCode,
  lobbyParticipants,
}) {
  const seenLobbyUserIdsRef = useRef(new Set());

  useEffect(() => {
    if (!currentJoinCode) {
      seenLobbyUserIdsRef.current = new Set();
      return;
    }

    const next = new Set(seenLobbyUserIdsRef.current);
    (lobbyParticipants ?? []).forEach((entry) => {
      if (entry?.userId && entry?.inCurrentLobby) {
        next.add(entry.userId);
      }
    });
    seenLobbyUserIdsRef.current = next;
  }, [currentJoinCode, lobbyParticipants]);

  return seenLobbyUserIdsRef;
}
