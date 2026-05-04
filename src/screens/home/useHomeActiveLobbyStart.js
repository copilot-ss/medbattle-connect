import { useCallback, useEffect } from 'react';
import useMatchStartCountdown from '../../hooks/useMatchStartCountdown';
import {
  deriveMatchRole,
  getMatchById,
  subscribeToMatch,
} from '../../services/matchService';

function resolveQuizNavigator(navigation) {
  const parentNavigation =
    typeof navigation?.getParent === 'function' ? navigation.getParent() : null;

  if (parentNavigation && typeof parentNavigation.push === 'function') {
    return parentNavigation.push.bind(parentNavigation);
  }
  if (typeof navigation?.push === 'function') {
    return navigation.push.bind(navigation);
  }
  return navigation.navigate.bind(navigation);
}

function hasFinishedCurrentActiveMatch(match, role) {
  if (!match || match.status !== 'active') {
    return false;
  }
  if (!role) {
    return false;
  }
  return Boolean(match.state?.[role]?.finished);
}

export default function useHomeActiveLobbyStart({
  activeLobby,
  navigation,
  userId,
}) {
  const activeMatch = activeLobby?.existingMatch ?? null;
  const activeMatchId = activeMatch?.id ?? null;
  const navigateToQuiz = useCallback(
    ({ match, role, preloadedMatch }) => {
      const openQuiz = resolveQuizNavigator(navigation);
      openQuiz('Quiz', {
        mode: 'multiplayer',
        matchId: match.id,
        joinCode: match.code,
        role,
        preloadedMatch,
      });
    },
    [navigation]
  );
  const {
    showStartCountdown,
    startCountdownValue,
    beginMatchStartCountdown,
    resetStartCountdown,
  } = useMatchStartCountdown({
    fetchLatestMatchById: getMatchById,
    onNavigate: navigateToQuiz,
  });

  useEffect(() => {
    if (!activeMatchId || !userId) {
      resetStartCountdown();
      return undefined;
    }

    let active = true;

    const maybeStartMatch = (match) => {
      if (!active || !match?.id || match.status !== 'active') {
        return;
      }

      const role = deriveMatchRole(match, userId);
      if (!role) {
        return;
      }

      if (hasFinishedCurrentActiveMatch(match, role)) {
        return;
      }

      beginMatchStartCountdown({ match, role });
    };

    maybeStartMatch(activeMatch);

    getMatchById(activeMatchId)
      .then((result) => {
        if (result?.ok && result.match) {
          maybeStartMatch(result.match);
        }
      })
      .catch((err) => {
        console.warn('Konnte aktives Home-Lobby-Match nicht laden:', err);
      });

    const unsubscribe = subscribeToMatch(activeMatchId, (updatedMatch) => {
      maybeStartMatch(updatedMatch);
    });

    return () => {
      active = false;
      unsubscribe();
      resetStartCountdown();
    };
  }, [
    activeMatch,
    activeMatchId,
    beginMatchStartCountdown,
    resetStartCountdown,
    userId,
  ]);

  return {
    showStartCountdown,
    startCountdownValue,
  };
}
