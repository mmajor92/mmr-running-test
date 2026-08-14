import type { TrainingPlan, Workout } from '../types';
import {
  addDaysISO,
  daysBetweenISO,
  formatDayName,
  formatDisplayDate,
  formatLongDateISO,
  parseISODate,
} from '../lib/date';

/** The date the template below was authored against. Used to rebase dates. */
export const TEMPLATE_START_DATE = '2026-07-27';
export const TEMPLATE_RACE_DATE = '2026-09-20';

export const DEFAULT_WORKOUTS: readonly Workout[] = [
  { id: '1', weekNumber: 1, dateStr: '2026-07-28', displayDate: 'Jul 28', dayName: 'Tue', workoutType: 'VO2 Max Intervals ⚡', category: 'intervals', breakdown: '1.5 km Warmup + 5x2 mins @ 5k Pace (90s recovery jog) + 1.5 km Cooldown', numericKm: 5.0, totalKm: '5.0 km', stravaTitle: 'HM Plan (Week 1/8): VO2 Max Intervals - 1.5 km Warmup + 5x2 mins @ 5k Pace + 1.5 km Cooldown = 5.0 km Total', advice: 'Focus on sustained power and smooth turnover 🏃‍♂️.', nrc: 'One Hard One Easy' },
  { id: '2', weekNumber: 1, dateStr: '2026-07-30', displayDate: 'Jul 30', dayName: 'Thu', workoutType: 'Easy Progression 🌿', category: 'progression', breakdown: '4 km Easy (@ 6:15-6:30/km) + 2 km @ Race Pace (@ 5:40-5:50/km)', numericKm: 6.0, totalKm: '6.0 km', stravaTitle: 'HM Plan (Week 1/8): Easy Progression - 4 km Easy + 2 km @ Race Pace = 6.0 km Total', advice: 'Zone 2 start smooth race pace pick-up over final 2 km 🎯.' },
  { id: '3', weekNumber: 1, dateStr: '2026-07-31', displayDate: 'Jul 31', dayName: 'Fri', workoutType: 'Optional Shakeout 👟', category: 'shakeout', breakdown: '3 km Super Easy Zone 2 Jog + 6x20 secs Strides', numericKm: 3.5, totalKm: '3.5 km', stravaTitle: 'HM Plan (Week 1/8): Optional Shakeout - 3 km Super Easy Jog + 6x20s Strides = 3.5 km Total', advice: '100% optional shakeout! Skip if calves feel tight before Saturday effort 🛑.' },
  { id: '4', weekNumber: 1, dateStr: '2026-08-01', displayDate: 'Aug 1', dayName: 'Sat', workoutType: '5k PB Attempt! 🏆', category: 'raceday', breakdown: '1 km Warmup + 5 km Race Effort + 1 km Cooldown', numericKm: 7.0, totalKm: '7.0 km', stravaTitle: 'HM Plan (Week 1/8): 5k PB Attempt - 1 km Warmup + 5 km Race Effort + 1 km Cooldown = 7.0 km Total', advice: 'Pacing: Hold 5:10/km for Km 1–2, 5:05/km for Km 3–4 and give everything in Km 5 🔥!' },
  { id: '5', weekNumber: 1, dateStr: '2026-08-02', displayDate: 'Aug 2', dayName: 'Sun', workoutType: 'Aerobic Long Run 🌳', category: 'longrun', breakdown: '65 Mins (~10 km Steady @ 6:20–6:40/km off-road)', numericKm: 10.0, totalKm: '10.0 km', stravaTitle: 'HM Plan (Week 1/8): Aerobic Long Run - 65 Mins (~10 km Steady off-road)', advice: 'Focus on time on feet! Off-road pace runs naturally 10–15s slower 🌲.' },
  { id: '6', weekNumber: 2, dateStr: '2026-08-05', displayDate: 'Aug 5', dayName: 'Wed', workoutType: 'VO2 Max Intervals ⚡', category: 'intervals', breakdown: '1.5 km Warmup + 6x2 mins @ 5k Pace (90s recovery jog) + 1.5 km Cooldown', numericKm: 5.4, totalKm: '5.4 km', stravaTitle: 'HM Plan (Week 2/8): VO2 Max Intervals - 1.5 km Warmup + 6x2 mins @ 5k Pace + 1.5 km Cooldown = 5.4 km Total', advice: 'Build manageable lactate buildup while maintaining strong relaxed form 🏃‍♂️.', nrc: 'Five by Fives' },
  { id: '7', weekNumber: 2, dateStr: '2026-08-06', displayDate: 'Aug 6', dayName: 'Thu', workoutType: 'Easy Progression 🌿', category: 'progression', breakdown: '5 km Easy (@ 6:15-6:30/km) + 2 km @ Race Pace (@ 5:40-5:50/km)', numericKm: 7.0, totalKm: '7.0 km', stravaTitle: 'HM Plan (Week 2/8): Easy Progression - 5 km Easy + 2 km @ Race Pace = 7.0 km Total', advice: 'Relaxed Zone 2 aerobic base building with a race pace finish 🎯.' },
  { id: '8', weekNumber: 2, dateStr: '2026-08-07', displayDate: 'Aug 7', dayName: 'Fri', workoutType: 'Optional Shakeout 👟', category: 'shakeout', breakdown: '3.5 km Super Easy Zone 2 Jog + 6x20 secs Strides', numericKm: 4.0, totalKm: '4.0 km', stravaTitle: 'HM Plan (Week 2/8): Optional Shakeout - 3.5 km Super Easy Jog + 6x20s Strides = 4.0 km Total', advice: 'Optional recovery shakeout to keep legs fresh for Sunday long run 🌿.' },
  { id: '9', weekNumber: 2, dateStr: '2026-08-09', displayDate: 'Aug 9', dayName: 'Sun', workoutType: 'Aerobic Long Run 🌳', category: 'longrun', breakdown: '85 Mins (~13 km Steady @ 6:20–6:40/km off-road)', numericKm: 13.0, totalKm: '13.0 km', stravaTitle: 'HM Plan (Week 2/8): Aerobic Long Run - 85 Mins (~13 km Steady off-road)', advice: 'Fueling: Take 300–500ml water + 1 energy gel at 45 mins 💧🍌.' },
  { id: '10', weekNumber: 3, dateStr: '2026-08-11', displayDate: 'Aug 11', dayName: 'Tue', workoutType: 'Ladder Intervals ⚡', category: 'intervals', breakdown: '1.5 km Warmup + (2m-4m-6m-4m-2m @ 5k/10k pace 2 min jog rest) + 1.5 km Cooldown', numericKm: 6.6, totalKm: '6.6 km', stravaTitle: 'HM Plan (Week 3/8): Ladder Intervals - 1.5 km Warmup + (2m-4m-6m-4m-2m) + 1.5 km Cooldown = 6.6 km Total', advice: 'Teaches your body to process and clear lactate under sustained fatigue ⚡.', nrc: 'The Ladder' },
  { id: '11', weekNumber: 3, dateStr: '2026-08-13', displayDate: 'Aug 13', dayName: 'Thu', workoutType: 'Easy Progression 🌿', category: 'progression', breakdown: '6 km Easy (@ 6:15-6:30/km) + 2 km @ Race Pace (@ 5:40-5:50/km)', numericKm: 8.0, totalKm: '8.0 km', stravaTitle: 'HM Plan (Week 3/8): Easy Progression - 6 km Easy + 2 km @ Race Pace = 8.0 km Total', advice: 'Smooth pace acceleration over the final 2 km 🎯.' },
  { id: '12', weekNumber: 3, dateStr: '2026-08-14', displayDate: 'Aug 14', dayName: 'Fri', workoutType: 'Optional Shakeout 👟', category: 'shakeout', breakdown: '4 km Super Easy Zone 2 Jog + 6x20 secs Strides', numericKm: 4.5, totalKm: '4.5 km', stravaTitle: 'HM Plan (Week 3/8): Optional Shakeout - 4 km Super Easy Jog + 6x20s Strides = 4.5 km Total', advice: 'Low effort shakeout with 6x20 secs Strides to prime the nervous system 🌿.' },
  { id: '13', weekNumber: 3, dateStr: '2026-08-16', displayDate: 'Aug 16', dayName: 'Sun', workoutType: 'Aerobic Long Run 🌳', category: 'longrun', breakdown: '95 Mins (~15 km Steady @ 6:20–6:40/km off-road)', numericKm: 15.0, totalKm: '15.0 km', stravaTitle: 'HM Plan (Week 3/8): Aerobic Long Run - 95 Mins (~15 km Steady off-road)', advice: 'Fueling: Take 1 energy gel at 45 mins and 90 mins with water 💧🍌.' },
  { id: '14', weekNumber: 4, dateStr: '2026-08-18', displayDate: 'Aug 18', dayName: 'Tue', workoutType: 'Threshold Repeat Blocks ⚡', category: 'intervals', breakdown: '1.5 km Warmup + 3x6 mins @ 10k Pace (2 min recovery jog) + 1.5 km Cooldown', numericKm: 7.5, totalKm: '7.5 km', stravaTitle: 'HM Plan (Week 4/8): Threshold Repeat Blocks - 1.5 km Warmup + 3x6 mins @ 10k Pace + 1.5 km Cooldown = 7.5 km Total', advice: 'Extended interval blocks to dial in half-marathon pace endurance 🏃‍♂️.', nrc: 'Triple 3s' },
  { id: '15', weekNumber: 4, dateStr: '2026-08-20', displayDate: 'Aug 20', dayName: 'Thu', workoutType: 'Tempo / Pace Run 🌿', category: 'progression', breakdown: '2 km Easy + 4 km @ Race Pace (@ 5:40/km) + 2 km Cooldown', numericKm: 8.0, totalKm: '8.0 km', stravaTitle: 'HM Plan (Week 4/8): Tempo Run - 2 km Easy + 4 km @ Race Pace + 2 km Cooldown = 8.0 km Total', advice: 'Lock into exact race rhythm on flat ground 🎯.' },
  { id: '16', weekNumber: 4, dateStr: '2026-08-21', displayDate: 'Aug 21', dayName: 'Fri', workoutType: 'Optional Shakeout 👟', category: 'shakeout', breakdown: '4 km Super Easy Zone 2 Jog + 6x20 secs Strides', numericKm: 4.5, totalKm: '4.5 km', stravaTitle: 'HM Plan (Week 4/8): Optional Shakeout - 4 km Super Easy Jog + 6x20s Strides = 4.5 km Total', advice: '100% optional shakeout with 6x20 secs Strides to keep legs fresh 🌿.' },
  { id: '17', weekNumber: 4, dateStr: '2026-08-23', displayDate: 'Aug 23', dayName: 'Sun', workoutType: 'Step-Up Long Run 🌳', category: 'longrun', breakdown: '110 Mins (~17 km Steady @ 6:20–6:40/km off-road)', numericKm: 17.0, totalKm: '17.0 km', stravaTitle: 'HM Plan (Week 4/8): Step-Up Long Run - 110 Mins (~17 km Steady off-road)', advice: 'Solid step-up time goal to prepare for next week 2-hour peak 🏁. Fueling: Gels at 45m and 90m 🍌💧.' },
  { id: '18', weekNumber: 5, dateStr: '2026-08-25', displayDate: 'Aug 25', dayName: 'Tue', workoutType: 'Sustained VO2 Intervals ⚡', category: 'intervals', breakdown: '1.5 km Warmup + 4x4 mins @ 10k Pace (2 min recovery jog) + 1.5 km Cooldown', numericKm: 6.2, totalKm: '6.2 km', stravaTitle: 'HM Plan (Week 5/8): Sustained VO2 Intervals - 1.5 km Warmup + 4x4 mins @ 10k Pace + 1.5 km Cooldown = 6.2 km Total', advice: 'High-yield intervals building top-tier aerobic power ⚡.', nrc: 'Eight by Eight' },
  { id: '19', weekNumber: 5, dateStr: '2026-08-27', displayDate: 'Aug 27', dayName: 'Thu', workoutType: 'Pace Progression Run 🌿', category: 'progression', breakdown: '5 km Easy + 3 km @ Race Pace (@ 5:40/km)', numericKm: 8.0, totalKm: '8.0 km', stravaTitle: 'HM Plan (Week 5/8): Pace Progression Run - 5 km Easy + 3 km @ Race Pace = 8.0 km Total', advice: 'Lock in target race pace for the final 3 km on tired legs 🎯.' },
  { id: '20', weekNumber: 5, dateStr: '2026-08-28', displayDate: 'Aug 28', dayName: 'Fri', workoutType: 'Optional Shakeout 👟', category: 'shakeout', breakdown: '3.5 km Super Easy Zone 2 Jog + 6x20 secs Strides', numericKm: 4.0, totalKm: '4.0 km', stravaTitle: 'HM Plan (Week 5/8): Optional Shakeout - 3.5 km Super Easy Jog + 6x20s Strides = 4.0 km Total', advice: 'Keep it super relaxed with 6 light strides 🌿.' },
  { id: '21', weekNumber: 5, dateStr: '2026-08-30', displayDate: 'Aug 30', dayName: 'Sun', workoutType: 'PEAK TIME RUN (120 MINS) 🌳', category: 'longrun', breakdown: '120-Minute Time-Capped Trail Run (~18–20 km @ 6:20–6:40/km off-road)', numericKm: 19.0, totalKm: '18-20 km', stravaTitle: 'HM Plan (Week 5/8): PEAK TIME RUN (120 MINS) - 120-Min Trail Run (~18-20 km off-road)', advice: 'Major Milestone! Cap strictly at 2 hours! Fueling: Take gels at 45m and 90m with water 🍌💧.', isMilestone: true },
  { id: '22', weekNumber: 6, dateStr: '2026-09-01', displayDate: 'Sep 1', dayName: 'Tue', workoutType: 'Speed Sharpening ⚡', category: 'intervals', breakdown: '1.5 km Warmup + 5x2 mins @ 5k Pace (90s recovery jog) + 1.5 km Cooldown', numericKm: 5.0, totalKm: '5.0 km', stravaTitle: 'HM Plan (Week 6/8): Speed Sharpening - 1.5 km Warmup + 5x2 mins @ 5k Pace + 1.5 km Cooldown = 5.0 km Total', advice: 'Keep legs fast and springy without generating excessive fatigue ⚡.', nrc: 'Speed Run with Benchmark' },
  { id: '23', weekNumber: 6, dateStr: '2026-09-03', displayDate: 'Sep 3', dayName: 'Thu', workoutType: 'Easy Progression 🌿', category: 'progression', breakdown: '4 km Easy + 2 km @ Race Pace (@ 5:40/km)', numericKm: 6.0, totalKm: '6.0 km', stravaTitle: 'HM Plan (Week 6/8): Easy Progression - 4 km Easy + 2 km @ Race Pace = 6.0 km Total', advice: 'Smooth progression finish 🎯.' },
  { id: '24', weekNumber: 6, dateStr: '2026-09-04', displayDate: 'Sep 4', dayName: 'Fri', workoutType: 'Optional Shakeout 👟', category: 'shakeout', breakdown: '3 km Super Easy Zone 2 Jog + 6x20 secs Strides', numericKm: 3.5, totalKm: '3.5 km', stravaTitle: 'HM Plan (Week 6/8): Optional Shakeout - 3 km Super Easy Jog + 6x20s Strides = 3.5 km Total', advice: 'Light recovery shakeout option with strides to maintain leg turnover 🛑.' },
  { id: '25', weekNumber: 6, dateStr: '2026-09-06', displayDate: 'Sep 6', dayName: 'Sun', workoutType: 'Step-Down Long Run 🌳', category: 'longrun', breakdown: '90 Mins (~14 km Long Run @ 6:20–6:40/km off-road)', numericKm: 14.0, totalKm: '14.0 km', stravaTitle: 'HM Plan (Week 6/8): Step-Down Long Run - 90 Mins (~14 km @ 6:20-6:40/km off-road)', advice: 'Taper Step-Down: Volume drops so your muscles rebuild glycogen 🔋.' },
  { id: '26', weekNumber: 7, dateStr: '2026-09-08', displayDate: 'Sep 8', dayName: 'Tue', workoutType: 'Taper Speed Sharpening ⚡', category: 'intervals', breakdown: '1.5 km Warmup + 4x2 mins @ 5k Pace (90s recovery jog) + 1.5 km Cooldown', numericKm: 4.6, totalKm: '4.6 km', stravaTitle: 'HM Plan (Week 7/8): Taper Speed Sharpening - 1.5 km Warmup + 4x2 mins @ 5k Pace + 1.5 km Cooldown = 4.6 km Total', advice: 'Sharp crisp turnover to maintain neurological sharpness ⚡.', nrc: 'Short & Sweet' },
  { id: '27', weekNumber: 7, dateStr: '2026-09-10', displayDate: 'Sep 10', dayName: 'Thu', workoutType: 'Easy Aerobic Run 🌿', category: 'progression', breakdown: '6 km Easy Run (@ 6:15-6:30/km)', numericKm: 6.0, totalKm: '6.0 km', stravaTitle: 'HM Plan (Week 7/8): Easy Aerobic Run - 6 km Easy Run = 6.0 km Total', advice: 'Keep legs feeling light and relaxed 🌿.' },
  { id: '28', weekNumber: 7, dateStr: '2026-09-11', displayDate: 'Sep 11', dayName: 'Fri', workoutType: 'Optional Shakeout 👟', category: 'shakeout', breakdown: '3 km Super Easy Zone 2 Jog + 6x20 secs Strides', numericKm: 3.5, totalKm: '3.5 km', stravaTitle: 'HM Plan (Week 7/8): Optional Shakeout - 3 km Super Easy Jog + 6x20s Strides = 3.5 km Total', advice: 'Gentle stride session during taper 🛑.' },
  { id: '29', weekNumber: 7, dateStr: '2026-09-13', displayDate: 'Sep 13', dayName: 'Sun', workoutType: 'Taper Long Run 🌳', category: 'longrun', breakdown: '65 Mins (~10 km Easy Long Run @ 6:20–6:40/km)', numericKm: 10.0, totalKm: '10.0 km', stravaTitle: 'HM Plan (Week 7/8): Taper Long Run - 65 Mins (~10 km Easy Long Run)', advice: 'Easy confidence-building taper run 🏁.' },
  { id: '30', weekNumber: 8, dateStr: '2026-09-15', displayDate: 'Sep 15', dayName: 'Tue', workoutType: 'Race Prep Sharpening ⚡', category: 'intervals', breakdown: '1.5 km Warmup + 3x2 mins @ Race Pace (90s recovery jog) + 1.0 km Cooldown', numericKm: 3.7, totalKm: '3.7 km', stravaTitle: 'HM Plan (Week 8/8): Race Prep Sharpening - 1.5 km Warmup + 3x2 mins @ Race Pace + 1.0 km Cooldown = 3.7 km Total', advice: 'Gently prime the nervous system for target race pace ⚡.', nrc: 'Race Day Prep' },
  { id: '31', weekNumber: 8, dateStr: '2026-09-17', displayDate: 'Sep 17', dayName: 'Thu', workoutType: 'Easy Shakeout Run 🌿', category: 'shakeout', breakdown: '3.5 km Super Easy Jog', numericKm: 3.5, totalKm: '3.5 km', stravaTitle: 'HM Plan (Week 8/8): Easy Shakeout Run - 3.5 km Super Easy Jog = 3.5 km Total', advice: 'Very light leg turnover 🌿.' },
  { id: '32', weekNumber: 8, dateStr: '2026-09-19', displayDate: 'Sep 19', dayName: 'Sat', workoutType: 'Pre-Race Shakeout 👟', category: 'shakeout', breakdown: '2 km Super Easy Shakeout + 2x50m Strides', numericKm: 2.1, totalKm: '2.1 km', stravaTitle: 'HM Plan (Week 8/8): Pre-Race Shakeout - 2 km Super Easy Shakeout + 2x50m Strides = 2.1 km Total', advice: 'Prime legs for tomorrow 🔥.' },
  { id: '33', weekNumber: 8, dateStr: '2026-09-20', displayDate: 'Sep 20', dayName: 'Sun', workoutType: 'RACE DAY! 🏆', category: 'raceday', breakdown: 'Saucony Run Shoreditch Half-Marathon (21.1 km)', numericKm: 21.1, totalKm: '21.1 km', stravaTitle: 'HM Plan (Week 8/8): RACE DAY! - Saucony Run Shoreditch Half-Marathon (21.1 km)', advice: 'Sub-2:00 Target! Lock into 5:40/km pace on road 🏁. Stay smooth and smash that finish! 🔥🚀', isMilestone: true },
] as const;

