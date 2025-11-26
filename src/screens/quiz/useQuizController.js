import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { usePreferences } from '../../context/PreferencesContext';
import useCountdownTimer from '../../hooks/useCountdownTimer';
import useSupabaseUserId from '../../hooks/useSupabaseUserId';
import useMultiplayerMatch from '../../hooks/useMultiplayerMatch';
import { CAMPAIGN_QUESTION_LIMIT, submitScore } from '../../services/quizService';
import useQuizConfig, { TIMER_DURATION } from './hooks/useQuizConfig';
import useSoloQuestionLoader from './hooks/useSoloQuestionLoader';
import useQuizInteractionHandlers from './hooks/useQuizInteractionHandlers';

export default function useQuizController({ navigation, route }) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const answerRef = useRef(null);
  const timeLeftRef = useRef(TIMER_DURATION);
  const { setStreakValue } = usePreferences();
  const userId = useSupabaseUserId();

  const {
    matchId,
    initialJoinCode,
    isCampaign,
    isMultiplayer,
    normalizedDifficulty,
    difficultyLabel,
    requestedQuestionLimit,
  } = useQuizConfig(route);

  const {
    loading: matchLoading,
    error: matchError,
    match: matchData,
    role: matchRole,
    questions: matchQuestions,
    player: matchPlayerState,
    opponent: matchOpponentState,
    status: matchStatus,
    joinCode: matchJoinCode,
    recordAnswer: recordMatchAnswer,
    surrender: surrenderMatch,
  } = useMultiplayerMatch(matchId, userId, {
    expectedDifficulty: normalizedDifficulty,
  });

  const questionLimit = useMemo(() => {
    if (isMultiplayer) {
      if (Array.isArray(matchQuestions) && matchQuestions.length) {
        return matchQuestions.length;
      }
      return 5;
    }
    if (requestedQuestionLimit) {
      return requestedQuestionLimit;
    }
    return isCampaign ? CAMPAIGN_QUESTION_LIMIT : 5;
  }, [isCampaign, isMultiplayer, matchQuestions, requestedQuestionLimit]);

  const {
    questions: soloQuestions,
    loading: soloLoading,
    error: soloError,
    reset: resetSoloQuestions,
  } = useSoloQuestionLoader({
    isEnabled: !isMultiplayer,
    isCampaign,
    normalizedDifficulty,
    questionLimit,
  });

  const activeQuestions = isMultiplayer
    ? Array.isArray(matchQuestions)
      ? matchQuestions
      : []
    : soloQuestions;
  const totalQuestions = activeQuestions.length;
  const activeIndex = isMultiplayer ? matchPlayerState?.index ?? 0 : index;
  const activeScore = isMultiplayer ? matchPlayerState?.score ?? score : score;
  const currentQuestion =
    totalQuestions > 0 && activeIndex < totalQuestions
      ? activeQuestions[activeIndex]
      : null;
  const hasQuestions = totalQuestions > 0;
  const resolvedMatchStatus = matchData?.status ?? matchStatus ?? null;
  const matchIsActive = !isMultiplayer || resolvedMatchStatus === 'active';
  const resolvedError = isMultiplayer
    ? matchError
      ? matchError.message ?? 'Match konnte nicht geladen werden.'
      : null
    : soloError;
  const showLoading = isMultiplayer
    ? Boolean(matchLoading) && !hasQuestions
    : soloLoading;

  const handleTimerExpired = useCallback(() => {
    setTimedOut(true);
    const handler = answerRef.current;
    if (typeof handler === 'function') {
      handler(null, { timedOut: true });
    }
  }, []);

  const {
    timeLeftMs,
    progress,
    reset: resetTimer,
    stop: stopTimer,
  } = useCountdownTimer(TIMER_DURATION, { onExpire: handleTimerExpired });

  useEffect(() => {
    timeLeftRef.current = timeLeftMs;
  }, [timeLeftMs]);

  const progressPercent = useMemo(() => {
    if (!matchIsActive) {
      return '0%';
    }
    return `${(progress * 100).toFixed(1)}%`;
  }, [matchIsActive, progress]);

  const finalizeQuiz = useCallback(
    async (
      finalScoreValue,
      {
        total = totalQuestions,
        submit = true,
        wasSurrender = false,
      } = {}
    ) => {
      const effectiveTotal = Math.max(1, total);
      const resolvedScore = Number.isFinite(finalScoreValue)
        ? finalScoreValue
        : activeScore;

      const shouldSubmitScore =
        submit && !isCampaign && userId && (!isMultiplayer || !wasSurrender);

      if (shouldSubmitScore) {
        try {
          const result = await submitScore(
            userId,
            resolvedScore,
            normalizedDifficulty
          );
          if (!result?.ok) {
            console.warn(
              'Score konnte nicht gespeichert werden:',
              result?.error?.message ?? result?.error ?? 'Unbekannter Fehler'
            );
          }
        } catch (err) {
          console.error('Fehler beim Speichern des Scores:', err);
        }
      }

      if (submit && !isMultiplayer && !isCampaign) {
        const mistakes = totalQuestions - resolvedScore;
        const shouldIncrease =
          normalizedDifficulty === 'leicht'
            ? true
            : normalizedDifficulty === 'mittel'
            ? mistakes <= 1
            : mistakes === 0;

        try {
          await setStreakValue(normalizedDifficulty, (current) => {
            const safeCurrent = Number.isFinite(current) ? current : 0;
            return shouldIncrease ? safeCurrent + 1 : 0;
          });
        } catch (err) {
          console.warn('Konnte Streak nicht aktualisieren:', err);
        }
      }

      navigation.navigate('Result', {
        score: resolvedScore,
        total: effectiveTotal,
        userId,
        difficulty: difficultyLabel,
        difficultyKey: isCampaign ? 'campaign' : normalizedDifficulty,
        questionLimit,
        mode: isCampaign ? 'campaign' : 'standard',
        isMultiplayer,
        matchId,
        matchStatus: resolvedMatchStatus,
        opponentScore: matchOpponentState?.score ?? null,
        opponentName: matchOpponentState?.username ?? null,
        matchJoinCode: matchJoinCode ?? initialJoinCode ?? null,
        playerRole: matchRole,
      });
    },
    [
      activeScore,
      difficultyLabel,
      initialJoinCode,
      isCampaign,
      isMultiplayer,
      matchJoinCode,
      matchOpponentState?.score,
      matchOpponentState?.username,
      matchRole,
      matchId,
      navigation,
      normalizedDifficulty,
      questionLimit,
      resolvedMatchStatus,
      setStreakValue,
      totalQuestions,
      userId,
    ]
  );

  const {
    answer,
    handleExitCancel,
    handleExitConfirm,
    handleExitRequest,
    isAnswerLocked,
    resetQuestionState,
    selectedOption,
    showExitConfirm,
  } = useQuizInteractionHandlers({
    isMultiplayer,
    matchIsActive,
    currentQuestion,
    activeIndex,
    activeScore,
    score,
    setScore,
    index,
    setIndex,
    totalQuestions,
    stopTimer,
    resetTimer,
    timeLeftRef,
    timedOut,
    setTimedOut,
    recordMatchAnswer,
    finalizeQuiz,
    surrenderMatch,
  });

  useEffect(() => {
    setIndex(0);
    setScore(0);
    setTimedOut(false);
    resetQuestionState();
  }, [
    isCampaign,
    isMultiplayer,
    normalizedDifficulty,
    questionLimit,
    resetQuestionState,
  ]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleExitRequest();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        subscription.remove();
      };
    }, [handleExitRequest])
  );

  useEffect(() => {
    navigation.setOptions({ gestureEnabled: false });
    return () => {
      navigation.setOptions({ gestureEnabled: true });
    };
  }, [navigation]);

  useEffect(() => {
    answerRef.current = answer;
  }, [answer]);

  useEffect(() => {
    if (!currentQuestion || !matchIsActive || showExitConfirm) {
      stopTimer();
      return;
    }

    setTimedOut(false);
    resetTimer();
  }, [currentQuestion?.id, matchIsActive, resetTimer, showExitConfirm, stopTimer]);

  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, [stopTimer]);

  return {
    activeIndex,
    currentQuestion,
    difficultyLabel,
    handleExitCancel,
    handleExitConfirm,
    handleExitRequest,
    hasQuestions,
    initialJoinCode,
    isAnswerLocked,
    isMultiplayer,
    matchIsActive,
    matchJoinCode,
    matchOpponentState,
    matchPlayerState,
    progressPercent,
    questionLimit,
    resolvedError,
    resolvedMatchStatus,
    selectedOption,
    showExitConfirm,
    showLoading,
    timeLeftMs,
    timedOut,
    totalQuestions,
    answer,
  };
}
