import { startTransition, useCallback, useEffect, useState } from 'react';
import { usePreferences } from '../../../context/PreferencesContext';
import { fetchQuestions } from '../../../services/quizService';
import { t } from '../../../i18n';

function shuffleOptions(options) {
  const array = Array.isArray(options) ? [...options] : [];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
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
  questionLimit,
  category,
  isOffline = false,
}) {
  const safeCategory =
    typeof category === 'string' && category.trim() ? category.trim() : null;
  const { language } = usePreferences();
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

      try {
        const data = await fetchQuestions(questionLimit, safeCategory, {
          offline: isOffline,
          language,
          fallbackLanguage: language === 'de' ? 'de' : null,
        });
        const prepared = prepareQuestions(data);

        if (!cancelled) {
          if (!prepared.length) {
            setError(
              safeCategory
                ? t('Keine Fragen für {category} verfügbar. Bitte versuche es gleich nochmal.', {
                    category: safeCategory,
                  })
                : t('Keine Fragen verfügbar. Bitte versuche es gleich nochmal.')
            );
            startTransition(() => {
              setQuestions([]);
            });
            setLoading(false);
            return;
          }

          startTransition(() => {
            setError(null);
            setQuestions(prepared);
          });
          setLoading(false);
        }
      } catch (err) {
        console.error('Fehler beim Laden der Fragen', err);
        if (!cancelled) {
          setError(t('Die Fragen konnten nicht geladen werden. Bitte versuche es später erneut.'));
          startTransition(() => {
            setQuestions([]);
          });
          setLoading(false);
        }
      }
    }

    loadQuestions();

    return () => {
      cancelled = true;
    };
  }, [isEnabled, isOffline, language, questionLimit, safeCategory]);

  return {
    questions,
    loading,
    error,
    reset,
  };
}
