import { useCallback, useEffect, useRef, useState } from 'react';
import { TIMER_DURATION } from './useQuizConfig';
import { getBoostPointPenalty } from '../../../utils/quizBoosts';

const MULTIPLAYER_POINTS_PER_CORRECT_ANSWER = 3;

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
  onRecordAnswer,
  finalizeQuiz,
  currentQuestionBoostIds,
  surrenderMatch,
}) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const feedbackTimerRef = useRef(null);
  const questionCycleRef = useRef(0);
  const finalizeRequestedRef = useRef(false);
  const mountedRef = useRef(true);
  const answeredQuestionKeyRef = useRef(null);
  const processedQuestionKeyRef = useRef(null);

  const clearFeedbackTimer = useCallback(() => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
  }, []);

  const resetQuestionState = useCallback(() => {
    questionCycleRef.current += 1;
    finalizeRequestedRef.current = false;
    answeredQuestionKeyRef.current = null;
    processedQuestionKeyRef.current = null;
    clearFeedbackTimer();
    stopTimer();
    setSelectedOption(null);
    setIsAnswerLocked(false);
    setTimedOut(false);
  }, [clearFeedbackTimer, stopTimer, setTimedOut]);

  const handleExitRequest = useCallback(() => {
    resetQuestionState();
    setShowExitConfirm(true);
  }, [resetQuestionState]);

  const resetToHome = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs', params: { screen: 'Home' } }],
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
    resetQuestionState,
    resetToHome,
    surrenderMatch,
  ]);

  const unlockQuestionForRetry = useCallback(
    ({ questionKey, questionId, questionCycle }) => {
      if (answeredQuestionKeyRef.current === questionKey) {
        answeredQuestionKeyRef.current = null;
      }
      if (processedQuestionKeyRef.current === questionKey) {
        processedQuestionKeyRef.current = null;
      }
      finalizeRequestedRef.current = false;

      if (!mountedRef.current) {
        return;
      }

      setTimedOut(false);
      setSelectedOption(null);
      setIsAnswerLocked(false);

      if (
        questionCycle === questionCycleRef.current &&
        currentQuestion?.id === questionId &&
        matchIsActive
      ) {
        resetTimer();
      }
    },
    [currentQuestion?.id, matchIsActive, resetTimer, setTimedOut]
  );

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
      const questionCycle = questionCycleRef.current;
      const questionKey = questionSnapshot.id ?? `${currentQuestionIndex}`;

      if (
        answeredQuestionKeyRef.current === questionKey ||
        processedQuestionKeyRef.current === questionKey
      ) {
        return;
      }
      answeredQuestionKeyRef.current = questionKey;

      setTimedOut(timedOutTrigger);

      const isCorrect = option === questionSnapshot.correct_answer;
      const nextSoloScore = isCorrect ? soloBaseScore + 1 : soloBaseScore;
      const boostPenalty = getBoostPointPenalty(currentQuestionBoostIds);
      const nextMatchScore = Math.max(
        0,
        matchBaseScore +
          (isCorrect ? MULTIPLAYER_POINTS_PER_CORRECT_ANSWER : 0) -
          boostPenalty
      );

      if (typeof onRecordAnswer === 'function') {
        onRecordAnswer({
          index: currentQuestionIndex,
          questionId: questionSnapshot.id ?? `${currentQuestionIndex}`,
          question: questionSnapshot.question ?? '',
          options: Array.isArray(questionSnapshot.options)
            ? questionSnapshot.options
            : [],
          correctAnswer: questionSnapshot.correct_answer ?? null,
          selectedOption: timedOutTrigger ? null : option,
          isCorrect,
          timedOut: timedOutTrigger,
          durationMs: timedOutTrigger ? TIMER_DURATION : elapsedMs,
          boostsUsed: currentQuestionBoostIds,
          explanation: questionSnapshot.explanation ?? null,
        });
      }

      setSelectedOption(timedOutTrigger ? null : option);
      setIsAnswerLocked(true);

      if (!isMultiplayer && isCorrect) {
        setScore(nextSoloScore);
      }

      clearFeedbackTimer();

      const feedbackDelayMs = timedOutTrigger ? 1900 : 900;

      feedbackTimerRef.current = setTimeout(() => {
        const processAnswer = async () => {
          if (
            !mountedRef.current ||
            questionCycle !== questionCycleRef.current
          ) {
            feedbackTimerRef.current = null;
            return;
          }

          if (processedQuestionKeyRef.current === questionKey) {
            feedbackTimerRef.current = null;
            return;
          }
          processedQuestionKeyRef.current = questionKey;

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
                boostsUsed: currentQuestionBoostIds,
              });

              if (!result.ok) {
                unlockQuestionForRetry({
                  questionKey,
                  questionId: questionSnapshot.id,
                  questionCycle,
                });
                console.warn(
                  'Antwort konnte nicht an den Server uebermittelt werden:',
                  result.error?.message ?? result.error ?? 'Unbekannter Fehler'
                );
                return;
              }
            } else {
              console.warn(
                'Match-Frage ohne gueltige ID, Antwort wurde nicht synchronisiert.'
              );
            }
          }

          const nextIndex = currentQuestionIndex + 1;

          if (nextIndex < totalQuestions) {
            questionCycleRef.current += 1;
            setIsAnswerLocked(false);
            if (!isMultiplayer) {
              setIndex(nextIndex);
            }
          } else {
            if (finalizeRequestedRef.current) {
              return;
            }
            finalizeRequestedRef.current = true;
            const finalValue = isMultiplayer ? nextMatchScore : nextSoloScore;
            finalizeQuiz(finalValue, { submit: true });
          }
        };

        processAnswer().catch((err) => {
          console.error('Antwort konnte nicht verarbeitet werden:', err);
          unlockQuestionForRetry({
            questionKey,
            questionId: questionSnapshot.id ?? null,
            questionCycle,
          });
        });
      }, feedbackDelayMs);
    },
    [
      activeIndex,
      activeScore,
      clearFeedbackTimer,
      currentQuestionBoostIds,
      currentQuestion,
      finalizeQuiz,
      isAnswerLocked,
      isMultiplayer,
      matchIsActive,
      onRecordAnswer,
      recordMatchAnswer,
      score,
      setIndex,
      setScore,
      setTimedOut,
      stopTimer,
      timeLeftRef,
      totalQuestions,
      unlockQuestionForRetry,
    ]
  );

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      clearFeedbackTimer();
    };
  }, [clearFeedbackTimer]);

  useEffect(() => {
    answeredQuestionKeyRef.current = null;
    processedQuestionKeyRef.current = null;
    questionCycleRef.current += 1;
    finalizeRequestedRef.current = false;
  }, [activeIndex, currentQuestion?.id]);

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
