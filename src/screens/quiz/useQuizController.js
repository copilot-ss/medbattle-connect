import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useConnectivity } from '../../context/ConnectivityContext';
import { usePreferences } from '../../context/PreferencesContext';
import usePremiumStatus from '../../hooks/usePremiumStatus';
import useCountdownTimer from '../../hooks/useCountdownTimer';
import useSupabaseUserId from '../../hooks/useSupabaseUserId';
import useMultiplayerMatch from '../../hooks/useMultiplayerMatch';
import { calculateCoinReward, calculateMatchPoints, submitScore } from '../../services/quizService';
import { calculateXpGain } from '../../services/titleService';
import { syncUserProgressDelta } from '../../services/userProgressService';
import useQuizConfig, { TIMER_DURATION } from './hooks/useQuizConfig';
import useSoloQuestionLoader from './hooks/useSoloQuestionLoader';
import useQuizInteractionHandlers from './hooks/useQuizInteractionHandlers';

const DEFAULT_SOLO_QUESTION_LIMIT = 6;
const sanitizeStatNumber = (value) => {
  const parsed = parseInt(value, 10);
  if (Number.isFinite(parsed) && parsed >= 0) {
    return parsed;
  }
  return 0;
};

export default function useQuizController({ navigation, route }) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const [answerHistory, setAnswerHistory] = useState([]);
  const answerRef = useRef(null);
  const timeLeftRef = useRef(TIMER_DURATION);
  const answerHistoryRef = useRef([]);
  const { setStreakValue, updateUserStats, consumeEnergy } = usePreferences();
  const { premium } = usePremiumStatus();
  const energyChargedRef = useRef(false);
  const { isOnline } = useConnectivity();
  const userId = useSupabaseUserId();

  const {
    matchId,
    initialJoinCode,
    mode,
    isQuickPlay,
    isMultiplayer,
    normalizedDifficulty,
    difficultyLabel,
    requestedQuestionLimit,
    category,
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
    return DEFAULT_SOLO_QUESTION_LIMIT;
  }, [isMultiplayer, matchQuestions, requestedQuestionLimit]);

  const isOffline = isOnline === false;
  const {
    questions: soloQuestions,
    loading: soloLoading,
    error: soloError,
    reset: resetSoloQuestions,
  } = useSoloQuestionLoader({
    isEnabled: !isMultiplayer,
    normalizedDifficulty,
    questionLimit,
    category,
    isOffline,
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

  useEffect(() => {
    if (!isQuickPlay || isMultiplayer || premium || energyChargedRef.current) {
      return;
    }

    energyChargedRef.current = true;
    consumeEnergy().then((result) => {
      if (!result.ok) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs', params: { screen: 'Home' } }],
        });
      }
    });
  }, [consumeEnergy, isMultiplayer, isQuickPlay, navigation, premium]);

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
      const earnedPoints = calculateMatchPoints({
        correct: resolvedScore,
        total: effectiveTotal,
        difficulty: normalizedDifficulty,
      });
      const xpEarned = calculateXpGain({
        correct: resolvedScore,
        total: effectiveTotal,
        difficulty: normalizedDifficulty,
        isMultiplayer,
      });
      const coinsEarned = submit
        ? calculateCoinReward({
            correct: resolvedScore,
            total: effectiveTotal,
            difficulty: normalizedDifficulty,
            isMultiplayer,
          })
        : 0;

      const shouldSubmitScore =
        submit && userId && (!isMultiplayer || !wasSurrender);

      let scoreQueued = false;
      if (shouldSubmitScore) {
        try {
          const result = await submitScore(
            userId,
            earnedPoints,
            normalizedDifficulty,
            { offline: isOffline }
          );
          scoreQueued = Boolean(result?.queued);
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

      if (submit) {
        const mistakes = totalQuestions - resolvedScore;
        if (!isMultiplayer) {
          const shouldIncrease = isQuickPlay
            ? mistakes === 0
            : normalizedDifficulty === 'leicht'
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

        const progressDelta = {
          quizzes: 1,
          correct: resolvedScore,
          questions: effectiveTotal,
          xp: xpEarned,
          coins: coinsEarned,
        };

        try {
          await updateUserStats((current) => ({
            quizzes: sanitizeStatNumber((current?.quizzes ?? 0) + 1),
            correct: sanitizeStatNumber((current?.correct ?? 0) + resolvedScore),
            questions: sanitizeStatNumber((current?.questions ?? 0) + effectiveTotal),
            xp: sanitizeStatNumber((current?.xp ?? 0) + xpEarned),
            coins: sanitizeStatNumber((current?.coins ?? 0) + coinsEarned),
          }));
        } catch (err) {
          console.warn('Konnte lokale Quiz-Statistik nicht aktualisieren:', err);
        }

        try {
          await syncUserProgressDelta(userId, progressDelta, { offline: isOffline });
        } catch (err) {
          console.warn('Konnte Fortschritt nicht synchronisieren:', err);
        }
      }

      const playerSnapshot = isMultiplayer
        ? {
            userId: matchPlayerState?.userId ?? null,
            username: matchPlayerState?.username ?? null,
            score: Number.isFinite(matchPlayerState?.score)
              ? matchPlayerState.score
              : resolvedScore,
            finished: Boolean(matchPlayerState?.finished),
          }
        : null;
      const opponentSnapshot = isMultiplayer
        ? {
            userId: matchOpponentState?.userId ?? null,
            username: matchOpponentState?.username ?? null,
            score: Number.isFinite(matchOpponentState?.score)
              ? matchOpponentState.score
              : null,
            finished: Boolean(matchOpponentState?.finished),
          }
        : null;

      navigation.navigate('Result', {
        score: resolvedScore,
        total: effectiveTotal,
        points: earnedPoints,
        coins: coinsEarned,
        xp: xpEarned,
        userId,
        difficulty: difficultyLabel,
        difficultyKey: normalizedDifficulty,
        questionLimit,
        category,
        answerHistory: answerHistoryRef.current,
        mode,
        isMultiplayer,
        offline: isOffline,
        scoreQueued,
        matchId,
        matchStatus: resolvedMatchStatus,
        opponentScore: matchOpponentState?.score ?? null,
        opponentName: matchOpponentState?.username ?? null,
        playerState: playerSnapshot,
        opponentState: opponentSnapshot,
        matchJoinCode: matchJoinCode ?? initialJoinCode ?? null,
        playerRole: matchRole,
      });
    },
    [
      activeScore,
      category,
      difficultyLabel,
      initialJoinCode,
      isMultiplayer,
      matchPlayerState?.finished,
      matchPlayerState?.score,
      matchPlayerState?.userId,
      matchPlayerState?.username,
      matchJoinCode,
      matchOpponentState?.score,
      matchOpponentState?.finished,
      matchOpponentState?.userId,
      matchOpponentState?.username,
      matchRole,
      matchId,
      navigation,
      normalizedDifficulty,
      questionLimit,
      resolvedMatchStatus,
      setStreakValue,
      updateUserStats,
      syncUserProgressDelta,
      totalQuestions,
      userId,
      mode,
      isOffline,
    ]
  );

  const recordAnswerHistory = useCallback((entry) => {
    if (!entry) {
      return;
    }
    const next = Array.isArray(answerHistoryRef.current)
      ? [...answerHistoryRef.current]
      : [];
    const indexKey = Number.isFinite(entry.index) ? entry.index : next.length;
    next[indexKey] = entry;
    const filtered = next.filter(Boolean);
    answerHistoryRef.current = filtered;
    setAnswerHistory(filtered);
  }, []);

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
    navigation,
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
    onRecordAnswer: recordAnswerHistory,
    finalizeQuiz,
    surrenderMatch,
  });

  useEffect(() => {
    setIndex(0);
    setScore(0);
    setTimedOut(false);
    answerHistoryRef.current = [];
    setAnswerHistory([]);
    resetQuestionState();
  }, [
    isMultiplayer,
    normalizedDifficulty,
    questionLimit,
    mode,
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
    answerHistory,
  };
}
