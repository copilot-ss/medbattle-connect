import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { fetchOpenMatches } from '../../../services/matchService';

export default function useLobbyOpenMatches({
  difficulty,
  isCreateOnly,
  userId,
  setMatchesError,
}) {
  const [openMatches, setOpenMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(!isCreateOnly);

  const refreshMatches = useCallback(
    async ({ force = false } = {}) => {
      if (isCreateOnly) {
        setOpenMatches([]);
        setMatchesLoading(false);
        return;
      }

      setMatchesLoading(true);
      if (setMatchesError) {
        setMatchesError(null);
      }

      try {
        const matches = await fetchOpenMatches({
          difficulty,
          force,
        });
        setOpenMatches(matches);
      } catch (err) {
        console.warn('Konnte offene Matches nicht laden:', err);
        if (setMatchesError) {
          setMatchesError(err);
        }
      } finally {
        setMatchesLoading(false);
      }
    },
    [difficulty, isCreateOnly, setMatchesError]
  );

  useFocusEffect(
    useCallback(() => {
      if (!userId || isCreateOnly) {
        return () => {};
      }

      refreshMatches();

      return () => {};
    }, [isCreateOnly, refreshMatches, userId])
  );

  useEffect(() => {
    if (!userId || isCreateOnly) {
      return () => {};
    }

    const intervalId = setInterval(() => {
      refreshMatches({ force: true });
    }, 15000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isCreateOnly, refreshMatches, userId]);

  return {
    openMatches,
    matchesLoading,
    refreshMatches,
  };
}
