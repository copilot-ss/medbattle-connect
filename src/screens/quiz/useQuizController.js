import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useConnectivity } from '../../context/ConnectivityContext';
import { usePreferences } from '../../context/PreferencesContext';
import { DEFAULT_BOOSTS } from '../../context/preferences/constants';
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
const BOOST_FREEZE_DURATION_MS = 10 * 1000;
const DOUBLE_XP_MULTIPLIER = 2;
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
  const [hiddenOptions, setHiddenOptions] = useState([]);
  const [usedBoosts, setUsedBoosts] = useState({});
  const [isTimerFrozen, setIsTimerFrozen] = useState(false);
  const freezeTimeoutRef = useRef(null);
  const questionIdRef = useRef(null);
  const matchActiveRef = useRef(true);
  const exitConfirmRef = useRef(false);
  const {
    setStreakValue,
    updateUserStats,
    consumeEnergy,
    boosts,
    consumeBoost,
    streakShieldActive,
    setStreakShieldActive,
    doubleXpExpiresAt,
    setDoubleXpExpiresAt,
    streaks,
  } = usePreferences();
  const { premium } = usePremiumStatus();
  const energyChargedRef = useRef(false);
  const { isOnline } = useConnectivity();
  const userId = useSupabaseUserId();
  const boostInventory = useMemo(() => {
    return Object.keys(DEFAULT_BOOSTS).reduce((acc, key) => {
      acc[key] = sanitizeStatNumber(boosts?.[key]);
      return acc;
    }, { ...DEFAULT_BOOSTS });
  }, [boosts]);
  const isDoubleXpActive = useCallback(
    (now = Date.now()) =>
      Number.isFinite(doubleXpExpiresAt) && doubleXpExpiresAt > now,
    [doubleXpExpiresAt]
  );

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
    resume: resumeTimer,
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
    questionIdRef.current = currentQuestion?.id ?? `${activeIndex}`;
  }, [activeIndex, currentQuestion?.id]);

  useEffect(() => {
    matchActiveRef.current = matchIsActive;
  }, [matchIsActive]);

  useEffect(() => {
    if (doubleXpExpiresAt && doubleXpExpiresAt <= Date.now()) {
      setDoubleXpExpiresAt(null);
    }
  }, [doubleXpExpiresAt, setDoubleXpExpiresAt]);

  useEffect(() => {
    if (streakShieldActive && boostInventory.streak_shield <= 0) {
      setStreakShieldActive(false);
    }
  }, [boostInventory.streak_shield, setStreakShieldActive, streakShieldActive]);

  useEffect(() => {
    if (isMultiplayer || premium || energyChargedRef.current) {
      return;
    }

    energyChargedRef.current = true;
    consumeEnergy().then((result) => {
      if (!result.ok) {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'MainTabs',
              params: { screen: 'Home', params: { showBoostModal: true } },
            },
          ],
        });
      }
    });
  }, [consumeEnergy, isMultiplayer, navigation, premium]);

  const clearFreezeTimeout = useCallback(() => {
    if (freezeTimeoutRef.current) {
      clearTimeout(freezeTimeoutRef.current);
      freezeTimeoutRef.current = null;
    }
  }, []);

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
      const baseXp = calculateXpGain({
        correct: resolvedScore,
        total: effectiveTotal,
        difficulty: normalizedDifficulty,
        isMultiplayer,
      });
      const doubleXpEnabled = isDoubleXpActive();
      const xpEarned = Math.max(
        0,
        Math.round(baseXp * (doubleXpEnabled ? DOUBLE_XP_MULTIPLIER : 1))
      );
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
            const currentStreak = sanitizeStatNumber(
              streaks?.[normalizedDifficulty]
            );
            const shieldArmed =
              streakShieldActive &&
              boostInventory.streak_shield > 0 &&
              currentStreak > 0;
            const shouldUseShield = !shouldIncrease && shieldArmed;
            const shieldConsumed = shouldUseShield
              ? await consumeBoost('streak_shield')
              : false;

            await setStreakValue(normalizedDifficulty, (current) => {
              const safeCurrent = Number.isFinite(current) ? current : 0;
              if (shieldConsumed) {
                return safeCurrent;
              }
              return shouldIncrease ? safeCurrent + 1 : 0;
            });
            if (shieldConsumed) {
              await setStreakShieldActive(false);
            }
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
      boostInventory.streak_shield,
      category,
      consumeBoost,
      difficultyLabel,
      isDoubleXpActive,
      initialJoinCode,
      isMultiplayer,
      isQuickPlay,
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
      setStreakShieldActive,
      streakShieldActive,
      streaks,
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
    exitConfirmRef.current = showExitConfirm;
  }, [showExitConfirm]);

  const freezeUsed = Boolean(usedBoosts?.freeze_time);
  const fiftyUsed = Boolean(usedBoosts?.joker_5050);

  const handleUseFreezeTime = useCallback(async () => {
    if (!currentQuestion || isAnswerLocked || timedOut || !matchIsActive) {
      return;
    }
    if (freezeUsed || isTimerFrozen || boostInventory.freeze_time <= 0) {
      return;
    }

    const consumed = await consumeBoost('freeze_time');
    if (!consumed) {
      return;
    }

    setUsedBoosts((prev) => ({ ...prev, freeze_time: true }));
    setIsTimerFrozen(true);
    stopTimer();
    clearFreezeTimeout();

    const activeKey = questionIdRef.current;
    freezeTimeoutRef.current = setTimeout(() => {
      freezeTimeoutRef.current = null;
      setIsTimerFrozen(false);
      if (!matchActiveRef.current || exitConfirmRef.current) {
        return;
      }
      if (questionIdRef.current !== activeKey) {
        return;
      }
      resumeTimer();
    }, BOOST_FREEZE_DURATION_MS);
  }, [
    boostInventory.freeze_time,
    clearFreezeTimeout,
    consumeBoost,
    currentQuestion,
    freezeUsed,
    isAnswerLocked,
    isTimerFrozen,
    matchIsActive,
    resumeTimer,
    stopTimer,
    timedOut,
  ]);

  const handleUseFiftyFifty = useCallback(async () => {
    if (!currentQuestion || isAnswerLocked || timedOut || !matchIsActive) {
      return;
    }
    if (fiftyUsed || boostInventory.joker_5050 <= 0) {
      return;
    }

    const options = Array.isArray(currentQuestion.options)
      ? currentQuestion.options
      : [];
    const wrongOptions = options.filter(
      (opt) => opt !== currentQuestion.correct_answer
    );
    if (wrongOptions.length < 2) {
      return;
    }

    const firstIndex = Math.floor(Math.random() * wrongOptions.length);
    const firstPick = wrongOptions.splice(firstIndex, 1)[0];
    const secondPick =
      wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
    const hidden = [firstPick, secondPick].filter(Boolean);

    const consumed = await consumeBoost('joker_5050');
    if (!consumed) {
      return;
    }

    setHiddenOptions(hidden);
    setUsedBoosts((prev) => ({ ...prev, joker_5050: true }));
  }, [
    boostInventory.joker_5050,
    consumeBoost,
    currentQuestion,
    fiftyUsed,
    isAnswerLocked,
    matchIsActive,
    timedOut,
  ]);

  useEffect(() => {
    setHiddenOptions([]);
    setUsedBoosts({});
    setIsTimerFrozen(false);
    clearFreezeTimeout();
  }, [clearFreezeTimeout, currentQuestion?.id]);

  useEffect(() => {
    if (isAnswerLocked) {
      clearFreezeTimeout();
      setIsTimerFrozen(false);
    }
  }, [clearFreezeTimeout, isAnswerLocked]);

  useEffect(() => {
    return () => {
      clearFreezeTimeout();
    };
  }, [clearFreezeTimeout]);

  useEffect(() => {
    setIndex(0);
    setScore(0);
    setTimedOut(false);
    answerHistoryRef.current = [];
    setAnswerHistory([]);
    resetQuestionState();
    setHiddenOptions([]);
    setUsedBoosts({});
    setIsTimerFrozen(false);
    clearFreezeTimeout();
  }, [
    clearFreezeTimeout,
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
    category,
    difficultyLabel,
    handleExitCancel,
    handleExitConfirm,
    handleExitRequest,
    hasQuestions,
    initialJoinCode,
    isAnswerLocked,
    isMultiplayer,
    isQuickPlay,
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
    boostInventory,
    hiddenOptions,
    usedBoosts,
    isTimerFrozen,
    handleUseFreezeTime,
    handleUseFiftyFifty,
    totalQuestions,
    answer,
    answerHistory,
  };
}
