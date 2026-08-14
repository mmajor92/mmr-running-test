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
  targetPace: string;
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
  targetPace: string;
  targetTime: string;
  pastedText: string;
}

/** Derived volume figures for the active plan. Numbers, not strings. */
export interface PlanStats {
  currentWeekNumber: number;
  currentWeekKm: number;
  completedKm: number;
  totalKm: number;
  /** 0-100, already clamped and never NaN. */
  progressPercent: number;
  daysUntilRace: number;
}

export type WorkoutsByWeek = Record<number, Workout[]>;
