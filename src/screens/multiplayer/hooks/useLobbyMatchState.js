import { useCallback, useEffect, useRef, useState } from 'react';
import { clearActiveLobby, saveActiveLobby } from '../../../utils/activeLobbyStorage';
import {
  deriveMatchRole,
  getMatchById,
  subscribeToMatch,
} from '../../../services/matchService';

export default function useLobbyMatchState({
  navigation,
  userId,
  difficulty,
  existingMatch,
  isCreateOnly,
  refreshMatches,
  setMatchesError,
  closingRef,
}) {
  const [currentMatch, setCurrentMatch] = useState(null);
  const subscriptionRef = useRef(null);

  const attachMatchSubscription = useCallback((matchId) => {
    if (subscriptionRef.current) {
      subscriptionRef.current();
      subscriptionRef.current = null;
    }

    subscriptionRef.current = subscribeToMatch(matchId, (updated) => {
      setCurrentMatch(updated);
    });
  }, []);

  useEffect(() => () => {
    if (subscriptionRef.current) {
      subscriptionRef.current();
      subscriptionRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!currentMatch || !userId) {
      return;
    }

    const role = deriveMatchRole(currentMatch, userId);

    if (!role) {
      return;
    }

    if (currentMatch.status === 'active') {
      navigation.replace('Quiz', {
        difficulty: currentMatch.difficulty ?? difficulty,
        mode: 'multiplayer',
        matchId: currentMatch.id,
        joinCode: currentMatch.code,
        role,
      });
    }
  }, [currentMatch, difficulty, navigation, userId]);

  useEffect(() => {
    if (!currentMatch || currentMatch.status !== 'waiting') {
      return undefined;
    }

    const intervalId = setInterval(async () => {
      try {
        const result = await getMatchById(currentMatch.id);
        if (result.ok && result.match) {
          setCurrentMatch(result.match);
        }
      } catch (err) {
        console.warn('Konnte Lobby-Status nicht aktualisieren:', err);
      }
    }, 4000);

    return () => clearInterval(intervalId);
  }, [currentMatch]);

  useEffect(() => {
    if (currentMatch || !existingMatch) {
      return;
    }
    setCurrentMatch(existingMatch);
    if (existingMatch.id) {
      attachMatchSubscription(existingMatch.id);
    }
  }, [attachMatchSubscription, currentMatch, existingMatch]);

  useEffect(() => {
    if (!currentMatch?.id || !userId) {
      return;
    }

    saveActiveLobby({
      matchId: currentMatch.id,
      code: currentMatch.code ?? null,
      userId,
    });
  }, [currentMatch?.code, currentMatch?.id, userId]);

  useEffect(() => {
    if (!currentMatch) {
      return;
    }

    if (
      currentMatch.status === 'cancelled' ||
      currentMatch.status === 'completed'
    ) {
      clearActiveLobby();
      if (subscriptionRef.current) {
        subscriptionRef.current();
        subscriptionRef.current = null;
      }

      setCurrentMatch(null);

      if (!isCreateOnly && refreshMatches) {
        refreshMatches({ force: true });
      }

      if (
        currentMatch.status === 'cancelled' &&
        !closingRef?.current &&
        setMatchesError
      ) {
        setMatchesError(new Error('Lobby wurde geschlossen.'));
      }
    }
  }, [closingRef, currentMatch, isCreateOnly, refreshMatches, setMatchesError]);

  useEffect(() => {
    if (!currentMatch || !userId) {
      return;
    }

    const role = deriveMatchRole(currentMatch, userId);
    if (role) {
      return;
    }

    clearActiveLobby();
    setCurrentMatch(null);
    if (!closingRef?.current && setMatchesError) {
      setMatchesError(new Error('Du wurdest aus der Lobby entfernt.'));
    }
  }, [closingRef, currentMatch, setMatchesError, userId]);

  return {
    currentMatch,
    setCurrentMatch,
    attachMatchSubscription,
  };
}
