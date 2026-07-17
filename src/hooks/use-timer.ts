'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

export function useTimer(isRunning: boolean, startTimeMs: number | null) {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const formatTime = useCallback((seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    if (isRunning && startTimeMs) {
      setElapsed(Math.floor((Date.now() - startTimeMs) / 1000));
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeMs) / 1000));
      }, 1000);
    }

    if (!isRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setElapsed(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, startTimeMs]);

  return { elapsed, formatTime };
}