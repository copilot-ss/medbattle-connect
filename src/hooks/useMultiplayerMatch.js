import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useConnectivity } from '../context/ConnectivityContext';

import {
  abandonMatch,
  deriveMatchRole,
  getMatchById,
  markPlayerFinished,
  subscribeToMatch,
  updateMatchProgress,
} from '../services/matchService';

function ensurePlayerState(match, role) {
  if (!match || !match.state) {
    return {
      userId: null,
      username: null,
      index: 0,
      score: 0,
      finished: false,
      answers: [],
    };
  }

  const state = match.state[role];

  if (!state || typeof state !== 'object') {
    return {
      userId: null,
      username: null,
      index: 0,
      score: 0,
      finished: false,
      answers: [],
    };
  }

  return {
    userId: state.userId ?? null,
    username: state.username ?? null,
    index: Number.isFinite(state.index) ? Math.max(state.index, 0) : 0,
    score: Number.isFinite(state.score) ? Math.max(state.score, 0) : 0,
    finished: Boolean(state.finished),
    answers: Array.isArray(state.answers) ? state.answers : [],
    gaveUp: Boolean(state.gaveUp),
  };
}

export default function useMultiplayerMatch(matchId, userId, options = {}) {
  const [state, setState] = useState(() => ({
    loading: Boolean(matchId),
    match: null,
    error: null,
  }));
  const lastLoadedIdRef = useRef(null);
  const { isOnline } = useConnectivity();
  const isOffline = isOnline === false;
  const lastOnlineRef = useRef(isOnline);

  const expectedDifficulty = options.expectedDifficulty ?? null;

  const loadMatch = useCallback(
    async ({ skipIfSame = false } = {}) => {
      if (!matchId || !userId) {
        return;
      }

      if (skipIfSame && lastLoadedIdRef.current === matchId) {
        return;
      }

      if (isOffline) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: prev.match ? prev.error : new Error('Offline. Match konnte nicht geladen werden.'),
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      const result = await getMatchById(matchId);

      if (!result.ok) {
        setState((prev) => ({
          ...prev,
          loading: false,
          match: prev.match ?? null,
          error: result.error ?? new Error('Match konnte nicht geladen werden.'),
        }));
        return;
      }

      const match = result.match;
      const role = deriveMatchRole(match, userId);

      if (!role) {
        setState((prev) => ({
          ...prev,
          loading: false,
          match: null,
          error: new Error('Dieses Match gehört dir nicht oder ist nicht mehr verfügbar.'),
        }));
        return;
      }

      if (
        expectedDifficulty &&
        match.difficulty &&
        expectedDifficulty !== match.difficulty
      ) {
        console.warn(
          `Unerwartete Schwierigkeit im Match. Erwartet: ${expectedDifficulty}, erhalten: ${match.difficulty}`
        );
      }

      lastLoadedIdRef.current = match.id;
      setState({
        loading: false,
        match,
        error: null,
      });
    },
    [expectedDifficulty, isOffline, matchId, userId]
  );

  useEffect(() => {
    let active = true;

    if (!matchId || !userId) {
      setState({
        loading: false,
        match: null,
        error: null,
      });
      return () => {
        active = false;
      };
    }

    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
    }));

    loadMatch()
      .catch((err) => {
        if (!active) {
          return;
        }
        console.error('Match konnte nicht initialisiert werden:', err);
        setState((prev) => ({
          ...prev,
          loading: false,
          match: null,
          error: err,
        }));
      });

    return () => {
      active = false;
    };
  }, [loadMatch, matchId, userId]);

  useEffect(() => {
    if (!matchId || !userId || isOffline) {
      return () => {};
    }

    const unsubscribe = subscribeToMatch(matchId, (updated) => {
      if (!updated) {
        return;
      }

      const role = deriveMatchRole(updated, userId);

      if (!role) {
        return;
      }

      setState((prev) => ({
        loading: false,
        match: updated,
        error: null,
      }));
    });

    return () => {
      unsubscribe();
    };
  }, [isOffline, matchId, userId]);

  useEffect(() => {
    const wasOffline = lastOnlineRef.current === false && isOnline === true;
    lastOnlineRef.current = isOnline;

    if (!wasOffline || !matchId || !userId) {
      return;
    }

    loadMatch({ skipIfSame: false }).catch((err) => {
      console.warn('Match konnte nach Reconnect nicht geladen werden:', err);
    });
  }, [isOnline, loadMatch, matchId, userId]);

  const role = useMemo(
    () => deriveMatchRole(state.match, userId),
    [state.match, userId]
  );

  const questions = useMemo(
    () => (Array.isArray(state.match?.questions) ? state.match.questions : []),
    [state.match?.questions]
  );

  const playerState = useMemo(
    () => ensurePlayerState(state.match, role),
    [role, state.match]
  );

  const opponentRole = role === 'host' ? 'guest' : 'host';

  const opponentState = useMemo(
    () => ensurePlayerState(state.match, opponentRole),
    [opponentRole, state.match]
  );

  const recordAnswer = useCallback(
    async ({
      questionId,
      selectedOption,
      correct,
      durationMs,
      timedOut = false,
    } = {}) => {
      if (!state.match || !role) {
        return { ok: false, error: new Error('Kein aktives Match vorhanden.') };
      }
      if (isOffline) {
        return { ok: false, error: new Error('Offline. Antwort konnte nicht gesendet werden.') };
      }

      const nextIndex = Math.min(playerState.index + 1, questions.length);
      const nextScore = correct ? playerState.score + 1 : playerState.score;
      const finished = nextIndex >= questions.length;

      const response = await updateMatchProgress({
        match: state.match,
        role,
        nextIndex,
        nextScore,
        finished,
        answer: {
          questionId,
          selectedOption,
          correct,
          durationMs,
          timedOut,
        },
      });

      if (response.ok && response.match) {
        setState({
          loading: false,
          match: response.match,
          error: null,
        });
      } else if (!response.ok) {
        setState((prev) => ({
          ...prev,
          error: response.error ?? new Error('Match konnte nicht aktualisiert werden.'),
        }));
        try {
          await loadMatch({ skipIfSame: false });
        } catch (reloadError) {
          console.warn('Match-Reload nach Fehler fehlgeschlagen:', reloadError);
        }
      }

      return response;
    },
    [
      isOffline,
      loadMatch,
      playerState.index,
      playerState.score,
      questions.length,
      role,
      state.match,
    ]
  );

  const finishMatch = useCallback(async () => {
    if (!state.match || !role) {
      return { ok: false, error: new Error('Kein aktives Match vorhanden.') };
    }

    const response = await markPlayerFinished({
      match: state.match,
      role,
    });

    if (response.ok && response.match) {
      setState({
        loading: false,
        match: response.match,
        error: null,
      });
    }

    return response;
  }, [role, state.match]);

  const surrender = useCallback(async () => {
    if (!state.match || !role) {
      return { ok: false, error: new Error('Kein aktives Match vorhanden.') };
    }

    const response = await abandonMatch({
      match: state.match,
      role,
    });

    if (response.ok && response.match) {
      setState({
        loading: false,
        match: response.match,
        error: null,
      });
    }

    return response;
  }, [role, state.match]);

  const reload = useCallback(
    () => loadMatch({ skipIfSame: false }),
    [loadMatch]
  );

  return {
    loading: state.loading,
    error: state.error,
    match: state.match,
    role,
    questions,
    status: state.match?.status ?? null,
    joinCode: state.match?.code ?? null,
    player: playerState,
    opponent: opponentState,
    recordAnswer,
    finishMatch,
    surrender,
    refetch: reload,
  };
}
