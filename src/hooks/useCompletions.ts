import { useCallback } from 'react';
import { STORAGE_KEYS } from '../constants';
import { usePersistentState } from './usePersistentState';
import type { CompletionMap, CompletionState } from '../types';

/**
 * Accepts the current format ('done' / 'skipped') and the previous one, where
 * the value was the date a run was ticked off. Any old date is read as 'done',
 * so data already saved on a phone carries over rather than being lost.
 */
function reviveCompletions(parsed: unknown): CompletionMap | null {
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return null;

  const result: CompletionMap = {};
  for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (value === 'done' || value === 'skipped') {
      result[key] = value;
    } else if (typeof value === 'string' && value.length > 0) {
      result[key] = 'done'; // Legacy format: the value used to be a date string.
    }
  }
  return result;
}

export interface UseCompletionsResult {
  /** Only explicit choices. Anything absent falls back to the default. */
  overrides: CompletionMap;
  setStatus: (workoutId: string, status: CompletionState) => void;
}

export function useCompletions(): UseCompletionsResult {
  const [overrides, setOverrides] = usePersistentState<CompletionMap>(
    STORAGE_KEYS.completions,
    reviveCompletions,
    () => ({}),
  );

  const setStatus = useCallback(
    (workoutId: string, status: CompletionState) => {
      setOverrides((prev) =>
        prev[workoutId] === status ? prev : { ...prev, [workoutId]: status },
      );
    },
    [setOverrides],
  );

  return { overrides, setStatus };
}
