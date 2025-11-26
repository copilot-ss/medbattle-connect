import { useCallback, useEffect, useState } from 'react';
import { fetchCampaignQuestions, fetchQuestions } from '../../../services/quizService';
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

export default function useSoloQuestionLoader({
  isEnabled,
  isCampaign,
  normalizedDifficulty,
  questionLimit,
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
      const localFallback =
        !isCampaign && questionLimit > 0 ? fetchCampaignQuestions(questionLimit) : [];

      const useLocalFallback = Array.isArray(localFallback) && localFallback.length > 0;

      if (useLocalFallback) {
        const preparedFallback = localFallback.map((question) => {
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

        if (!cancelled) {
          setQuestions(preparedFallback);
          setError(null);
          setLoading(false);
        }
      }

      try {
        const data = isCampaign
          ? fetchCampaignQuestions(questionLimit)
          : await fetchQuestions(safeDifficulty, questionLimit);

        const sourceQuestions =
          Array.isArray(data) && data.length
            ? data
            : useLocalFallback
            ? localFallback
            : [];

        if (!sourceQuestions.length) {
          if (!cancelled) {
            setError(
              isCampaign
                ? 'No campaign questions bundled yet. Please try again later.'
                : 'Keine Fragen verfuegbar. Bitte versuche es gleich nochmal.'
            );
            setQuestions([]);
          }
          return;
        }

        const prepared = sourceQuestions.map((question) => {
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

        if (!cancelled) {
          setError(null);
          setQuestions(prepared);
          setLoading(false);
        }
      } catch (err) {
        console.error('Fehler beim Laden der Fragen', err);
        if (!cancelled) {
          if (useLocalFallback) {
            setError(null);
            setLoading(false);
          } else {
            setError('Die Fragen konnten nicht geladen werden. Bitte versuche es spaeter erneut.');
            setQuestions([]);
            setLoading(false);
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadQuestions();

    return () => {
      cancelled = true;
    };
  }, [isCampaign, isEnabled, questionLimit, safeDifficulty]);

  return {
    questions,
    loading,
    error,
    reset,
  };
}
