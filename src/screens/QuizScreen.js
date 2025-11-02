import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabaseClient';
import { fetchQuestions, submitScore } from '../services/quizService';
import styles from './styles/QuizScreen.styles';

const DIFFICULTY_LABELS = {
  leicht: 'Leicht',
  mittel: 'Mittel',
  schwer: 'Schwer',
};

const STREAK_STORAGE_KEYS = {
  leicht: 'medbattle_streak_leicht',
  mittel: 'medbattle_streak_mittel',
  schwer: 'medbattle_streak_schwer',
};

const DEFAULT_STREAKS = {
  leicht: 0,
  mittel: 0,
  schwer: 0,
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
  const questionLimit = 5;
  const totalQuestions = questions.length;
  const currentQuestion =
    totalQuestions > 0 && index < totalQuestions ? questions[index] : null;
  const progressPercent = useMemo(() => {
    const ratio = Math.max(0, Math.min(1, timeLeftMs / TIMER_DURATION));
    return `${(ratio * 100).toFixed(1)}%`;
  }, [TIMER_DURATION, timeLeftMs]);

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
  }, [TIMER_DURATION, clearQuestionTimers, normalizedDifficulty]);

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
      { total = totalQuestions, submit = true } = {}
    ) => {
      const effectiveTotal = Math.max(1, total);

      if (submit && userId) {
        try {
          const result = await submitScore(
            userId,
            finalScoreValue,
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

      if (submit) {
        const streakKey = STREAK_STORAGE_KEYS[normalizedDifficulty] ?? null;
        const mistakes = totalQuestions - finalScoreValue;
        const shouldIncrease =
          normalizedDifficulty === 'leicht'
            ? true
            : normalizedDifficulty === 'mittel'
            ? mistakes <= 1
            : mistakes === 0;

        try {
          let streak = shouldIncrease ? 1 : 0;

          if (streakKey) {
            const raw = await AsyncStorage.getItem(streakKey);
            const current = raw ? parseInt(raw, 10) : 0;
            const nextStreak = shouldIncrease ? current + 1 : 0;
            streak = Number.isFinite(nextStreak) ? nextStreak : 0;
            await AsyncStorage.setItem(streakKey, String(streak));
          }

          const existing =
            typeof globalThis.__medbattleStreaks === 'object' &&
            globalThis.__medbattleStreaks !== null
              ? { ...DEFAULT_STREAKS, ...globalThis.__medbattleStreaks }
              : { ...DEFAULT_STREAKS };
          existing[normalizedDifficulty] = streak;
          globalThis.__medbattleStreaks = existing;
        } catch (err) {
          console.warn('Konnte Streak nicht aktualisieren:', err);
        }
      }

      navigation.navigate('Result', {
        score: finalScoreValue,
        total: effectiveTotal,
        userId,
        difficulty: difficultyLabel,
        difficultyKey: normalizedDifficulty,
        questionLimit,
      });
    },
    [
      difficultyLabel,
      navigation,
      normalizedDifficulty,
      questionLimit,
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
    finalizeQuiz(score, {
      total: index > 0 ? index : 1,
      submit: false,
    });
  }, [clearQuestionTimers, finalizeQuiz, index, score]);

  const answer = useCallback(
    async (option, { timedOut: timedOutTrigger = false } = {}) => {
      if (isAnswerLocked || !currentQuestion) {
        return;
      }

      clearQuestionTimers();

      if (timedOutTrigger) {
        setTimedOut(true);
        setTimeLeftMs(0);
      } else {
        setTimedOut(false);
      }

      const isCorrect = option === currentQuestion.correct_answer;
      const finalScoreValue = isCorrect ? score + 1 : score;

      setSelectedOption(timedOutTrigger ? null : option);
      setIsAnswerLocked(true);

      if (isCorrect) {
        setScore(finalScoreValue);
      }

      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }

      feedbackTimerRef.current = setTimeout(() => {
        feedbackTimerRef.current = null;
        setSelectedOption(null);

        if (index + 1 < totalQuestions) {
          setIsAnswerLocked(false);
          setIndex((prev) => prev + 1);
        } else {
          finalizeQuiz(finalScoreValue, { submit: true });
        }
      }, 900);
    },
    [
      clearQuestionTimers,
      currentQuestion,
      finalizeQuiz,
      index,
      isAnswerLocked,
      score,
      totalQuestions,
    ]
  );

  const startQuestionTimer = useCallback(() => {
    if (!currentQuestion) {
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
  ]);

  useEffect(() => {
    if (!currentQuestion) {
      clearQuestionTimers();
      return;
    }

    startQuestionTimer();

    return () => {
      clearQuestionTimers();
    };
  }, [clearQuestionTimers, currentQuestion?.id, startQuestionTimer]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#60A5FA" />
        <Text style={styles.loadingText}>Fragen werden geladen ...</Text>
      </View>
    );
  }

  if (error || !questions.length) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {error ?? 'Keine Fragen verfuegbar. Bitte versuche es spaeter erneut.'}
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
            {difficultyLabel} · {questionLimit} Fragen
          </Text>
          <Text style={styles.headerTitle}>Battle laufend</Text>
        </View>
        <Pressable onPress={handleExitRequest} style={styles.exitButton}>
          <Text style={styles.exitButtonText}>Beenden</Text>
        </Pressable>
      </View>

      <View style={styles.timerSection}>
        <View style={styles.timerRow}>
          <Text style={styles.timerLabel}>Time Attack</Text>
          <Text style={styles.timerValue}>
            {(Math.max(timeLeftMs, 0) / 1000).toFixed(1)}s
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: progressPercent,
                backgroundColor: timedOut
                  ? 'rgba(248, 113, 113, 0.85)'
                  : '#FACC15',
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.questionCard}>
        <Text style={styles.questionMeta}>
          Frage {index + 1} / {questions.length}
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
              disabled={isAnswerLocked}
              style={[
                styles.optionButton,
                {
                  backgroundColor,
                  borderColor,
                  opacity: extraOpacity,
                },
              ]}
            >
              <Text style={[styles.optionText, { color: textColor }]}>{opt}</Text>
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
              Nicht beantwortete Fragen zaehlen nicht. Moechtest du wirklich abbrechen?
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


