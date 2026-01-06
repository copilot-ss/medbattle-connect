import { useCallback, useEffect, useState } from 'react';
import { fetchQuestions } from '../../../services/quizService';
import { ALLOWED_DIFFICULTIES } from './useQuizConfig';

function shuffleOptions(options) {
  const array = Array.isArray(options) ? [...options] : [];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function normalizeDifficulty(value) {
  return ALLOWED_DIFFICULTIES.includes(value) ? value : 'mittel';
}

function prepareQuestions(questions) {
  return (Array.isArray(questions) ? questions : []).map((question) => {
    const baseOptions = Array.isArray(question.options)
      ? question.options.filter(Boolean)
      : [];
    const optionsSet = new Set(baseOptions);
    if (question.correct_answer && !optionsSet.has(question.correct_answer)) {
      baseOptions.push(question.correct_answer);
    }
    return {
      ...question,
      options: shuffleOptions(baseOptions),
    };
  });
}

export default function useSoloQuestionLoader({
  isEnabled,
  normalizedDifficulty,
  questionLimit,
  isOffline = false,
}) {
  const safeDifficulty = normalizeDifficulty(normalizedDifficulty);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reset = useCallback(() => {
    setQuestions([]);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isEnabled) {
      setQuestions([]);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadQuestions() {
      setLoading(true);
      setQuestions([]);

      try {
        const data = await fetchQuestions(safeDifficulty, questionLimit, null, {
          offline: isOffline,
        });
        const prepared = prepareQuestions(data);

        if (!cancelled) {
          if (!prepared.length) {
            setError('Keine Fragen verfuegbar. Bitte versuche es gleich nochmal.');
            setQuestions([]);
            setLoading(false);
            return;
          }

          setError(null);
          setQuestions(prepared);
          setLoading(false);
        }
      } catch (err) {
        console.error('Fehler beim Laden der Fragen', err);
        if (!cancelled) {
          setError('Die Fragen konnten nicht geladen werden. Bitte versuche es spaeter erneut.');
          setQuestions([]);
          setLoading(false);
        }
      }
    }

    loadQuestions();

    return () => {
      cancelled = true;
    };
  }, [isEnabled, isOffline, questionLimit, safeDifficulty]);

  return {
    questions,
    loading,
    error,
    reset,
  };
}
