import { useCallback, useState } from 'react';
import {
  abandonMatch,
  createMatch,
  deriveMatchRole,
  getMatchById,
  startMatch,
} from '../../../services/matchService';
import {
  clearActiveLobby,
  loadActiveLobby,
} from '../../../utils/activeLobbyStorage';

export default function useLobbyCreateAndStartActions({
  userId,
  t,
  language,
  isCreateOnly,
  currentMatch,
  setCurrentMatch,
  existingMatch,
  attachMatchSubscription,
  refreshMatches,
  selectedDifficulty,
  selectedCategory,
  questionLimit,
  setSelectedDifficulty,
  setSelectedCategory,
  setQuestionLimit,
  setMatchesError,
  closingRef,
  isHostWaiting,
  hasEnoughPlayers,
}) {
  const [creating, setCreating] = useState(false);
  const [startingMatch, setStartingMatch] = useState(false);

  const handleCreateMatch = useCallback(async () => {
    if (!userId || creating) {
      return;
    }

    setCreating(true);
    setMatchesError(null);

    try {
      let matchToClose = currentMatch ?? existingMatch ?? null;

      if (!matchToClose) {
        const stored = await loadActiveLobby();
        if (stored?.matchId) {
          const result = await getMatchById(stored.matchId);
          if (result.ok && result.match) {
            matchToClose = result.match;
          }
        }
      }

      if (matchToClose?.id && matchToClose.status === 'waiting') {
        const role = deriveMatchRole(matchToClose, userId);
        if (role) {
          closingRef.current = true;
          try {
            await abandonMatch({ match: matchToClose, role });
          } finally {
            closingRef.current = false;
          }
        }

        if (currentMatch?.id === matchToClose.id) {
          setCurrentMatch(null);
        }
        await clearActiveLobby();
      }

      const result = await createMatch({
        difficulty: selectedDifficulty,
        questionLimit,
        category: selectedCategory,
        language,
        fallbackLanguage: language === 'de' ? 'de' : null,
        userId,
      });

      if (!result.ok) {
        throw result.error ?? new Error(t('Match konnte nicht erstellt werden.'));
      }

      setCurrentMatch(result.match);
      setQuestionLimit(result.match.question_limit ?? questionLimit);
      setSelectedDifficulty(result.match.difficulty ?? selectedDifficulty);
      setSelectedCategory(result.match.category ?? selectedCategory);
      attachMatchSubscription(result.match.id);
    } catch (err) {
      console.error('Fehler beim Erstellen eines Matches:', err);
      setMatchesError(err);
    } finally {
      setCreating(false);
      if (!isCreateOnly) {
        refreshMatches({ force: true });
      }
    }
  }, [
    attachMatchSubscription,
    creating,
    currentMatch,
    existingMatch,
    isCreateOnly,
    language,
    questionLimit,
    refreshMatches,
    selectedCategory,
    selectedDifficulty,
    setCurrentMatch,
    setMatchesError,
    setQuestionLimit,
    setSelectedCategory,
    setSelectedDifficulty,
    t,
    userId,
    closingRef,
  ]);

  const handleStartMatch = useCallback(async () => {
    if (!isHostWaiting || !currentMatch || startingMatch || !hasEnoughPlayers) {
      return;
    }

    setStartingMatch(true);
    setMatchesError(null);

    try {
      const result = await startMatch({
        matchId: currentMatch.id,
        userId,
      });

      if (!result.ok) {
        throw result.error ?? new Error(t('Match konnte nicht gestartet werden.'));
      }

      setCurrentMatch(result.match);
    } catch (err) {
      console.error('Fehler beim Starten des Matches:', err);
      setMatchesError(err);
    } finally {
      setStartingMatch(false);
    }
  }, [
    currentMatch,
    hasEnoughPlayers,
    isHostWaiting,
    setCurrentMatch,
    setMatchesError,
    startingMatch,
    t,
    userId,
  ]);

  return {
    creating,
    startingMatch,
    handleCreateMatch,
    handleStartMatch,
  };
}
