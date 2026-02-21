import { useEffect, useRef, useState } from 'react';
import { deriveMatchRole, getMatchById } from '../../services/matchService';
import { clearActiveLobby, loadActiveLobby } from '../../utils/activeLobbyStorage';

export default function useHomeActiveLobby({
  routeLobby,
  isOffline,
  userId,
  lobbyCapacity,
}) {
  const [activeLobbyState, setActiveLobbyState] = useState(null);
  const restoreAttemptedRef = useRef(false);
  const activeLobby = routeLobby === undefined ? activeLobbyState : routeLobby;
  const hasLobby = Boolean(activeLobby?.code);
  const hasActiveLobby = hasLobby && !isOffline;

  useEffect(() => {
    if (routeLobby === undefined) {
      return;
    }
    if (routeLobby === null) {
      setActiveLobbyState(null);
      clearActiveLobby();
      return;
    }
    setActiveLobbyState(routeLobby);
  }, [routeLobby]);

  useEffect(() => {
    restoreAttemptedRef.current = false;
  }, [isOffline, routeLobby, userId]);

  useEffect(() => {
    let active = true;

    if (
      routeLobby !== undefined ||
      activeLobbyState ||
      isOffline ||
      !userId ||
      restoreAttemptedRef.current
    ) {
      return () => {
        active = false;
      };
    }

    restoreAttemptedRef.current = true;

    const restoreLobby = async () => {
      const stored = await loadActiveLobby();
      if (!active || !stored?.matchId) {
        return;
      }

      if (stored.userId && stored.userId !== userId) {
        await clearActiveLobby();
        return;
      }

      const result = await getMatchById(stored.matchId);
      if (!active || !result.ok || !result.match) {
        return;
      }

      if (
        result.match.status === 'cancelled' ||
        result.match.status === 'completed'
      ) {
        await clearActiveLobby();
        return;
      }

      const role = deriveMatchRole(result.match, userId);
      if (!role) {
        await clearActiveLobby();
        return;
      }

      const players = result.match.state
        ? [result.match.state.host, result.match.state.guest].filter(
            (player) => player?.userId
          ).length
        : 1;

      setActiveLobbyState({
        code: result.match.code ?? stored.code ?? null,
        players,
        capacity: lobbyCapacity,
        existingMatch: result.match,
      });
    };

    restoreLobby().catch((err) => {
      if (active) {
        console.warn('Konnte Lobby nicht wiederherstellen:', err);
      }
    });

    return () => {
      active = false;
    };
  }, [activeLobbyState, isOffline, lobbyCapacity, routeLobby, userId]);

  return {
    activeLobby,
    hasLobby,
    hasActiveLobby,
  };
}
