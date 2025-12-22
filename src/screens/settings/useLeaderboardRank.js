import { useEffect, useState } from 'react';
import { fetchLeaderboard } from '../../services/quizService';

export default function useLeaderboardRank(userId) {
  const [rank, setRank] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadRank() {
      if (!userId) {
        if (!cancelled) {
          setRank(null);
        }
        return;
      }

      setLoading(true);
      try {
        const board = await fetchLeaderboard(300, { force: true });
        const index = Array.isArray(board)
          ? board.findIndex((entry) => entry.userId === userId)
          : -1;
        if (!cancelled) {
          setRank(index >= 0 ? index + 1 : null);
        }
      } catch (err) {
        if (!cancelled) {
          setRank(null);
        }
        console.warn('Konnte Leaderboard-Rang nicht laden:', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadRank();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { rank, loading };
}
