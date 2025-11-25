import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { usePreferences } from '../context/PreferencesContext';
import { supabase } from '../lib/supabaseClient';
import useMultiplayerMatch from '../hooks/useMultiplayerMatch';
import { fetchQuestions, submitScore } from '../services/quizService';
import styles, {
  getOptionButtonStyle,
  getOptionTextStyle,
  getTimerProgressFillStyle,
} from './styles/QuizScreen.styles';

const DIFFICULTY_LABELS = {
  leicht: 'Leicht',
  mittel: 'Mittel',
  schwer: 'Schwer',
};

function shuffleOptions(options) {
  const array = Array.isArray(options) ? [...options] : [];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export default function QuizScreen({ navigation, route }) {
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const feedbackTimerRef = useRef(null);
  const TIMER_DURATION = 6000;
  const timerTimeoutRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const [timeLeftMs, setTimeLeftMs] = useState(TIMER_DURATION);
  const [timedOut, setTimedOut] = useState(false);
  const matchId =
    typeof route?.params?.matchId === 'string' ? route.params.matchId : null;
  const initialJoinCode =
    typeof route?.params?.joinCode === 'string' ? route.params.joinCode : null;
  const isMultiplayer = Boolean(matchId);
  const difficulty =
    typeof route?.params?.difficulty === 'string'
      ? route.params.difficulty
      : 'mittel';
  const normalizedDifficulty = ['leicht', 'mittel', 'schwer'].includes(
    difficulty
  )
    ? difficulty
    : 'mittel';
  const difficultyLabel =
    DIFFICULTY_LABELS[normalizedDifficulty] ?? DIFFICULTY_LABELS.mittel;
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
  const questionLimit = isMultiplayer
    ? Array.isArray(matchQuestions) && matchQuestions.length
      ? matchQuestions.length
      : 5
    : 5;
  const activeQuestions = isMultiplayer
    ? Array.isArray(matchQuestions)
      ? matchQuestions
      : []
    : questions;
  const totalQuestions = activeQuestions.length;
  const activeIndex = isMultiplayer
    ? matchPlayerState?.index ?? 0
    : index;
  const activeScore = isMultiplayer
    ? matchPlayerState?.score ?? score
    : score;
  const currentQuestion =
    totalQuestions > 0 && activeIndex < totalQuestions
      ? activeQuestions[activeIndex]
      : null;
  const hasQuestions = totalQuestions > 0;
  const resolvedError = isMultiplayer
    ? matchError
      ? matchError.message ?? 'Match konnte nicht geladen werden.'
      : error
    : error;
  const showLoading =
    isMultiplayer ? (matchLoading || loading) && !hasQuestions : loading;
  const resolvedMatchStatus = matchData?.status ?? matchStatus ?? null;
  const matchIsActive = !isMultiplayer || resolvedMatchStatus === 'active';
  const progressPercent = useMemo(() => {
    if (!matchIsActive) {
      return '0%';
    }
    const ratio = Math.max(0, Math.min(1, timeLeftMs / TIMER_DURATION));
    return `${(ratio * 100).toFixed(1)}%`;
  }, [TIMER_DURATION, matchIsActive, timeLeftMs]);

  useEffect(() => {
    navigation.setOptions({ gestureEnabled: false });
    return () => {
      navigation.setOptions({ gestureEnabled: true });
    };
  }, [navigation]);

  const clearQuestionTimers = useCallback(() => {
    if (timerTimeoutRef.current) {
      clearTimeout(timerTimeoutRef.current);
      timerTimeoutRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const handleExitRequest = useCallback(() => {
    clearQuestionTimers();
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
    setSelectedOption(null);
    setIsAnswerLocked(false);
    setTimedOut(false);
    setShowExitConfirm(true);
  }, [clearQuestionTimers]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleExitRequest();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );

      return () => {
        subscription.remove();
      };
    }, [handleExitRequest])
  );

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
      clearQuestionTimers();
    };
  }, [clearQuestionTimers]);

  useEffect(() => {
    if (isMultiplayer) {
      return;
    }

    async function loadQuestions() {
      try {
        setLoading(true);
        const data = await fetchQuestions(normalizedDifficulty, questionLimit);
        if (!data.length) {
          setError('Keine Fragen verfuegbar. Bitte pflege Fragen in Supabase.');
          setQuestions([]);
        } else {
          setError(null);
          const prepared = data.map((question) => {
            const baseOptions = Array.isArray(question.options)
              ? question.options.filter(Boolean)
              : [];
            const optionsSet = new Set(baseOptions);
            if (
              question.correct_answer &&
              !optionsSet.has(question.correct_answer)
            ) {
              baseOptions.push(question.correct_answer);
            }
            return {
              ...question,
              options: shuffleOptions(baseOptions),
            };
          });
          setQuestions(prepared);
        }
      } catch (err) {
        console.error('Fehler beim Laden der Fragen', err);
        setError(
          'Die Fragen konnten nicht geladen werden. Bitte versuche es spaeter erneut.'
        );
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    }

    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }
    clearQuestionTimers();
    setTimedOut(false);
    setTimeLeftMs(TIMER_DURATION);
    setSelectedOption(null);
    setIsAnswerLocked(false);
    setQuestions([]);
    setIndex(0);
    setScore(0);
    loadQuestions();
  }, [TIMER_DURATION, clearQuestionTimers, isMultiplayer, normalizedDifficulty, questionLimit]);

  useEffect(() => {
    if (!isMultiplayer) {
      return;
    }

    if (Array.isArray(matchQuestions)) {
      setQuestions(matchQuestions);
    }

    setLoading(Boolean(matchLoading));
    setError(
      matchError
        ? matchError.message ?? 'Match konnte nicht geladen werden.'
        : null
    );
  }, [isMultiplayer, matchError, matchLoading, matchQuestions]);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data, error }) => {
      if (!mounted) {
        return;
      }
      if (error) {
        console.warn('Konnte Nutzer nicht abrufen:', error.message);
      }
      setUserId(data?.user?.id ?? null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) {
          return;
        }
        setUserId(session?.user?.id ?? null);
      }
    );

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
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

      if (submit && userId && (!isMultiplayer || !wasSurrender)) {
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

      if (submit && !isMultiplayer) {
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
        difficultyKey: normalizedDifficulty,
        questionLimit,
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
      isMultiplayer,
      matchJoinCode,
      matchOpponentState?.score,
      matchOpponentState?.username,
      matchRole,
      resolvedMatchStatus,
      matchId,
      navigation,
      normalizedDifficulty,
      questionLimit,
      setStreakValue,
      totalQuestions,
      userId,
    ]
  );

  const handleExitCancel = useCallback(() => {
    setShowExitConfirm(false);
    startQuestionTimer();
  }, [startQuestionTimer]);

  const handleExitConfirm = useCallback(() => {
    clearQuestionTimers();
    setShowExitConfirm(false);
    if (isMultiplayer) {
      surrenderMatch().finally(() => {
        finalizeQuiz(activeScore, {
          total: activeIndex > 0 ? activeIndex : 1,
          submit: false,
          wasSurrender: true,
        });
      });
      return;
    }
    finalizeQuiz(score, {
      total: index > 0 ? index : 1,
      submit: false,
    });
  }, [
    activeIndex,
    activeScore,
    clearQuestionTimers,
    finalizeQuiz,
    index,
    isMultiplayer,
    score,
    surrenderMatch,
  ]);

  const answer = useCallback(
    async (option, { timedOut: timedOutTrigger = false } = {}) => {
      if (
        isAnswerLocked ||
        !currentQuestion ||
        (isMultiplayer && !matchIsActive)
      ) {
        return;
      }

      clearQuestionTimers();
      const questionSnapshot = currentQuestion;
      const currentIndex = activeIndex;
      const soloBaseScore = score;
      const matchBaseScore = activeScore;
      const elapsedMs = Math.max(0, TIMER_DURATION - timeLeftMs);

      if (timedOutTrigger) {
        setTimedOut(true);
        setTimeLeftMs(0);
      } else {
        setTimedOut(false);
      }

      const isCorrect = option === questionSnapshot.correct_answer;
      const nextSoloScore = isCorrect ? soloBaseScore + 1 : soloBaseScore;
      const nextMatchScore = isCorrect ? matchBaseScore + 1 : matchBaseScore;

      setSelectedOption(timedOutTrigger ? null : option);
      setIsAnswerLocked(true);

      if (!isMultiplayer && isCorrect) {
        setScore(nextSoloScore);
      }

      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }

      feedbackTimerRef.current = setTimeout(() => {
        const processAnswer = async () => {
          feedbackTimerRef.current = null;
          setSelectedOption(null);

          if (isMultiplayer) {
            if (questionSnapshot.id) {
              const result = await recordMatchAnswer({
                questionId: questionSnapshot.id,
                selectedOption: timedOutTrigger ? null : option,
                correct: isCorrect,
                durationMs: timedOutTrigger ? TIMER_DURATION : elapsedMs,
                timedOut: timedOutTrigger,
              });

              if (!result.ok) {
                console.warn(
                  'Antwort konnte nicht an den Server uebermittelt werden:',
                  result.error?.message ?? result.error ?? 'Unbekannter Fehler'
                );
              }
            } else {
              console.warn('Match-Frage ohne gueltige ID, Antwort wurde nicht synchronisiert.');
            }
          }

          const nextIndex = currentIndex + 1;

          if (nextIndex < totalQuestions) {
            setIsAnswerLocked(false);
            if (!isMultiplayer) {
              setIndex(nextIndex);
            }
          } else {
            const finalValue = isMultiplayer ? nextMatchScore : nextSoloScore;
            finalizeQuiz(finalValue, { submit: true });
          }
        };

        processAnswer().catch((err) => {
          console.error('Antwort konnte nicht verarbeitet werden:', err);
          setIsAnswerLocked(false);
        });
      }, 900);
    },
    [
      TIMER_DURATION,
      activeIndex,
      activeScore,
      clearQuestionTimers,
      currentQuestion,
      finalizeQuiz,
      isAnswerLocked,
      isMultiplayer,
      matchIsActive,
      recordMatchAnswer,
      score,
      totalQuestions,
      timeLeftMs,
    ]
  );

  const startQuestionTimer = useCallback(() => {
    if (!currentQuestion || !matchIsActive) {
      return;
    }

    clearQuestionTimers();
    setTimedOut(false);
    setTimeLeftMs(TIMER_DURATION);

    timerIntervalRef.current = setInterval(() => {
      setTimeLeftMs((prev) => {
        if (prev <= 100) {
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }
          return 0;
        }
        return prev - 100;
      });
    }, 100);

    timerTimeoutRef.current = setTimeout(() => {
      timerTimeoutRef.current = null;
      setTimedOut(true);
      answer(null, { timedOut: true });
    }, TIMER_DURATION);
  }, [
    TIMER_DURATION,
    answer,
    clearQuestionTimers,
    currentQuestion,
    matchIsActive,
  ]);

  useEffect(() => {
    if (!currentQuestion || !matchIsActive) {
      clearQuestionTimers();
      return;
    }

    startQuestionTimer();

    return () => {
      clearQuestionTimers();
    };
  }, [
    clearQuestionTimers,
    currentQuestion?.id,
    matchIsActive,
    startQuestionTimer,
  ]);

  if (showLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#60A5FA" />
        <Text style={styles.loadingText}>Fragen werden geladen ...</Text>
      </View>
    );
  }

  if (resolvedError || !hasQuestions) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {resolvedError ??
            'Keine Fragen verfuegbar. Bitte versuche es spaeter erneut.'}
        </Text>
        <Pressable
          onPress={() => navigation.navigate('Home')}
          style={styles.errorButton}
        >
          <Text style={styles.errorButtonText}>Zurueck zur Basis</Text>
        </Pressable>
      </View>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerMeta}>
            {difficultyLabel} - {(totalQuestions || questionLimit) || 0} Fragen
          </Text>
          <Text style={styles.headerTitle}>Battle laufend</Text>
      </View>
        <Pressable onPress={handleExitRequest} style={styles.exitButton}>
          <Text style={styles.exitButtonText}>Beenden</Text>
        </Pressable>
      </View>

      {isMultiplayer ? (
        <View style={styles.matchStatusCard}>
          <View style={styles.matchPlayersRow}>
            <View style={styles.playerPanel}>
              <Text style={styles.playerPanelLabel}>Du</Text>
              <Text style={styles.playerPanelName}>
                {matchPlayerState?.username ?? 'Du'}
              </Text>
              <Text style={styles.playerPanelScore}>
                {matchPlayerState?.score ?? 0}
              </Text>
            </View>
            <View style={styles.vsDivider}>
              <Text style={styles.vsDividerText}>VS</Text>
            </View>
            <View style={styles.playerPanel}>
              <Text style={styles.playerPanelLabel}>Gegner</Text>
              <Text style={styles.playerPanelName}>
                {matchOpponentState?.username ?? 'Unbekannt'}
              </Text>
              <Text style={styles.playerPanelScore}>
                {matchOpponentState?.score ?? 0}
              </Text>
            </View>
          </View>
          <View style={styles.matchMetaRow}>
            <Text style={styles.matchMetaLeft}>
              Runde {Math.min(activeIndex + 1, totalQuestions)}/{totalQuestions}
            </Text>
            <Text style={styles.matchMetaRight}>
              Code {matchJoinCode ?? initialJoinCode ?? '-'}
            </Text>
          </View>
          {resolvedMatchStatus === 'waiting' ? (
            <Text style={styles.matchWaitingHint}>
              Warte auf Gegner - Fragen starten sobald beide bereit sind.
            </Text>
          ) : null}
        </View>
      ) : null}

      <View style={styles.timerSection}>
        <View style={styles.timerRow}>
          <Text style={styles.timerLabel}>Time Attack</Text>
          <Text style={styles.timerValue}>
            {matchIsActive ? `${(Math.max(timeLeftMs, 0) / 1000).toFixed(1)}s` : '--'}
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={getTimerProgressFillStyle(progressPercent, timedOut)} />
        </View>
      </View>

      <View style={styles.questionCard}>
        <Text style={styles.questionMeta}>
          Frage {Math.min(activeIndex + 1, totalQuestions)} / {totalQuestions}
        </Text>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>
      </View>

      <View style={styles.optionsList}>
        {currentQuestion.options.map((opt, i) => {
          const optionKey = `${i}-${opt}`;
          const isOptionSelected = selectedOption === opt;
          const isCorrectOption = opt === currentQuestion.correct_answer;
          const showFeedback =
            isAnswerLocked && (selectedOption !== null || timedOut);

          let backgroundColor = '#111827';
          let borderColor = 'rgba(148, 163, 184, 0.25)';
          let textColor = '#E2E8F0';
          let extraOpacity = 1;

          if (showFeedback) {
            if (isCorrectOption) {
              backgroundColor = 'rgba(34, 197, 94, 0.25)';
              borderColor = 'rgba(34, 197, 94, 0.6)';
              textColor = '#BBF7D0';
            } else if (isOptionSelected) {
              backgroundColor = 'rgba(248, 113, 113, 0.25)';
              borderColor = 'rgba(248, 113, 113, 0.6)';
              textColor = '#FCA5A5';
            } else {
              backgroundColor = '#111827';
              borderColor = 'rgba(148, 163, 184, 0.15)';
              textColor = '#E2E8F0';
              extraOpacity = 0.85;
            }
          } else if (isOptionSelected) {
            backgroundColor = 'rgba(59, 130, 246, 0.18)';
            borderColor = 'rgba(59, 130, 246, 0.5)';
            textColor = '#BFDBFE';
          }

          return (
            <Pressable
              key={optionKey}
              onPress={() => answer(opt)}
              disabled={
                isAnswerLocked || (isMultiplayer && !matchIsActive)
              }
              style={getOptionButtonStyle({
                backgroundColor,
                borderColor,
                opacity: extraOpacity,
              })}
            >
              <Text style={getOptionTextStyle(textColor)}>{opt}</Text>
            </Pressable>
          );
        })}
      </View>

      {timedOut && isAnswerLocked ? (
        <View style={styles.timeoutBanner}>
          <Text style={styles.timeoutTitle}>Zeit abgelaufen!</Text>
          <Text style={styles.timeoutSubtitle}>
            Reagiere schneller, um deinen Combo-Bonus zu sichern.
          </Text>
        </View>
      ) : null}

      {showExitConfirm ? (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Battle beenden?</Text>
            <Text style={styles.modalMessage}>
              {isMultiplayer
                ? 'Das laufende Duell gilt als aufgegeben. Moechtest du wirklich abbrechen?'
                : 'Nicht beantwortete Fragen zaehlen nicht. Moechtest du wirklich abbrechen?'}
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                onPress={handleExitCancel}
                style={[styles.modalButton, styles.modalButtonContinue]}
              >
                <Text style={styles.modalButtonContinueText}>Weiter spielen</Text>
              </Pressable>
              <Pressable
                onPress={handleExitConfirm}
                style={[styles.modalButton, styles.modalButtonExit]}
              >
                <Text style={styles.modalButtonExitText}>Ja, beenden</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}