export const INITIAL_PLAN: TrainingPlan = {
  id: 'plan-1',
  name: 'Saucony Run Shoreditch Prep',
  targetPace: '5:40 /km',
  startDateStr: TEMPLATE_START_DATE,
  raceDateStr: TEMPLATE_RACE_DATE,
  raceDateDisplay: formatLongDateISO(TEMPLATE_RACE_DATE),
  targetTime: '< 2:00:00',
  status: 'active',
  workouts: DEFAULT_WORKOUTS.map((workout) => ({ ...workout })),
};

/**
 * Copies the template onto a new start date.
 *
 * The old code reused DEFAULT_WORKOUTS verbatim, so a plan starting in 2027
 * still showed July 2026 dates, and duplicate workout ids leaked across plans
 * (which made the expand/collapse state bleed between them).
 */
export function createTemplateWorkouts(
  startDateStr: string,
  planId: string,
): Workout[] {
  const targetStart = parseISODate(startDateStr);
  const shiftDays = targetStart ? daysBetweenISO(TEMPLATE_START_DATE, startDateStr) : 0;

  return DEFAULT_WORKOUTS.map((workout, index) => {
    const shiftedDate = addDaysISO(workout.dateStr, shiftDays) ?? workout.dateStr;
    const date = parseISODate(shiftedDate);

    return {
      ...workout,
      id: `${planId}-w${index + 1}`,
      dateStr: shiftedDate,
      displayDate: date ? formatDisplayDate(date) : workout.displayDate,
      dayName: date ? formatDayName(date) : workout.dayName,
    };
  });
}

/** The template race date, shifted to match a custom start date. */
export function templateRaceDateFor(startDateStr: string): string {
  const shiftDays = daysBetweenISO(TEMPLATE_START_DATE, startDateStr);
  return addDaysISO(TEMPLATE_RACE_DATE, shiftDays) ?? TEMPLATE_RACE_DATE;
}
