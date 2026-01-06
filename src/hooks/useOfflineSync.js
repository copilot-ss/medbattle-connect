import { useEffect, useRef } from 'react';
import { useConnectivity } from '../context/ConnectivityContext';
import useSupabaseUserId from './useSupabaseUserId';
import { flushQueuedScores } from '../services/quizService';

export default function useOfflineSync() {
  const { isOnline } = useConnectivity();
  const userId = useSupabaseUserId();
  const syncingRef = useRef(false);

  useEffect(() => {
    if (!isOnline || !userId || userId === 'guest') {
      return;
    }
    if (syncingRef.current) {
      return;
    }

    syncingRef.current = true;
    flushQueuedScores(userId)
      .catch((err) => {
        console.warn('Konnte Offline-Scores nicht synchronisieren:', err);
      })
      .finally(() => {
        syncingRef.current = false;
      });
  }, [isOnline, userId]);
}
