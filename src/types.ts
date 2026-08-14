/**
 * Shared domain types for MMRunner.
 * Every union is a named type so it can be reused and exhaustively checked.
 */

export type WorkoutCategory =
  | 'intervals'
  | 'progression'
  | 'shakeout'
  | 'longrun'
  | 'raceday';

export type PlanStatus = 'active' | 'archived';

export type TabId = 'upcoming' | 'whole' | 'previous';

export interface Workout {
  id: string;
  /** ISO calendar date, YYYY-MM-DD. Always local, never UTC. */
  dateStr: string;
  /** e.g. "Aug 1" */
  displayDate: string;
  /** e.g. "Sat" */
  dayName: string;
  workoutType: string;
  category: WorkoutCategory;
  breakdown: string;
  numericKm: number;
  totalKm: string;
  stravaTitle: string;
  advice: string;
  nrc?: string;
  isMilestone?: boolean;
  weekNumber: number;
}

export interface TrainingPlan {
  id: string;
  name: string;
  /** ISO calendar date, YYYY-MM-DD */
  startDateStr: string;
  /** ISO calendar date, YYYY-MM-DD */
  raceDateStr: string;
  raceDateDisplay: string;
  targetTime: string;
  status: PlanStatus;
  workouts: Workout[];
}

export interface ThemeColor {
  readonly hex: string;
  readonly name: string;
}

/** Form state for the "Add plan" modal. */
export interface PlanDraft {
  name: string;
  startDateStr: string;
  raceDateStr: string;
  targetTime: string;
  pastedText: string;
}

/** Derived volume figures for the active plan. Numbers, not strings. */
export interface PlanStats {
  currentWeekNumber: number;
  currentWeekKm: number;
  /** Ticked-off distance from required runs only. */
  loggedKm: number;
  /** Ticked-off distance from optional runs. Credit on top, not part of target. */
  bonusKm: number;
  /** The target: total distance of required runs, optional ones excluded. */
  coreKm: number;
  /** Every run in the plan, optional included. For reference only. */
  totalKm: number;
  /** Distance from runs whose date has passed, ticked or not. */
  elapsedKm: number;
  /** Required runs ticked off. */
  loggedCount: number;
  coreCount: number;
  /** Optional runs ticked off. */
  bonusCount: number;
  totalCount: number;
  /** 0-100, logged over core. Reaches 100 without any optional runs. */
  progressPercent: number;
  daysUntilRace: number;
}

export type WorkoutsByWeek = Record<number, Workout[]>;

/**
 * An explicit choice by the runner, overriding the default.
 * Core runs in the past are assumed done, so only exceptions get stored.
 */
export type CompletionState = 'done' | 'skipped';

/** Workout id -> explicit override. Absent means "use the default". */
export type CompletionMap = Record<string, CompletionState>;
