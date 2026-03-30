import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useConnectivity } from '../../../context/ConnectivityContext';
import { fetchOpenMatches } from '../../../services/matchService';

export default function useLobbyOpenMatches({
  isCreateOnly,
  userId,
  setMatchesError,
}) {
  const { isOnline } = useConnectivity();
  const isOffline = isOnline === false;
  const [openMatches, setOpenMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(!isCreateOnly);

  const sortOpenMatches = useCallback((matches) => {
    const source = Array.isArray(matches) ? matches : [];
    return [...source].sort((a, b) => {
      const aCreated = Date.parse(a?.createdAt ?? '');
      const bCreated = Date.parse(b?.createdAt ?? '');
      if (Number.isFinite(aCreated) && Number.isFinite(bCreated)) {
        return aCreated - bCreated;
      }
      return 0;
    });
  }, []);

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
          force,
          excludeHostId: userId,
        });
        setOpenMatches(sortOpenMatches(matches));
      } catch (err) {
        console.warn('Konnte offene Matches nicht laden:', err);
        if (setMatchesError) {
          setMatchesError(err);
        }
      } finally {
        setMatchesLoading(false);
      }
    },
    [isCreateOnly, isOffline, setMatchesError, sortOpenMatches, userId]
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
  return {
    openMatches,
    matchesLoading,
    refreshMatches,
  };
}
