import { useCallback, useEffect, useRef, useState } from 'react';
import { updateMatchSettings } from '../../../services/matchService';
import {
  DEFAULT_QUESTION_LIMIT,
  MAX_QUESTION_LIMIT,
  MIN_QUESTION_LIMIT,
} from '../lobbyConstants';

export default function useLobbyHostSettings({
  initialDifficulty,
  initialCategory,
  currentMatch,
  isHostWaiting,
  language,
  userId,
  setCurrentMatch,
  setMatchesError,
  t,
}) {
  const [selectedDifficulty, setSelectedDifficulty] = useState(initialDifficulty);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [questionLimit, setQuestionLimit] = useState(DEFAULT_QUESTION_LIMIT);
  const [updatingSettings, setUpdatingSettings] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [draftDifficulty, setDraftDifficulty] = useState(initialDifficulty);
  const [draftQuestionLimit, setDraftQuestionLimit] = useState(DEFAULT_QUESTION_LIMIT);
  const hostSettingsVersionRef = useRef(0);

  useEffect(() => {
    if (currentMatch?.category && currentMatch.category !== selectedCategory) {
      setSelectedCategory(currentMatch.category);
    }
  }, [currentMatch?.category, selectedCategory]);

  useEffect(() => {
    if (!currentMatch) {
      return;
    }

    if (
      currentMatch.question_limit &&
      currentMatch.question_limit !== questionLimit
    ) {
      setQuestionLimit(currentMatch.question_limit);
    }

    if (
      currentMatch.difficulty &&
      currentMatch.difficulty !== selectedDifficulty
    ) {
      setSelectedDifficulty(currentMatch.difficulty);
    }
  }, [currentMatch, questionLimit, selectedDifficulty]);

  const pushHostSettings = useCallback(
    async (nextDifficulty, nextQuestionLimit) => {
      if (!isHostWaiting || !currentMatch || updatingSettings) {
        return;
      }

      const requestVersion = hostSettingsVersionRef.current + 1;
      hostSettingsVersionRef.current = requestVersion;
      setUpdatingSettings(true);
      setMatchesError(null);

      try {
        const result = await updateMatchSettings({
          matchId: currentMatch.id,
          userId,
          difficulty: nextDifficulty,
          questionLimit: nextQuestionLimit,
          language,
          fallbackLanguage: language === 'de' ? 'de' : null,
        });

        if (!result.ok) {
          throw result.error ?? new Error(t('Einstellungen konnten nicht gespeichert werden.'));
        }

        if (requestVersion === hostSettingsVersionRef.current) {
          setCurrentMatch(result.match);
          setQuestionLimit(result.match.question_limit ?? nextQuestionLimit);
          setSelectedDifficulty(result.match.difficulty ?? nextDifficulty);
          setSelectedCategory(result.match.category ?? selectedCategory);
        }
      } catch (err) {
        console.error('Fehler beim Aktualisieren der Lobby-Einstellungen:', err);
        setMatchesError(err);
      } finally {
        if (requestVersion === hostSettingsVersionRef.current) {
          setUpdatingSettings(false);
        }
      }
    },
    [
      currentMatch,
      isHostWaiting,
      language,
      selectedCategory,
      setCurrentMatch,
      setMatchesError,
      t,
      updatingSettings,
      userId,
    ]
  );

  const handleOpenSettings = useCallback(() => {
    if (!isHostWaiting) {
      return;
    }

    setDraftDifficulty(selectedDifficulty);
    setDraftQuestionLimit(questionLimit);
    setShowSettingsModal(true);
  }, [isHostWaiting, questionLimit, selectedDifficulty]);

  const handleApplySettings = useCallback(() => {
    setShowSettingsModal(false);

    if (!isHostWaiting || !currentMatch) {
      return;
    }

    if (
      draftDifficulty === selectedDifficulty &&
      draftQuestionLimit === questionLimit
    ) {
      return;
    }

    pushHostSettings(draftDifficulty, draftQuestionLimit);
  }, [
    currentMatch,
    draftDifficulty,
    draftQuestionLimit,
    isHostWaiting,
    pushHostSettings,
    questionLimit,
    selectedDifficulty,
  ]);

  const adjustDraftQuestionLimit = useCallback((delta) => {
    setDraftQuestionLimit((prev) => {
      const next = prev + delta;
      if (next < MIN_QUESTION_LIMIT) {
        return MIN_QUESTION_LIMIT;
      }
      if (next > MAX_QUESTION_LIMIT) {
        return MAX_QUESTION_LIMIT;
      }
      return next;
    });
  }, []);

  return {
    selectedDifficulty,
    setSelectedDifficulty,
    selectedCategory,
    setSelectedCategory,
    questionLimit,
    setQuestionLimit,
    updatingSettings,
    showSettingsModal,
    draftDifficulty,
    draftQuestionLimit,
    setDraftDifficulty,
    adjustDraftQuestionLimit,
    handleOpenSettings,
    handleApplySettings,
  };
}
