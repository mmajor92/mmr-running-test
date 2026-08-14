import type { PlanStats, TrainingPlan, Workout, WorkoutsByWeek } from '../types';
import { daysBetweenISO } from './date';

/** Replaces the three near-identical grouping memos in the old App.tsx. */
export function groupByWeek(workouts: readonly Workout[]): WorkoutsByWeek {
  const byWeek: WorkoutsByWeek = {};
  for (const workout of workouts) {
    (byWeek[workout.weekNumber] ??= []).push(workout);
  }
  return byWeek;
}

/** Week numbers present in a grouping, sorted. */
export function sortedWeekNumbers(
  byWeek: WorkoutsByWeek,
  direction: 'asc' | 'desc' = 'asc',
): number[] {
  const weeks = Object.keys(byWeek).map(Number);
  weeks.sort((a, b) => (direction === 'asc' ? a - b : b - a));
  return weeks;
}

export function sumKm(workouts: readonly Workout[]): number {
  return workouts.reduce(
    (total, workout) => total + (Number.isFinite(workout.numericKm) ? workout.numericKm : 0),
    0,
  );
}

export function formatKm(km: number): string {
  return km.toFixed(1);
}

export interface SplitWorkouts {
  upcoming: Workout[];
  previous: Workout[];
}

/** Splits on today's date. `previous` is newest first. */
export function splitByDate(workouts: readonly Workout[], todayStr: string): SplitWorkouts {
  const upcoming: Workout[] = [];
  const previous: Workout[] = [];

  for (const workout of workouts) {
    if (workout.dateStr >= todayStr) upcoming.push(workout);
    else previous.push(workout);
  }

  previous.reverse();
  return { upcoming, previous };
}

/**
 * The week the runner is currently in.
 * The old fallback was a hardcoded `8`, which was wrong for any plan that was
 * not eight weeks long. This falls back to the last week that actually exists.
 */
export function currentWeekNumber(workouts: readonly Workout[], todayStr: string): number {
  const next = workouts.find((workout) => workout.dateStr >= todayStr);
  if (next) return next.weekNumber;
  if (workouts.length === 0) return 1;
  return Math.max(...workouts.map((workout) => workout.weekNumber));
}

/** All derived figures for the header, computed once. Guards divide-by-zero. */
export function computePlanStats(plan: TrainingPlan, todayStr: string): PlanStats {
  const weekNumber = currentWeekNumber(plan.workouts, todayStr);
  const currentWeekWorkouts = plan.workouts.filter((w) => w.weekNumber === weekNumber);

  const totalKm = sumKm(plan.workouts);
  const completedKm = sumKm(plan.workouts.filter((w) => w.dateStr < todayStr));

  const progressPercent =
    totalKm > 0 ? Math.min(100, Math.max(0, (completedKm / totalKm) * 100)) : 0;

  const daysUntilRace = Math.max(0, daysBetweenISO(todayStr, plan.raceDateStr));

  return {
    currentWeekNumber: weekNumber,
    currentWeekKm: sumKm(currentWeekWorkouts),
    completedKm,
    totalKm,
    progressPercent,
    daysUntilRace,
  };
}

export function workoutsInWeek(plan: TrainingPlan, weekNumber: number): Workout[] {
  return plan.workouts.filter((workout) => workout.weekNumber === weekNumber);
}
