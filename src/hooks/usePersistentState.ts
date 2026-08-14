import { useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { readJSON, writeJSON } from '../lib/storage';

/**
 * useState that mirrors to localStorage.
 *
 * `revive` runs on the parsed JSON and must return null for anything it does
 * not recognise. That is what stops a corrupt or outdated payload from putting
 * a broken shape into React state - the original code called JSON.parse with no
 * guard at all, so one bad write left the app on a permanent white screen.
 */
export function usePersistentState<T>(
  key: string,
  revive: (parsed: unknown) => T | null,
  createFallback: () => T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => readJSON(key, revive, createFallback()));

  // Skip the first write: it would just re-save what we read a moment ago.
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    writeJSON(key, value);
  }, [key, value]);

  return [value, setValue];
}
