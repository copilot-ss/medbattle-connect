import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

function clampProgress(value) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(1, value));
}

export default function useCountdownTimer(durationMs, { onExpire } = {}) {
  const [timeLeftMs, setTimeLeftMs] = useState(durationMs);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const expiredRef = useRef(false);
  const timeLeftRef = useRef(durationMs);
  const sessionRef = useRef(0);

  useEffect(() => {
    timeLeftRef.current = timeLeftMs;
  }, [timeLeftMs]);

  const clearTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const handleExpire = useCallback((sessionId) => {
    if (sessionId !== sessionRef.current || expiredRef.current) {
      return;
    }
    expiredRef.current = true;
    clearTimers();
    setRunning(false);
    timeLeftRef.current = 0;
    setTimeLeftMs(0);
    if (typeof onExpire === 'function') {
      onExpire();
    }
  }, [clearTimers, onExpire]);

  const scheduleTimers = useCallback(
    (remainingMs) => {
      const safeRemainingMs =
        Number.isFinite(remainingMs) && remainingMs > 0 ? remainingMs : 0;
      sessionRef.current += 1;
      const sessionId = sessionRef.current;
      clearTimers();
      expiredRef.current = false;
      timeLeftRef.current = safeRemainingMs;
      setRunning(true);
      setTimeLeftMs(safeRemainingMs);

      if (safeRemainingMs <= 0) {
        handleExpire(sessionId);
        return;
      }

      intervalRef.current = setInterval(() => {
        if (sessionId !== sessionRef.current) {
          return;
        }
        setTimeLeftMs((prev) => {
          if (sessionId !== sessionRef.current) {
            return prev;
          }
          const next = prev - 100;
          if (next <= 0) {
            timeLeftRef.current = 0;
            handleExpire(sessionId);
            return 0;
          }
          timeLeftRef.current = next;
          return next;
        });
      }, 100);

      timeoutRef.current = setTimeout(() => {
        handleExpire(sessionId);
      }, safeRemainingMs);
    },
    [clearTimers, handleExpire]
  );

  const start = useCallback(() => {
    scheduleTimers(durationMs);
  }, [durationMs, scheduleTimers]);

  const resume = useCallback(() => {
    const remaining = timeLeftRef.current;
    if (!Number.isFinite(remaining) || remaining <= 0) {
      sessionRef.current += 1;
      handleExpire(sessionRef.current);
      return;
    }
    scheduleTimers(remaining);
  }, [handleExpire, scheduleTimers]);

  const stop = useCallback(() => {
    sessionRef.current += 1;
    clearTimers();
    expiredRef.current = false;
    setRunning(false);
  }, [clearTimers]);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  const progress = useMemo(
    () => clampProgress(timeLeftMs / (durationMs || 1)),
    [durationMs, timeLeftMs]
  );

  return {
    timeLeftMs,
    running,
    progress,
    start,
    reset: start,
    stop,
    resume,
  };
}
