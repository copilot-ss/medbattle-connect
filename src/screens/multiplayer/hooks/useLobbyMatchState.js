import { useCallback, useEffect, useRef, useState } from 'react';
import { useConnectivity } from '../../../context/ConnectivityContext';
import { clearActiveLobby, saveActiveLobby } from '../../../utils/activeLobbyStorage';
import {
  deriveMatchRole,
  getMatchById,
  subscribeToMatch,
} from '../../../services/matchService';
import { resolveProgressiveMatch } from '../../../services/match/matchHelpers';

const LOBBY_MATCH_SYNC_INTERVAL_MS = 2500;

export default function useLobbyMatchState({
  navigation,
  userId,
  existingMatch,
  isCreateOnly,
  allowCompletedLobby = false,
  suppressActiveNavigation = false,
  onMatchActive = null,
  refreshMatches,
  setMatchesError,
  closingRef,
}) {
  const [currentMatch, setCurrentMatch] = useState(null);
  const [realtimeStatus, setRealtimeStatus] = useState('idle');
  const subscriptionRef = useRef(null);
  const handledActiveMatchIdRef = useRef(null);
  const { isOnline } = useConnectivity();
  const isOffline = isOnline === false;
  const lastOnlineRef = useRef(isOnline);

  const attachMatchSubscription = useCallback((matchId) => {
    if (subscriptionRef.current) {
      subscriptionRef.current();
      subscriptionRef.current = null;
    }

    setRealtimeStatus('subscribing');
    subscriptionRef.current = subscribeToMatch(
      matchId,
      (updated) => {
        setCurrentMatch((prev) => resolveProgressiveMatch(prev, updated));
      },
      {
        onStatus: (status) => {
          if (status === 'SUBSCRIBED' || status === 'EVENT') {
            setRealtimeStatus('ready');
            return;
          }

          if (
            status === 'CHANNEL_ERROR' ||
            status === 'TIMED_OUT' ||
            status === 'CLOSED' ||
            status === 'SUBSCRIBE_THROW'
          ) {
            setRealtimeStatus('fallback');
            return;
          }

          if (status === 'SUBSCRIBING') {
            setRealtimeStatus('subscribing');
          }
        },
      }
    );
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

    if (suppressActiveNavigation) {
      return;
    }

    const role = deriveMatchRole(currentMatch, userId);

    if (!role) {
      return;
    }

    if (currentMatch.status === 'active') {
      if (handledActiveMatchIdRef.current === currentMatch.id) {
        return;
      }
      handledActiveMatchIdRef.current = currentMatch.id;

      if (typeof onMatchActive === 'function') {
        try {
          onMatchActive({
            match: currentMatch,
            role,
          });
          return;
        } catch (err) {
          console.warn('Konnte Match-Start-Callback nicht ausfuehren:', err);
        }
      }

      navigation.replace('Quiz', {
        mode: 'multiplayer',
        matchId: currentMatch.id,
        joinCode: currentMatch.code,
        role,
      });
    }
  }, [
    currentMatch,
    navigation,
    onMatchActive,
    suppressActiveNavigation,
    userId,
  ]);

  useEffect(() => {
    if (
      !currentMatch ||
      currentMatch.status !== 'waiting' ||
      isOffline
    ) {
      return undefined;
    }

    let active = true;
    const intervalId = setInterval(async () => {
      try {
        const result = await getMatchById(currentMatch.id);
        if (active && result.ok && result.match) {
          setCurrentMatch((prev) => resolveProgressiveMatch(prev, result.match));
        }
      } catch (err) {
        console.warn('Konnte Lobby-Status nicht aktualisieren:', err);
      }
    }, realtimeStatus === 'ready' ? LOBBY_MATCH_SYNC_INTERVAL_MS : 1800);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [currentMatch, isOffline, realtimeStatus]);

  useEffect(() => {
    const wasOffline = lastOnlineRef.current === false && isOnline === true;
    lastOnlineRef.current = isOnline;

    if (!wasOffline || !currentMatch?.id || !userId) {
      return;
    }

    if (setMatchesError) {
      setMatchesError(null);
    }

    attachMatchSubscription(currentMatch.id);
    getMatchById(currentMatch.id)
      .then((result) => {
        if (result.ok && result.match) {
          setCurrentMatch((prev) => resolveProgressiveMatch(prev, result.match));
        }
      })
      .catch((err) => {
        console.warn('Konnte Lobby nach Reconnect nicht laden:', err);
        if (setMatchesError) {
          setMatchesError(err);
        }
      });
  }, [attachMatchSubscription, currentMatch?.id, isOnline, setMatchesError, userId]);

  useEffect(() => {
    if (currentMatch || !existingMatch) {
      return;
    }
    setCurrentMatch((prev) => resolveProgressiveMatch(prev, existingMatch));
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

    const shouldClearOnCancelled = currentMatch.status === 'cancelled';
    const shouldClearOnCompleted =
      currentMatch.status === 'completed' && !allowCompletedLobby;

    if (
      shouldClearOnCancelled ||
      shouldClearOnCompleted
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
        shouldClearOnCancelled &&
        !closingRef?.current &&
        setMatchesError
      ) {
        setMatchesError(new Error('Lobby wurde geschlossen.'));
      }
    }
  }, [
    allowCompletedLobby,
    closingRef,
    currentMatch,
    isCreateOnly,
    refreshMatches,
    setMatchesError,
  ]);

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
