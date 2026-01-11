import { useEffect, useRef } from 'react';
import { useConnectivity } from '../context/ConnectivityContext';
import { usePreferences } from '../context/PreferencesContext';
import useSupabaseUserId from './useSupabaseUserId';
import { flushQueuedScores } from '../services/quizService';
import { fetchUserProgress, flushQueuedProgress } from '../services/userProgressService';

function sanitizeStatNumber(value) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isFinite(parsed) && parsed >= 0) {
    return parsed;
  }
  return 0;
}

export default function useOfflineSync() {
  const { isOnline } = useConnectivity();
  const { updateUserStats } = usePreferences();
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
    Promise.all([flushQueuedScores(userId), flushQueuedProgress(userId)])
      .then(async () => {
        const progress = await fetchUserProgress(userId, { force: true });
        if (progress?.ok && progress.progress) {
          updateUserStats((current) => ({
            quizzes: Math.max(
              sanitizeStatNumber(current?.quizzes),
              sanitizeStatNumber(progress.progress.quizzes)
            ),
            correct: Math.max(
              sanitizeStatNumber(current?.correct),
              sanitizeStatNumber(progress.progress.correct)
            ),
            questions: Math.max(
              sanitizeStatNumber(current?.questions),
              sanitizeStatNumber(progress.progress.questions)
            ),
            xp: Math.max(
              sanitizeStatNumber(current?.xp),
              sanitizeStatNumber(progress.progress.xp)
            ),
          }));
        }
      })
      .catch((err) => {
        console.warn('Konnte Offline-Sync nicht abschliessen:', err);
      })
      .finally(() => {
        syncingRef.current = false;
      });
  }, [isOnline, updateUserStats, userId]);
}
