import { useEffect, useRef, useState } from 'react';
import { deriveMatchRole, getMatchById } from '../../services/matchService';
import { clearActiveLobby, loadActiveLobby } from '../../utils/activeLobbyStorage';
import {
  buildActiveLobbyPayload,
  shouldPersistActiveLobby,
} from '../multiplayer/lobbyUtils';

function hasPlayerAbandonedMatch(match, role) {
  if (!match?.state || !role) {
    return false;
  }
  return Boolean(match.state?.[role]?.gaveUp);
}

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

      if (!shouldPersistActiveLobby(result.match)) {
        await clearActiveLobby();
        return;
      }

      const role = deriveMatchRole(result.match, userId);
      if (!role) {
        await clearActiveLobby();
        return;
      }

      if (hasPlayerAbandonedMatch(result.match, role)) {
        await clearActiveLobby();
        return;
      }

      setActiveLobbyState({
        ...buildActiveLobbyPayload(result.match, lobbyCapacity),
        code: result.match.code ?? stored.code ?? null,
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
