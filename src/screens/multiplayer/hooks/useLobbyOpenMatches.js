import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useConnectivity } from '../../../context/ConnectivityContext';
import { fetchOpenMatches } from '../../../services/matchService';

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
          difficulty,
          force,
          excludeHostId: userId,
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
    [difficulty, isCreateOnly, isOffline, setMatchesError, userId]
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
