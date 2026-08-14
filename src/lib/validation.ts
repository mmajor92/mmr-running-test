/**
 * Runtime guards for data that did not come from TypeScript:
 * localStorage payloads, pasted JSON, imported files.
 *
 * Strategy is repair-then-drop. Recoverable records are normalised, and only
 * records missing something essential (an id or a valid date) are discarded.
 */

import type {
  PlanStatus,
  TrainingPlan,
  Workout,
  WorkoutCategory,
} from '../types';
import { formatDayName, formatDisplayDate, formatLongDate, isValidISODate, parseISODate } from './date';

const CATEGORIES: readonly WorkoutCategory[] = [
  'intervals',
  'progression',
  'shakeout',
  'longrun',
  'raceday',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asFiniteNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function asCategory(value: unknown): WorkoutCategory {
  return CATEGORIES.includes(value as WorkoutCategory)
    ? (value as WorkoutCategory)
    : 'progression';
}

function asStatus(value: unknown): PlanStatus {
  return value === 'archived' ? 'archived' : 'active';
}

/** Normalises one workout. Returns null if the date is unusable. */
export function normalizeWorkout(raw: unknown, index: number): Workout | null {
  if (!isRecord(raw)) return null;

  const dateStr = asString(raw.dateStr);
  const date = parseISODate(dateStr);
  if (!date) return null;

  const numericKm = Math.max(0, asFiniteNumber(raw.numericKm, 0));
  const workoutType = asString(raw.workoutType, 'Run');
  const nrc = typeof raw.nrc === 'string' && raw.nrc.trim() ? raw.nrc : undefined;

  return {
    id: asString(raw.id) || `workout-${dateStr}-${index}`,
    dateStr,
    displayDate: asString(raw.displayDate) || formatDisplayDate(date),
    dayName: asString(raw.dayName) || formatDayName(date),
    workoutType,
    category: asCategory(raw.category),
    breakdown: asString(raw.breakdown, workoutType),
    numericKm,
    totalKm: asString(raw.totalKm) || `${numericKm.toFixed(1)} km`,
    stravaTitle: asString(raw.stravaTitle, workoutType),
    advice: asString(raw.advice),
    ...(nrc ? { nrc } : {}),
    ...(raw.isMilestone === true ? { isMilestone: true as const } : {}),
    weekNumber: Math.max(1, Math.round(asFiniteNumber(raw.weekNumber, 1))),
  };
}

/** Normalises one plan. Returns null if it has no usable workouts. */
export function normalizePlan(raw: unknown, index = 0): TrainingPlan | null {
  if (!isRecord(raw)) return null;

  const workoutsRaw = Array.isArray(raw.workouts) ? raw.workouts : [];
  const workouts = workoutsRaw
    .map((workout, i) => normalizeWorkout(workout, i))
    .filter((workout): workout is Workout => workout !== null)
    .sort((a, b) => a.dateStr.localeCompare(b.dateStr));

  if (workouts.length === 0) return null;

  const startDateStr = isValidISODate(raw.startDateStr)
    ? (raw.startDateStr as string)
    : workouts[0].dateStr;

  const raceDateStr = isValidISODate(raw.raceDateStr)
    ? (raw.raceDateStr as string)
    : workouts[workouts.length - 1].dateStr;

  const raceDate = parseISODate(raceDateStr);

  return {
    id: asString(raw.id) || `plan-${Date.now()}-${index}`,
    name: asString(raw.name, 'Untitled plan').trim() || 'Untitled plan',
    startDateStr,
    raceDateStr,
    raceDateDisplay:
      asString(raw.raceDateDisplay) ||
      (raceDate ? formatLongDate(raceDate) : raceDateStr),
    targetTime: asString(raw.targetTime, '-'),
    status: asStatus(raw.status),
    workouts,
  };
}

/** Normalises a whole plan list, de-duplicating ids. Never returns null. */
export function normalizePlans(raw: unknown): TrainingPlan[] {
  if (!Array.isArray(raw)) return [];

  const seenIds = new Set<string>();
  const plans: TrainingPlan[] = [];

  raw.forEach((item, index) => {
    const plan = normalizePlan(item, index);
    if (!plan) return;

    let { id } = plan;
    while (seenIds.has(id)) id = `${id}-${index}`;
    seenIds.add(id);

    plans.push(id === plan.id ? plan : { ...plan, id });
  });

  return plans;
}
