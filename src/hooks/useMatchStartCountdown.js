import { useCallback, useEffect, useRef, useState } from 'react';

export const START_COUNTDOWN_STEP_MS = 700;
export const START_COUNTDOWN_NAVIGATE_DELAY_MS = 2850;

export default function useMatchStartCountdown({
  canStart = true,
  fetchLatestMatchById = null,
  onNavigate = null,
}) {
  const countdownTimeoutsRef = useRef([]);
  const activeStartMatchIdRef = useRef(null);
  const prefetchedMatchRef = useRef(null);
  const [showStartCountdown, setShowStartCountdown] = useState(false);
  const [startCountdownValue, setStartCountdownValue] = useState(3);

  const clearStartCountdownTimers = useCallback(() => {
    countdownTimeoutsRef.current.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    countdownTimeoutsRef.current = [];
  }, []);

  const resetStartCountdown = useCallback(() => {
    activeStartMatchIdRef.current = null;
    prefetchedMatchRef.current = null;
    setShowStartCountdown(false);
    setStartCountdownValue(3);
    clearStartCountdownTimers();
  }, [clearStartCountdownTimers]);

  useEffect(
    () => () => {
      resetStartCountdown();
    },
    [resetStartCountdown]
  );

  const beginMatchStartCountdown = useCallback(
    ({ match, role }) => {
      if (!canStart || !match?.id || !role || typeof onNavigate !== 'function') {
        return;
      }

      if (activeStartMatchIdRef.current === match.id) {
        return;
      }

      activeStartMatchIdRef.current = match.id;
      prefetchedMatchRef.current = match;
      clearStartCountdownTimers();
      setStartCountdownValue(3);
      setShowStartCountdown(true);

      if (typeof fetchLatestMatchById === 'function') {
        Promise.resolve(fetchLatestMatchById(match.id))
          .then((result) => {
            if (activeStartMatchIdRef.current !== match.id) {
              return;
            }
            if (result?.ok && result.match) {
              prefetchedMatchRef.current = result.match;
            }
          })
          .catch((err) => {
            console.warn('Konnte Match fuer Countdown-Start nicht vorladen:', err);
          });
      }

      const scheduleStep = (value, delayMs) => {
        const timeoutId = setTimeout(() => {
          if (activeStartMatchIdRef.current !== match.id) {
            return;
          }
          setStartCountdownValue(value);
        }, delayMs);
        countdownTimeoutsRef.current.push(timeoutId);
      };

      scheduleStep(2, START_COUNTDOWN_STEP_MS);
      scheduleStep(1, START_COUNTDOWN_STEP_MS * 2);
      scheduleStep('go', START_COUNTDOWN_STEP_MS * 3);

      const navigateTimeoutId = setTimeout(() => {
        if (activeStartMatchIdRef.current !== match.id) {
          return;
        }

        const preloadedMatch =
          prefetchedMatchRef.current?.id === match.id
            ? prefetchedMatchRef.current
            : match;

        setShowStartCountdown(false);
        clearStartCountdownTimers();

        onNavigate({
          match,
          role,
          preloadedMatch,
        });
      }, START_COUNTDOWN_NAVIGATE_DELAY_MS);

      countdownTimeoutsRef.current.push(navigateTimeoutId);
    },
    [
      canStart,
      clearStartCountdownTimers,
      fetchLatestMatchById,
      onNavigate,
    ]
  );

  return {
    showStartCountdown,
    startCountdownValue,
    beginMatchStartCountdown,
    resetStartCountdown,
  };
}
