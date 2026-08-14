import { useMemo } from 'react';
import { groupByWeek, sortedWeekNumbers, sumKm } from '../lib/workouts';
import { WeekHeading } from './WeekHeading';
import { WorkoutCard } from './WorkoutCard';
import type { CopyState } from './WorkoutCard';
import type { Workout } from '../types';

export interface WorkoutListProps {
  workouts: readonly Workout[];
  todayStr: string;
  expandedIds: ReadonlySet<string>;
  copiedId: string | null;
  failedId: string | null;
  onToggle: (workoutId: string) => void;
  onCopy: (workoutId: string, text: string) => void;
  onAddToCalendar: (workout: Workout) => void;
  /** 'desc' puts the most recent week first, for the Previous Runs tab. */
  weekOrder?: 'asc' | 'desc';
  emptyMessage: string;
}

/**
 * One component for all three tabs. The old file repeated this JSX block three
 * times with only the sort direction and the empty copy differing, which is how
 * the Whole Plan tab ended up with no empty state at all.
 */
export function WorkoutList({
  workouts,
  todayStr,
  expandedIds,
  copiedId,
  failedId,
  onToggle,
  onCopy,
  onAddToCalendar,
  weekOrder = 'asc',
  emptyMessage,
}: WorkoutListProps) {
  const byWeek = useMemo(() => groupByWeek(workouts), [workouts]);
  const weekNumbers = useMemo(() => sortedWeekNumbers(byWeek, weekOrder), [byWeek, weekOrder]);

  if (weekNumbers.length === 0) {
    return (
      <p className="p-8 text-center text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
        {emptyMessage}
      </p>
    );
  }

  const copyStateFor = (workoutId: string): CopyState => {
    if (copiedId === workoutId) return 'copied';
    if (failedId === workoutId) return 'failed';
    return 'idle';
  };

  return (
    <div className="space-y-6">
      {weekNumbers.map((weekNumber) => {
        const weekWorkouts = byWeek[weekNumber];
        return (
          <section key={weekNumber} className="space-y-3" aria-label={`Week ${weekNumber}`}>
            <WeekHeading weekNumber={weekNumber} totalKm={sumKm(weekWorkouts)} />
            <div className="space-y-3">
              {weekWorkouts.map((workout) => (
                <WorkoutCard
                  key={workout.id}
                  workout={workout}
                  isToday={workout.dateStr === todayStr}
                  isExpanded={expandedIds.has(workout.id)}
                  copyState={copyStateFor(workout.id)}
                  onToggle={onToggle}
                  onCopy={onCopy}
                  onAddToCalendar={onAddToCalendar}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
