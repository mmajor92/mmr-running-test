import { useCallback, useMemo } from 'react';
import { STORAGE_KEYS } from '../constants';
import { usePersistentState } from './usePersistentState';
import type { CompletionMap } from '../types';

/**
 * Only recognises `{ workoutId: "2026-08-14" }` shaped data, so a corrupt or
 * outdated payload falls back to empty rather than breaking the app.
 */
function reviveCompletions(parsed: unknown): CompletionMap | null {
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return null;

  const result: CompletionMap = {};
  for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (typeof value === 'string' && value.length > 0) result[key] = value;
  }
  return result;
}

export interface UseCompletionsResult {
  /** Set of workout ids the runner has ticked off. */
  completedIds: ReadonlySet<string>;
  toggleCompleted: (workoutId: string, todayStr: string) => void;
  isCompleted: (workoutId: string) => boolean;
}

export function useCompletions(): UseCompletionsResult {
  const [completions, setCompletions] = usePersistentState<CompletionMap>(
    STORAGE_KEYS.completions,
    reviveCompletions,
    () => ({}),
  );

  const completedIds = useMemo(() => new Set(Object.keys(completions)), [completions]);

  const toggleCompleted = useCallback(
    (workoutId: string, todayStr: string) => {
      setCompletions((prev) => {
        if (workoutId in prev) {
          // Rebuild without the key rather than mutating, so React sees a change.
          const next = { ...prev };
          delete next[workoutId];
          return next;
        }
        return { ...prev, [workoutId]: todayStr };
      });
    },
    [setCompletions],
  );

  const isCompleted = useCallback(
    (workoutId: string) => workoutId in completions,
    [completions],
  );

  return { completedIds, toggleCompleted, isCompleted };
}
