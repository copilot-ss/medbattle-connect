import { useCallback, useEffect, useRef, useState } from 'react';
import { TIMER_DURATION } from './useQuizConfig';

export default function useQuizInteractionHandlers({
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
  finalizeQuiz,
  surrenderMatch,
}) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const feedbackTimerRef = useRef(null);

  const clearFeedbackTimer = useCallback(() => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
  }, []);

  const resetQuestionState = useCallback(() => {
    clearFeedbackTimer();
    stopTimer();
    setSelectedOption(null);
    setIsAnswerLocked(false);
    setTimedOut(false);
  }, [clearFeedbackTimer, stopTimer]);

  const handleExitRequest = useCallback(() => {
    resetQuestionState();
    setShowExitConfirm(true);
  }, [resetQuestionState]);

  const resetToHome = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  }, [navigation]);

  const handleExitCancel = useCallback(() => {
    setShowExitConfirm(false);
    if (currentQuestion && matchIsActive) {
      resetTimer();
    }
  }, [currentQuestion, matchIsActive, resetTimer]);

  const handleExitConfirm = useCallback(() => {
    resetQuestionState();
    setShowExitConfirm(false);
    if (isMultiplayer) {
      surrenderMatch().finally(() => {
        resetToHome();
      });
      return;
    }
    resetToHome();
  }, [
    isMultiplayer,
    navigation,
    resetQuestionState,
    resetToHome,
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

      stopTimer();
      const questionSnapshot = currentQuestion;
      const currentQuestionIndex = activeIndex;
      const soloBaseScore = score;
      const matchBaseScore = activeScore;
      const elapsedMs = Math.max(0, TIMER_DURATION - timeLeftRef.current);

      setTimedOut(timedOutTrigger);

      const isCorrect = option === questionSnapshot.correct_answer;
      const nextSoloScore = isCorrect ? soloBaseScore + 1 : soloBaseScore;
      const nextMatchScore = isCorrect ? matchBaseScore + 1 : matchBaseScore;

      setSelectedOption(timedOutTrigger ? null : option);
      setIsAnswerLocked(true);

      if (!isMultiplayer && isCorrect) {
        setScore(nextSoloScore);
      }

      clearFeedbackTimer();

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
              console.warn(
                'Match-Frage ohne gueltige ID, Antwort wurde nicht synchronisiert.'
              );
            }
          }

          const nextIndex = currentQuestionIndex + 1;

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
      activeIndex,
      activeScore,
      clearFeedbackTimer,
      currentQuestion,
      finalizeQuiz,
      isAnswerLocked,
      isMultiplayer,
      matchIsActive,
      recordMatchAnswer,
      score,
      stopTimer,
      timeLeftRef,
      totalQuestions,
    ]
  );

  useEffect(() => {
    return () => {
      clearFeedbackTimer();
    };
  }, [clearFeedbackTimer]);

  return {
    answer,
    handleExitCancel,
    handleExitConfirm,
    handleExitRequest,
    isAnswerLocked,
    resetQuestionState,
    selectedOption,
    showExitConfirm,
    timedOut,
  };
}
