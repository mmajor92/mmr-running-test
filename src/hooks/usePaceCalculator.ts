import { useCallback, useMemo, useState } from 'react';

const MIN_PACE_MINUTES = 1;
const MAX_PACE_MINUTES = 20;

export interface PaceSplits {
  fiveK: string;
  tenK: string;
  sixteenK: string;
  halfMarathon: string;
}

export interface UsePaceCalculatorResult {
  minutes: string;
  seconds: string;
  setMinutes: (raw: string) => void;
  setSeconds: (raw: string) => void;
  /** Clamps the field on blur, so a typed "99" cannot poison the splits. */
  commit: () => void;
  stepMinutes: (delta: number) => void;
  stepSeconds: (delta: number) => void;
  splits: PaceSplits;
}

function formatDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return '-';

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');

  return hours > 0 ? `${hours}:${mm}:${ss}` : `${minutes}:${ss}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Minutes and seconds live in one state object.
 *
 * They used to be two separate strings, and the seconds stepper called the
 * minutes stepper, reading a value captured at render time. Two fast clicks on
 * the boundary dropped a minute. One object means both fields roll over in a
 * single functional update, which is always current.
 */
export function usePaceCalculator(
  initialMinutes = 5,
  initialSeconds = 40,
): UsePaceCalculatorResult {
  const [pace, setPace] = useState({
    minutes: String(initialMinutes),
    seconds: String(initialSeconds).padStart(2, '0'),
  });

  const setMinutes = useCallback((raw: string) => {
    setPace((prev) => ({ ...prev, minutes: raw.replace(/\D/g, '').slice(0, 2) }));
  }, []);

  const setSeconds = useCallback((raw: string) => {
    setPace((prev) => ({ ...prev, seconds: raw.replace(/\D/g, '').slice(0, 2) }));
  }, []);

  const commit = useCallback(() => {
    setPace((prev) => {
      const minutes = clamp(
        Number.parseInt(prev.minutes, 10) || MIN_PACE_MINUTES,
        MIN_PACE_MINUTES,
        MAX_PACE_MINUTES,
      );
      const seconds = clamp(Number.parseInt(prev.seconds, 10) || 0, 0, 59);
      return { minutes: String(minutes), seconds: String(seconds).padStart(2, '0') };
    });
  }, []);

  const stepMinutes = useCallback((delta: number) => {
    setPace((prev) => {
      const current = Number.parseInt(prev.minutes, 10) || MIN_PACE_MINUTES;
      const next = clamp(current + delta, MIN_PACE_MINUTES, MAX_PACE_MINUTES);
      return { ...prev, minutes: String(next) };
    });
  }, []);

  const stepSeconds = useCallback((delta: number) => {
    setPace((prev) => {
      const currentMinutes = Number.parseInt(prev.minutes, 10) || MIN_PACE_MINUTES;
      const currentSeconds = Number.parseInt(prev.seconds, 10) || 0;

      let minutes = currentMinutes;
      let seconds = currentSeconds + delta;

      if (seconds > 59) {
        seconds = 0;
        minutes += 1;
      } else if (seconds < 0) {
        seconds = 59;
        minutes -= 1;
      }

      minutes = clamp(minutes, MIN_PACE_MINUTES, MAX_PACE_MINUTES);
      return { minutes: String(minutes), seconds: String(seconds).padStart(2, '0') };
    });
  }, []);

  const splits = useMemo<PaceSplits>(() => {
    const minutes = clamp(Number.parseInt(pace.minutes, 10) || 0, 0, MAX_PACE_MINUTES);
    const seconds = clamp(Number.parseInt(pace.seconds, 10) || 0, 0, 59);
    const paceSeconds = minutes * 60 + seconds;

    return {
      fiveK: formatDuration(paceSeconds * 5),
      tenK: formatDuration(paceSeconds * 10),
      sixteenK: formatDuration(paceSeconds * 16),
      halfMarathon: formatDuration(paceSeconds * 21.0975),
    };
  }, [pace.minutes, pace.seconds]);

  return {
    minutes: pace.minutes,
    seconds: pace.seconds,
    setMinutes,
    setSeconds,
    commit,
    stepMinutes,
    stepSeconds,
    splits,
  };
}
