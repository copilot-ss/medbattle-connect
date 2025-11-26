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

  const handleExpire = useCallback(() => {
    if (expiredRef.current) {
      return;
    }
    expiredRef.current = true;
    clearTimers();
    setRunning(false);
    setTimeLeftMs(0);
    if (typeof onExpire === 'function') {
      onExpire();
    }
  }, [clearTimers, onExpire]);

  const start = useCallback(() => {
    clearTimers();
    expiredRef.current = false;
    setRunning(true);
    setTimeLeftMs(durationMs);

    intervalRef.current = setInterval(() => {
      setTimeLeftMs((prev) => {
        const next = prev - 100;
        if (next <= 0) {
          handleExpire();
          return 0;
        }
        return next;
      });
    }, 100);

    timeoutRef.current = setTimeout(() => {
      handleExpire();
    }, durationMs);
  }, [clearTimers, durationMs, handleExpire]);

  const stop = useCallback(() => {
    clearTimers();
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
  };
}
