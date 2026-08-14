import type {
  CompletionMap,
  PlanStats,
  TrainingPlan,
  Workout,
  WorkoutsByWeek,
} from '../types';
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

/**
 * Is this run optional?
 *
 * Derived from the text rather than stored as a field, deliberately: it works
 * on plans already saved in localStorage, with no migration needed.
 */
export function isOptionalWorkout(workout: Workout): boolean {
  return /optional/i.test(workout.workoutType) || /optional/i.test(workout.advice);
}

/**
 * Has this run been done?
 *
 * The default is optimistic for required runs whose day has already passed -
 * you will skip far fewer than you complete, so only the exceptions need
 * tapping. Today's run is not assumed, because the day is not over yet, and
 * optional runs are never assumed because they are skipped often.
 */
export function isRunCompleted(
  workout: Workout,
  overrides: CompletionMap,
  todayStr: string,
): boolean {
  const override = overrides[workout.id];
  if (override) return override === 'done';

  return !isOptionalWorkout(workout) && workout.dateStr < todayStr;
}

/** The ids of every run currently counted as done, defaults included. */
export function completedWorkoutIds(
  workouts: readonly Workout[],
  overrides: CompletionMap,
  todayStr: string,
): Set<string> {
  const ids = new Set<string>();
  for (const workout of workouts) {
    if (isRunCompleted(workout, overrides, todayStr)) ids.add(workout.id);
  }
  return ids;
}

/**
 * All derived figures for the header, computed once.
 *
 * Optional runs are excluded from the target, so the progress bar can actually
 * reach 100% for someone who skips them. Ticking one adds to `bonusKm` instead.
 */
export function computePlanStats(
  plan: TrainingPlan,
  todayStr: string,
  completedIds: ReadonlySet<string>,
): PlanStats {
  const weekNumber = currentWeekNumber(plan.workouts, todayStr);
  const currentWeekWorkouts = plan.workouts.filter((w) => w.weekNumber === weekNumber);

  const coreWorkouts = plan.workouts.filter((w) => !isOptionalWorkout(w));
  const optionalWorkouts = plan.workouts.filter(isOptionalWorkout);

  const loggedCore = coreWorkouts.filter((w) => completedIds.has(w.id));
  const loggedOptional = optionalWorkouts.filter((w) => completedIds.has(w.id));

  const coreKm = sumKm(coreWorkouts);
  const loggedKm = sumKm(loggedCore);
  const bonusKm = sumKm(loggedOptional);

  const progressPercent =
    coreKm > 0 ? Math.min(100, Math.max(0, (loggedKm / coreKm) * 100)) : 0;

  return {
    currentWeekNumber: weekNumber,
    currentWeekKm: sumKm(currentWeekWorkouts),
    loggedKm,
    bonusKm,
    coreKm,
    totalKm: sumKm(plan.workouts),
    elapsedKm: sumKm(plan.workouts.filter((w) => w.dateStr < todayStr)),
    loggedCount: loggedCore.length,
    coreCount: coreWorkouts.length,
    bonusCount: loggedOptional.length,
    totalCount: plan.workouts.length,
    progressPercent,
    daysUntilRace: Math.max(0, daysBetweenISO(todayStr, plan.raceDateStr)),
  };
}

export function workoutsInWeek(plan: TrainingPlan, weekNumber: number): Workout[] {
  return plan.workouts.filter((workout) => workout.weekNumber === weekNumber);
}
