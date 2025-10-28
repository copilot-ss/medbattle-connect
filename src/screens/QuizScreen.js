import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabaseClient';
import { fetchQuestions, submitScore } from '../services/quizService';

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
  const feedbackTimerRef = useRef(null);
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
  const screenStyle = {
    flex: 1,
    backgroundColor: '#030712',
    paddingHorizontal: 20,
    paddingVertical: 32,
  };
  const totalQuestions = questions.length;

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    async function loadQuestions() {
      try {
        setLoading(true);
        const data = await fetchQuestions(normalizedDifficulty, questionLimit);
        if (!data.length) {
          setError(
            'Keine Fragen verfuegbar. Bitte kontrolliere die Supabase-Daten oder verwende die Platzhalter.'
          );
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
    setSelectedOption(null);
    setIsAnswerLocked(false);
    setQuestions([]);
    setIndex(0);
    setScore(0);
    loadQuestions();
  }, [normalizedDifficulty]);

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
    async (finalScoreValue) => {
      if (userId) {
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

      navigation.navigate('Result', {
        score: finalScoreValue,
        total: totalQuestions,
        userId,
        difficulty: difficultyLabel,
        difficultyKey: normalizedDifficulty,
        questionLimit,
      });
    },
    [
      userId,
      normalizedDifficulty,
      totalQuestions,
      difficultyLabel,
      questionLimit,
      navigation,
    ]
  );

  if (loading) {
    return (
      <View
        style={{
          ...screenStyle,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" color="#60A5FA" />
        <Text style={{ marginTop: 12, color: '#E2E8F0' }}>
          Fragen werden geladen ...
        </Text>
      </View>
    );
  }

  if (error || !questions.length) {
    return (
      <View
        style={{
          ...screenStyle,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            fontSize: 18,
            color: '#E2E8F0',
            textAlign: 'center',
            marginBottom: 24,
          }}
        >
          {error ??
            'Keine Fragen verfuegbar. Bitte versuche es spaeter erneut.'}
        </Text>
        <Pressable
          onPress={() => navigation.navigate('Home')}
          style={{
            backgroundColor: '#60A5FA',
            paddingVertical: 12,
            paddingHorizontal: 28,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: '#0F172A', fontSize: 16, fontWeight: '600' }}>
            Zurueck zur Basis
          </Text>
        </Pressable>
      </View>
    );
  }

  const currentQuestion = questions[index];

  if (!currentQuestion) {
    return null;
  }

  async function answer(option) {
    if (isAnswerLocked || !currentQuestion) {
      return;
    }

    const isCorrect = option === currentQuestion.correct_answer;
    const finalScoreValue = isCorrect ? score + 1 : score;

    setSelectedOption(option);
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
        finalizeQuiz(finalScoreValue);
      }
    }, 900);
  }

  return (
    <View style={screenStyle}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <View>
          <Text
            style={{
              color: '#94A3B8',
              fontSize: 13,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
            }}
          >
            {difficultyLabel} • {questionLimit} Fragen
          </Text>
          <Text
            style={{
              color: '#F8FAFC',
              fontSize: 26,
              fontWeight: '800',
            }}
          >
            Battle laufend
          </Text>
        </View>
        <View
          style={{
            backgroundColor: 'rgba(96, 165, 250, 0.2)',
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderWidth: 1,
            borderColor: 'rgba(96, 165, 250, 0.4)',
          }}
        >
          <Text style={{ color: '#BFDBFE', fontSize: 14, fontWeight: '600' }}>
            Score {score}
          </Text>
        </View>
      </View>

      <View
        style={{
          backgroundColor: '#0F172A',
          borderRadius: 20,
          paddingVertical: 22,
          paddingHorizontal: 20,
          borderWidth: 1,
          borderColor: 'rgba(59, 130, 246, 0.25)',
          marginBottom: 28,
        }}
      >
        <Text
          style={{
            color: '#60A5FA',
            fontSize: 16,
            fontWeight: '600',
            marginBottom: 6,
          }}
        >
          Frage {index + 1} / {questions.length}
        </Text>
        <Text
          style={{
            color: '#F8FAFC',
            fontSize: 20,
            lineHeight: 28,
            fontWeight: '600',
          }}
        >
          {currentQuestion.question}
        </Text>
      </View>

      <View style={{ gap: 12 }}>
        {currentQuestion.options.map((opt, i) => {
          const optionKey = `${i}-${opt}`;
          const isOptionSelected = selectedOption === opt;
          const isCorrectOption = opt === currentQuestion.correct_answer;
          const showFeedback = isAnswerLocked && selectedOption !== null;

          let backgroundColor = '#111827';
          let borderColor = 'rgba(148, 163, 184, 0.25)';
          let textColor = '#E2E8F0';

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
              style={{
                backgroundColor,
                borderRadius: 16,
                paddingVertical: 14,
                paddingHorizontal: 18,
                borderWidth: 1,
                borderColor,
                opacity: isAnswerLocked && !isOptionSelected && !isCorrectOption ? 0.85 : 1,
              }}
            >
              <Text
                style={{
                  color: textColor,
                  fontSize: 16,
                  fontWeight: '600',
                }}
              >
                {opt}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
