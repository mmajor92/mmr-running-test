import type { TrainingPlan, Workout } from '../types';

/**
 * Builds the Strava title at the moment it is copied.
 *
 * It used to be stored on each workout, which meant a plan created from the
 * built-in template carried the template's hardcoded "HM Plan (Week 1/8)"
 * titles forever, no matter what the plan was actually called. Deriving it
 * means renaming a plan updates every title, and stale data cannot happen.
 */
export function buildStravaTitle(
  workout: Workout,
  planName: string,
  totalWeeks: number,
): string {
  const week = totalWeeks > 0 ? `Week ${workout.weekNumber}/${totalWeeks}` : `Week ${workout.weekNumber}`;
  const name = planName.trim() || 'Training Plan';

  const parts = [`${name} (${week}): ${workout.workoutType}`];
  if (workout.breakdown && workout.breakdown !== workout.workoutType) {
    parts.push(workout.breakdown);
  }
  if (workout.totalKm) {
    parts.push(`${workout.totalKm} Total`);
  }

  return parts.join(' - ').replace(/\s+/g, ' ').trim();
}

/** Highest week number in a plan, used for the "Week 3/8" part. */
export function totalWeeksIn(plan: TrainingPlan): number {
  if (plan.workouts.length === 0) return 0;
  return Math.max(...plan.workouts.map((workout) => workout.weekNumber));
}
