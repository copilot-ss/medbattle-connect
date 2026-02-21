import { useCallback, useEffect, useState } from 'react';
import { kickMatchGuest } from '../../../services/matchService';

export default function useLobbyKickGuest({
  currentMatch,
  isHostWaiting,
  userId,
  participants,
  setCurrentMatch,
  setMatchesError,
  t,
}) {
  const [kickCandidateKey, setKickCandidateKey] = useState(null);
  const [kickingPlayer, setKickingPlayer] = useState(false);

  const handleSelectParticipant = useCallback(
    (participantKey) => {
      if (!isHostWaiting || participantKey !== 'guest') {
        return;
      }
      setKickCandidateKey((prev) => (
        prev === participantKey ? null : participantKey
      ));
    },
    [isHostWaiting]
  );

  const handleKickGuest = useCallback(async () => {
    if (!currentMatch || !isHostWaiting || kickingPlayer) {
      return false;
    }

    setKickingPlayer(true);
    setMatchesError(null);

    try {
      const result = await kickMatchGuest({
        matchId: currentMatch.id,
        userId,
      });

      if (!result.ok) {
        throw result.error ?? new Error(t('Spieler konnte nicht entfernt werden.'));
      }

      setCurrentMatch(result.match);
      setKickCandidateKey(null);
      return true;
    } catch (err) {
      console.error('Fehler beim Entfernen des Spielers:', err);
      setMatchesError(err);
      return false;
    } finally {
      setKickingPlayer(false);
    }
  }, [
    currentMatch,
    isHostWaiting,
    kickingPlayer,
    setCurrentMatch,
    setMatchesError,
    t,
    userId,
  ]);

  useEffect(() => {
    if (!kickCandidateKey) {
      return;
    }
    if (!isHostWaiting) {
      setKickCandidateKey(null);
      return;
    }
    const exists = participants.some((participant) => participant.key === kickCandidateKey);
    if (!exists) {
      setKickCandidateKey(null);
    }
  }, [isHostWaiting, kickCandidateKey, participants]);

  return {
    kickCandidateKey,
    kickingPlayer,
    handleSelectParticipant,
    handleKickGuest,
  };
}
