import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useConnectivity } from '../../../context/ConnectivityContext';
import { fetchOpenMatches } from '../../../services/matchService';
import { normalizeDifficulty } from '../../../services/match/matchHelpers';

export default function useLobbyOpenMatches({
  difficulty,
  isCreateOnly,
  userId,
  setMatchesError,
}) {
  const { isOnline } = useConnectivity();
  const isOffline = isOnline === false;
  const [openMatches, setOpenMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(!isCreateOnly);

  const sortByPreferredDifficulty = useCallback(
    (matches) => {
      const preferredDifficulty = normalizeDifficulty(difficulty);
      const source = Array.isArray(matches) ? matches : [];
      return [...source].sort((a, b) => {
        const aPreferred = a?.difficulty === preferredDifficulty ? 0 : 1;
        const bPreferred = b?.difficulty === preferredDifficulty ? 0 : 1;
        if (aPreferred !== bPreferred) {
          return aPreferred - bPreferred;
        }
        const aCreated = Date.parse(a?.createdAt ?? '');
        const bCreated = Date.parse(b?.createdAt ?? '');
        if (Number.isFinite(aCreated) && Number.isFinite(bCreated)) {
          return aCreated - bCreated;
        }
        return 0;
      });
    },
    [difficulty]
  );

  const refreshMatches = useCallback(
    async ({ force = false } = {}) => {
      if (isCreateOnly) {
        setOpenMatches([]);
        setMatchesLoading(false);
        return;
      }

      if (isOffline) {
        setMatchesLoading(false);
        return;
      }

      setMatchesLoading(true);
      if (setMatchesError) {
        setMatchesError(null);
      }

      try {
        const matches = await fetchOpenMatches({
          difficulty: null,
          force,
          excludeHostId: userId,
        });
        setOpenMatches(sortByPreferredDifficulty(matches));
      } catch (err) {
        console.warn('Konnte offene Matches nicht laden:', err);
        if (setMatchesError) {
          setMatchesError(err);
        }
      } finally {
        setMatchesLoading(false);
      }
    },
    [isCreateOnly, isOffline, setMatchesError, sortByPreferredDifficulty, userId]
  );

  useFocusEffect(
    useCallback(() => {
      if (!userId || isCreateOnly || isOffline) {
        return () => {};
      }

      refreshMatches();

      return () => {};
    }, [isCreateOnly, isOffline, refreshMatches, userId])
  );

  useEffect(() => {
    if (!userId || isCreateOnly || isOffline) {
      return () => {};
    }

    const intervalId = setInterval(() => {
      refreshMatches({ force: true });
    }, 15000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isCreateOnly, isOffline, refreshMatches, userId]);

  useEffect(() => {
    if (!userId || isCreateOnly || isOffline) {
      return;
    }
    refreshMatches({ force: true });
  }, [isCreateOnly, isOffline, refreshMatches, userId]);

  return {
    openMatches,
    matchesLoading,
    refreshMatches,
  };
}
