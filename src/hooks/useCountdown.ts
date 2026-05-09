"use client";

/**
 * Countdown hook for rate-limit banners (FR-AUTH-2, FR-CAT-7).
 * Ticks once per second; clamps at 0; cleans up on unmount.
 */

import { useCallback, useEffect, useRef, useState } from "react";

export interface CountdownState {
  secondsLeft: number;
  isActive: boolean;
  start: (seconds: number) => void;
  cancel: () => void;
}

export function useCountdown(): CountdownState {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const start = useCallback((seconds: number) => {
    clear();
    setSecondsLeft(Math.max(0, Math.floor(seconds)));
  }, []);

  const cancel = useCallback(() => {
    clear();
    setSecondsLeft(0);
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) {
      clear();
      return;
    }
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clear();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return clear;
  }, [secondsLeft]);

  return { secondsLeft, isActive: secondsLeft > 0, start, cancel };
}
