import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, CheckCircle2, Flame, Trophy, PlayCircle, 
  ChevronDown, ChevronUp, Copy, Check, Calculator, 
  BarChart3, Archive, PlusCircle, FolderArchive, Clock, 
  Trash2, X, Download, CalendarPlus, Sparkles
} from 'lucide-react';

export type WorkoutType = 
  | 'Easy'
  | 'Speed'
  | 'Tempo'
  | 'Long Run'
  | 'Recovery'
  | 'Race Day';

export const getWorkoutBadgeColor = (type: WorkoutType | string): string => {
  switch (type) {
    case 'Speed':
      return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    case 'Tempo':
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    case 'Long Run':
      return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
    case 'Easy':
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    case 'Recovery':
    case 'Shakeout':
      return 'bg-slate-700/40 text-slate-300 border-slate-600/40';
    case 'Race Day':
      return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50 font-bold';
    default:
      return 'bg-slate-800 text-slate-400 border-slate-700';
  }
};

interface Workout {
  id: string;
  dateStr: string;        // YYYY-MM-DD
  displayDate: string;    // e.g. "Aug 1"
  dayName: string;        // e.g. "Sat"
  workoutType: string;
  category: WorkoutType;
  breakdown: string;
  numericKm: number;
  totalKm: string;
  stravaTitle: string;
  advice: string;
  nrc?: string;
  isMilestone?: boolean;
  weekNumber: number;
}

interface TrainingPlan {
  id: string;
  name: string;
  targetPace: string;
  startDateStr: string;   // YYYY-MM-DD
  raceDateStr: string;    // YYYY-MM-DD
  raceDateDisplay: string;
  targetTime: string;
  status: 'active' | 'archived';
  workouts: Workout[];
}

export interface ThemeColor {
  hex: string;
  name: string;
}

export const THEME_COLORS: ThemeColor[] = [
  { hex: '#f97316', name: 'Energy Orange' },
  { hex: '#f59e0b', name: 'Solar Amber' },
  { hex: '#f43f5e', name: 'Hot Rose' },
];

const DEFAULT_WORKOUTS: Workout[] = [
  { id: '1', weekNumber: 1, dateStr: '2026-07-28', displayDate: 'Jul 28', dayName: 'Tue', workoutType: 'VO2 Max Intervals ⚡', category: 'Speed', breakdown: '1.5 km Warmup + 5x2 mins @ 5k Pace (90s recovery jog) + 1.5 km Cooldown', numericKm: 5.0, totalKm: '5.0 km', stravaTitle: 'HM Plan (Week 1/8): VO2 Max Intervals - 1.5 km Warmup + 5x2 mins @ 5k Pace + 1.5 km Cooldown = 5.0 km Total', advice: 'Focus on sustained power and smooth turnover 🏃‍♂️.', nrc: 'One Hard One Easy' },
  { id: '2', weekNumber: 1, dateStr: '2026-07-30', displayDate: 'Jul 30', dayName: 'Thu', workoutType: 'Easy Progression 🌿', category: 'Tempo', breakdown: '4 km Easy (@ 6:15-6:30/km) + 2 km @ Race Pace (@ 5:40-5:50/km)', numericKm: 6.0, totalKm: '6.0 km', stravaTitle: 'HM Plan (Week 1/8): Easy Progression - 4 km Easy + 2 km @ Race Pace = 6.0 km Total', advice: 'Zone 2 start smooth race pace pick-up over final 2 km 🎯.' },
  { id: '3', weekNumber: 1, dateStr: '2026-07-31', displayDate: 'Jul 31', dayName: 'Fri', workoutType: 'Optional Shakeout 👟', category: 'Recovery', breakdown: '3 km Super Easy Zone 2 Jog + 6x20 secs Strides', numericKm: 3.5, totalKm: '3.5 km', stravaTitle: 'HM Plan (Week 1/8): Optional Shakeout - 3 km Super Easy Jog + 6x20s Strides = 3.5 km Total', advice: '100% optional shakeout! Skip if calves feel tight before Saturday effort 🛑.' },
  { id: '4', weekNumber: 1, dateStr: '2026-08-01', displayDate: 'Aug 1', dayName: 'Sat', workoutType: '5k PB Attempt! 🏆', category: 'Race Day', breakdown: '1 km Warmup + 5 km Race Effort + 1 km Cooldown', numericKm: 7.0, totalKm: '7.0 km', stravaTitle: 'HM Plan (Week 1/8): 5k PB Attempt - 1 km Warmup + 5 km Race Effort + 1 km Cooldown = 7.0 km Total', advice: 'Pacing: Hold 5:10/km for Km 1–2, 5:05/km for Km 3–4 and give everything in Km 5 🔥!' },
  { id: '5', weekNumber: 1, dateStr: '2026-08-02', displayDate: 'Aug 2', dayName: 'Sun', workoutType: 'Aerobic Long Run 🌳', category: 'Long Run', breakdown: '65 Mins (~10 km Steady @ 6:20–6:40/km off-road)', numericKm: 10.0, totalKm: '10.0 km', stravaTitle: 'HM Plan (Week 1/8): Aerobic Long Run - 65 Mins (~10 km Steady off-road)', advice: 'Focus on time on feet! Off-road pace runs naturally 10–15s slower 🌲.' },
  { id: '6', weekNumber: 2, dateStr: '2026-08-05', displayDate: 'Aug 5', dayName: 'Wed', workoutType: 'VO2 Max Intervals ⚡', category: 'Speed', breakdown: '1.5 km Warmup + 6x2 mins @ 5k Pace (90s recovery jog) + 1.5 km Cooldown', numericKm: 5.4, totalKm: '5.4 km', stravaTitle: 'HM Plan (Week 2/8): VO2 Max Intervals - 1.5 km Warmup + 6x2 mins @ 5k Pace + 1.5 km Cooldown = 5.4 km Total', advice: 'Build manageable lactate buildup while maintaining strong relaxed form 🏃‍♂️.', nrc: 'Five by Fives' },
  { id: '7', weekNumber: 2, dateStr: '2026-08-06', displayDate: 'Aug 6', dayName: 'Thu', workoutType: 'Easy Progression 🌿', category: 'Tempo', breakdown: '5 km Easy (@ 6:15-6:30/km) + 2 km @ Race Pace (@ 5:40-5:50/km)', numericKm: 7.0, totalKm: '7.0 km', stravaTitle: 'HM Plan (Week 2/8): Easy Progression - 5 km Easy + 2 km @ Race Pace = 7.0 km Total', advice: 'Relaxed Zone 2 aerobic base building with a race pace finish 🎯.' },
  { id: '8', weekNumber: 2, dateStr: '2026-08-07', displayDate: 'Aug 7', dayName: 'Fri', workoutType: 'Optional Shakeout 👟', category: 'Recovery', breakdown: '3.5 km Super Easy Zone 2 Jog + 6x20 secs Strides', numericKm: 4.0, totalKm: '4.0 km', stravaTitle: 'HM Plan (Week 2/8): Optional Shakeout - 3.5 km Super Easy Jog + 6x20s Strides = 4.0 km Total', advice: 'Optional recovery shakeout to keep legs fresh for Sunday long run 🌿.' },
  { id: '9', weekNumber: 2, dateStr: '2026-08-09', displayDate: 'Aug 9', dayName: 'Sun', workoutType: 'Aerobic Long Run 🌳', category: 'Long Run', breakdown: '85 Mins (~13 km Steady @ 6:20–6:40/km off-road)', numericKm: 13.0, totalKm: '13.0 km', stravaTitle: 'HM Plan (Week 2/8): Aerobic Long Run - 85 Mins (~13 km Steady off-road)', advice: 'Fueling: Take 300–500ml water + 1 energy gel at 45 mins 💧🍌.' },
  { id: '10', weekNumber: 3, dateStr: '2026-08-11', displayDate: 'Aug 11', dayName: 'Tue', workoutType: 'Ladder Intervals ⚡', category: 'Speed', breakdown: '1.5 km Warmup + (2m-4m-6m-4m-2m @ 5k/10k pace 2 min jog rest) + 1.5 km Cooldown', numericKm: 6.6, totalKm: '6.6 km', stravaTitle: 'HM Plan (Week 3/8): Ladder Intervals - 1.5 km Warmup + (2m-4m-6m-4m-2m) + 1.5 km Cooldown = 6.6 km Total', advice: 'Teaches your body to process and clear lactate under sustained fatigue ⚡.', nrc: 'The Ladder' },
  { id: '11', weekNumber: 3, dateStr: '2026-08-13', displayDate: 'Aug 13', dayName: 'Thu', workoutType: 'Easy Progression 🌿', category: 'Tempo', breakdown: '6 km Easy (@ 6:15-6:30/km) + 2 km @ Race Pace (@ 5:40-5:50/km)', numericKm: 8.0, totalKm: '8.0 km', stravaTitle: 'HM Plan (Week 3/8): Easy Progression - 6 km Easy + 2 km @ Race Pace = 8.0 km Total', advice: 'Smooth pace acceleration over the final 2 km 🎯.' },
  { id: '12', weekNumber: 3, dateStr: '2026-08-14', displayDate: 'Aug 14', dayName: 'Fri', workoutType: 'Optional Shakeout 👟', category: 'Recovery', breakdown: '4 km Super Easy Zone 2 Jog + 6x20 secs Strides', numericKm: 4.5, totalKm: '4.5 km', stravaTitle: 'HM Plan (Week 3/8): Optional Shakeout - 4 km Super Easy Jog + 6x20s Strides = 4.5 km Total', advice: 'Low effort shakeout with 6x20 secs Strides to prime the nervous system 🌿.' },
  { id: '13', weekNumber: 3, dateStr: '2026-08-16', displayDate: 'Aug 16', dayName: 'Sun', workoutType: 'Aerobic Long Run 🌳', category: 'Long Run', breakdown: '95 Mins (~15 km Steady @ 6:20–6:40/km off-road)', numericKm: 15.0, totalKm: '15.0 km', stravaTitle: 'HM Plan (Week 3/8): Aerobic Long Run - 95 Mins (~15 km Steady off-road)', advice: 'Fueling: Take 1 energy gel at 45 mins and 90 mins with water 💧🍌.' },
  { id: '14', weekNumber: 4, dateStr: '2026-08-18', displayDate: 'Aug 18', dayName: 'Tue', workoutType: 'Threshold Repeat Blocks ⚡', category: 'Speed', breakdown: '1.5 km Warmup + 3x6 mins @ 10k Pace (2 min recovery jog) + 1.5 km Cooldown', numericKm: 7.5, totalKm: '7.5 km', stravaTitle: 'HM Plan (Week 4/8): Threshold Repeat Blocks - 1.5 km Warmup + 3x6 mins @ 10k Pace + 1.5 km Cooldown = 7.5 km Total', advice: 'Extended interval blocks to dial in half-marathon pace endurance 🏃‍♂️.', nrc: 'Triple 3s' },
  { id: '15', weekNumber: 4, dateStr: '2026-08-20', displayDate: 'Aug 20', dayName: 'Thu', workoutType: 'Tempo / Pace Run 🌿', category: 'Tempo', breakdown: '2 km Easy + 4 km @ Race Pace (@ 5:40/km) + 2 km Cooldown', numericKm: 8.0, totalKm: '8.0 km', stravaTitle: 'HM Plan (Week 4/8): Tempo Run - 2 km Easy + 4 km @ Race Pace + 2 km Cooldown = 8.0 km Total', advice: 'Lock into exact race rhythm on flat ground 🎯.' },
  { id: '16', weekNumber: 4, dateStr: '2026-08-21', displayDate: 'Aug 21', dayName: 'Fri', workoutType: 'Optional Shakeout 👟', category: 'Recovery', breakdown: '4 km Super Easy Zone 2 Jog + 6x20 secs Strides', numericKm: 4.5, totalKm: '4.5 km', stravaTitle: 'HM Plan (Week 4/8): Optional Shakeout - 4 km Super Easy Jog + 6x20s Strides = 4.5 km Total', advice: '100% optional shakeout with 6x20 secs Strides to keep legs fresh 🌿.' },
  { id: '17', weekNumber: 4, dateStr: '2026-08-23', displayDate: 'Aug 23', dayName: 'Sun', workoutType: 'Step-Up Long Run 🌳', category: 'Long Run', breakdown: '110 Mins (~17 km Steady @ 6:20–6:40/km off-road)', numericKm: 17.0, totalKm: '17.0 km', stravaTitle: 'HM Plan (Week 4/8): Step-Up Long Run - 110 Mins (~17 km Steady off-road)', advice: 'Solid step-up time goal to prepare for next week 2-hour peak 🏁. Fueling: Gels at 45m and 90m 🍌💧.' },
  { id: '18', weekNumber: 5, dateStr: '2026-08-25', displayDate: 'Aug 25', dayName: 'Tue', workoutType: 'Sustained VO2 Intervals ⚡', category: 'Speed', breakdown: '1.5 km Warmup + 4x4 mins @ 10k Pace (2 min recovery jog) + 1.5 km Cooldown', numericKm: 6.2, totalKm: '6.2 km', stravaTitle: 'HM Plan (Week 5/8): Sustained VO2 Intervals - 1.5 km Warmup + 4x4 mins @ 10k Pace + 1.5 km Cooldown = 6.2 km Total', advice: 'High-yield intervals building top-tier aerobic power ⚡.', nrc: 'Eight by Eight' },
  { id: '19', weekNumber: 5, dateStr: '2026-08-27', displayDate: 'Aug 27', dayName: 'Thu', workoutType: 'Pace Progression Run 🌿', category: 'Tempo', breakdown: '5 km Easy + 3 km @ Race Pace (@ 5:40/km)', numericKm: 8.0, totalKm: '8.0 km', stravaTitle: 'HM Plan (Week 5/8): Pace Progression Run - 5 km Easy + 3 km @ Race Pace = 8.0 km Total', advice: 'Lock in target race pace for the final 3 km on tired legs 🎯.' },
  { id: '20', weekNumber: 5, dateStr: '2026-08-28', displayDate: 'Aug 28', dayName: 'Fri', workoutType: 'Optional Shakeout 👟', category: 'Recovery', breakdown: '3.5 km Super Easy Zone 2 Jog + 6x20 secs Strides', numericKm: 4.0, totalKm: '4.0 km', stravaTitle: 'HM Plan (Week 5/8): Optional Shakeout - 3.5 km Super Easy Jog + 6x20s Strides = 4.0 km Total', advice: 'Keep it super relaxed with 6 light strides 🌿.' },
  { id: '21', weekNumber: 5, dateStr: '2026-08-30', displayDate: 'Aug 30', dayName: 'Sun', workoutType: 'PEAK TIME RUN (120 MINS) 🌳', category: 'Long Run', breakdown: '120-Minute Time-Capped Trail Run (~18–20 km @ 6:20–6:40/km off-road)', numericKm: 19.0, totalKm: '18-20 km', stravaTitle: 'HM Plan (Week 5/8): PEAK TIME RUN (120 MINS) - 120-Min Trail Run (~18-20 km off-road)', advice: 'Major Milestone! Cap strictly at 2 hours! Fueling: Take gels at 45m and 90m with water 🍌💧.', isMilestone: true },
  { id: '22', weekNumber: 6, dateStr: '2026-09-01', displayDate: 'Sep 1', dayName: 'Tue', workoutType: 'Speed Sharpening ⚡', category: 'Speed', breakdown: '1.5 km Warmup + 5x2 mins @ 5k Pace (90s recovery jog) + 1.5 km Cooldown', numericKm: 5.0, totalKm: '5.0 km', stravaTitle: 'HM Plan (Week 6/8): Speed Sharpening - 1.5 km Warmup + 5x2 mins @ 5k Pace + 1.5 km Cooldown = 5.0 km Total', advice: 'Keep legs fast and springy without generating excessive fatigue ⚡.', nrc: 'Speed Run with Benchmark' },
  { id: '23', weekNumber: 6, dateStr: '2026-09-03', displayDate: 'Sep 3', dayName: 'Thu', workoutType: 'Easy Progression 🌿', category: 'Tempo', breakdown: '4 km Easy + 2 km @ Race Pace (@ 5:40/km)', numericKm: 6.0, totalKm: '6.0 km', stravaTitle: 'HM Plan (Week 6/8): Easy Progression - 4 km Easy + 2 km @ Race Pace = 6.0 km Total', advice: 'Smooth progression finish 🎯.' },
  { id: '24', weekNumber: 6, dateStr: '2026-09-04', displayDate: 'Sep 4', dayName: 'Fri', workoutType: 'Optional Shakeout 👟', category: 'Recovery', breakdown: '3 km Super Easy Zone 2 Jog + 6x20 secs Strides', numericKm: 3.5, totalKm: '3.5 km', stravaTitle: 'HM Plan (Week 6/8): Optional Shakeout - 3 km Super Easy Jog + 6x20s Strides = 3.5 km Total', advice: 'Light recovery shakeout option with strides to maintain leg turnover 🛑.' },
  { id: '25', weekNumber: 6, dateStr: '2026-09-06', displayDate: 'Sep 6', dayName: 'Sun', workoutType: 'Step-Down Long Run 🌳', category: 'Long Run', breakdown: '90 Mins (~14 km Long Run @ 6:20–6:40/km off-road)', numericKm: 14.0, totalKm: '14.0 km', stravaTitle: 'HM Plan (Week 6/8): Step-Down Long Run - 90 Mins (~14 km @ 6:20-6:40/km off-road)', advice: 'Taper Step-Down: Volume drops so your muscles rebuild glycogen 🔋.' },
  { id: '26', weekNumber: 7, dateStr: '2026-09-08', displayDate: 'Sep 8', dayName: 'Tue', workoutType: 'Taper Speed Sharpening ⚡', category: 'Speed', breakdown: '1.5 km Warmup + 4x2 mins @ 5k Pace (90s recovery jog) + 1.5 km Cooldown', numericKm: 4.6, totalKm: '4.6 km', stravaTitle: 'HM Plan (Week 7/8): Taper Speed Sharpening - 1.5 km Warmup + 4x2 mins @ 5k Pace + 1.5 km Cooldown = 4.6 km Total', advice: 'Sharp crisp turnover to maintain neurological sharpness ⚡.', nrc: 'Short & Sweet' },
  { id: '27', weekNumber: 7, dateStr: '2026-09-10', displayDate: 'Sep 10', dayName: 'Thu', workoutType: 'Easy Aerobic Run 🌿', category: 'Easy', breakdown: '6 km Easy Run (@ 6:15-6:30/km)', numericKm: 6.0, totalKm: '6.0 km', stravaTitle: 'HM Plan (Week 7/8): Easy Aerobic Run - 6 km Easy Run = 6.0 km Total', advice: 'Keep legs feeling light and relaxed 🌿.' },
  { id: '28', weekNumber: 7, dateStr: '2026-09-11', displayDate: 'Sep 11', dayName: 'Fri', workoutType: 'Optional Shakeout 👟', category: 'Recovery', breakdown: '3 km Super Easy Zone 2 Jog + 6x20 secs Strides', numericKm: 3.5, totalKm: '3.5 km', stravaTitle: 'HM Plan (Week 7/8): Optional Shakeout - 3 km Super Easy Jog + 6x20s Strides = 3.5 km Total', advice: 'Gentle stride session during taper 🛑.' },
  { id: '29', weekNumber: 7, dateStr: '2026-09-13', displayDate: 'Sep 13', dayName: 'Sun', workoutType: 'Taper Long Run 🌳', category: 'Long Run', breakdown: '65 Mins (~10 km Easy Long Run @ 6:20–6:40/km)', numericKm: 10.0, totalKm: '10.0 km', stravaTitle: 'HM Plan (Week 7/8): Taper Long Run - 65 Mins (~10 km Easy Long Run)', advice: 'Easy confidence-building taper run 🏁.' },
  { id: '30', weekNumber: 8, dateStr: '2026-09-15', displayDate: 'Sep 15', dayName: 'Tue', workoutType: 'Race Prep Sharpening ⚡', category: 'Speed', breakdown: '1.5 km Warmup + 3x2 mins @ Race Pace (90s recovery jog) + 1.0 km Cooldown', numericKm: 3.7, totalKm: '3.7 km', stravaTitle: 'HM Plan (Week 8/8): Race Prep Sharpening - 1.5 km Warmup + 3x2 mins @ Race Pace + 1.0 km Cooldown = 3.7 km Total', advice: 'Gently prime the nervous system for target race pace ⚡.', nrc: 'Race Day Prep' },
  { id: '31', weekNumber: 8, dateStr: '2026-09-17', displayDate: 'Sep 17', dayName: 'Thu', workoutType: 'Easy Shakeout Run 🌿', category: 'Easy', breakdown: '3.5 km Super Easy Jog', numericKm: 3.5, totalKm: '3.5 km', stravaTitle: 'HM Plan (Week 8/8): Easy Shakeout Run - 3.5 km Super Easy Jog = 3.5 km Total', advice: 'Very light leg turnover 🌿.' },
  { id: '32', weekNumber: 8, dateStr: '2026-09-19', displayDate: 'Sep 19', dayName: 'Sat', workoutType: 'Pre-Race Shakeout 👟', category: 'Recovery', breakdown: '2 km Super Easy Shakeout + 2x50m Strides', numericKm: 2.1, totalKm: '2.1 km', stravaTitle: 'HM Plan (Week 8/8): Pre-Race Shakeout - 2 km Super Easy Shakeout + 2x50m Strides = 2.1 km Total', advice: 'Prime legs for tomorrow 🔥.' },
  { id: '33', weekNumber: 8, dateStr: '2026-09-20', displayDate: 'Sep 20', dayName: 'Sun', workoutType: 'RACE DAY! 🏆', category: 'Race Day', breakdown: 'Saucony Run Shoreditch Half-Marathon (21.1 km)', numericKm: 21.1, totalKm: '21.1 km', stravaTitle: 'HM Plan (Week 8/8): RACE DAY! - Saucony Run Shoreditch Half-Marathon (21.1 km)', advice: 'Sub-2:00 Target! Lock into 5:40/km pace on road 🏁. Stay smooth and smash that finish! 🔥🚀', isMilestone: true },
];

const INITIAL_PLAN: TrainingPlan = {
  id: 'plan-1',
  name: 'Saucony Run Shoreditch Prep',
  targetPace: '5:40 /km',
  startDateStr: '2026-07-27',
  raceDateStr: '2026-09-20',
  raceDateDisplay: 'Sep 20, 2026',
  targetTime: '< 2:00:00',
  status: 'active',
  workouts: DEFAULT_WORKOUTS,
};

function generateICSContent(workouts: Workout[], planName: string): string {
  const sanitize = (text: string) => text.replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
  
  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MMR Running Hub//Training Plan Calendar//EN',
    'CALSCALE:GREGORIAN',
    `X-WR-CALNAME:${sanitize(planName)}`
  ];

  workouts.forEach((w) => {
    const startDate = new Date(w.dateStr);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);

    const formatCalDate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}${month}${day}`;
    };

    const startFormatted = formatCalDate(startDate);
    const endFormatted = formatCalDate(endDate);

    const uid = `run-${w.id}-${startFormatted}@mmrrunninghub.com`;
    const summary = `${w.workoutType} (${w.totalKm})`;
    const description = `Breakdown: ${w.breakdown}\\nCoach Advice: ${w.advice}${w.nrc ? `\\nNRC Guided Run: ${w.nrc}` : ''}`;

    ics.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART;VALUE=DATE:${startFormatted}`,
      `DTEND;VALUE=DATE:${endFormatted}`,
      `SUMMARY:${sanitize(summary)}`,
      `DESCRIPTION:${sanitize(description)}`,
      'STATUS:CONFIRMED',
      'TRANSP:TRANSPARENT',
      'END:VEVENT'
    );
  });

  ics.push('END:VCALENDAR');
  return ics.join('\r\n');
}

function openGoogleCalendar(workout: Workout, planName: string) {
  const startDate = new Date(workout.dateStr);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 1);

  const formatCalDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  };

  const startFormatted = formatCalDate(startDate);
  const endFormatted = formatCalDate(endDate);

  const title = encodeURIComponent(`${workout.workoutType} (${workout.totalKm})`);
  const details = encodeURIComponent(
    `Plan: ${planName}\nBreakdown: ${workout.breakdown}\nCoach Advice: ${workout.advice}${workout.nrc ? `\nNRC: ${workout.nrc}` : ''}`
  );
  
  const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startFormatted}/${endFormatted}&details=${details}&crm=AVAILABLE&sf=true`;
  window.open(googleCalUrl, '_blank');
}

function triggerICSDownload(icsContent: string, filename: string) {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.ics') ? filename : `${filename}.ics`);
  link.setAttribute('target', '_blank');
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}

function parsePastedAIPlan(rawText: string, startDateStr: string, planName: string): Workout[] {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const workouts: Workout[] = [];
  
  const startDate = new Date(startDateStr);
  let currentWeek = 1;
  const weekRegex = /week\s*(\d+)/i;
  const kmRegex = /(\d+(?:\.\d+)?)\s*(?:km|k|miles|m)\b/i;
  
  lines.forEach((line, index) => {
    const weekMatch = line.match(weekRegex);
    if (weekMatch) {
      currentWeek = parseInt(weekMatch[1], 10);
      return;
    }
    if (line.length < 5 || line.toLowerCase().startsWith('###') || line.toLowerCase().startsWith('title')) return;

    const kmMatch = line.match(kmRegex);
    const numericKm = kmMatch ? parseFloat(kmMatch[1]) : 5.0;

    const dayOffset = (currentWeek - 1) * 7 + (index % 7);
    const sessionDate = new Date(startDate);
    sessionDate.setDate(startDate.getDate() + dayOffset);

    const year = sessionDate.getFullYear();
    const monthStr = String(sessionDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(sessionDate.getDate()).padStart(2, '0');
    const dateFormatted = `${year}-${monthStr}-${dayStr}`;

    const dayName = sessionDate.toLocaleDateString('en-US', { weekday: 'short' });
    const displayDate = sessionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    let category: WorkoutType = 'Easy';
    const lower = line.toLowerCase();
    if (lower.includes('interval') || lower.includes('speed') || lower.includes('vo2')) category = 'Speed';
    else if (lower.includes('tempo') || lower.includes('progression')) category = 'Tempo';
    else if (lower.includes('long') || lower.includes('steady')) category = 'Long Run';
    else if (lower.includes('shakeout') || lower.includes('recovery') || lower.includes('rest')) category = 'Recovery';
    else if (lower.includes('race') || lower.includes('pb') || lower.includes('marathon')) category = 'Race Day';

    const cleanTitle = line.replace(/^[\s*\-#\d.]+/, '').trim();

    workouts.push({
      id: `parsed-${Date.now()}-${index}`,
      weekNumber: currentWeek,
      dateStr: dateFormatted,
      displayDate: displayDate,
      dayName: dayName,
      workoutType: cleanTitle.length > 30 ? `${cleanTitle.substring(0, 30)}...` : cleanTitle,
      category: category,
      breakdown: line,
      numericKm: numericKm,
      totalKm: `${numericKm} km`,
      stravaTitle: `${planName} (W${currentWeek}): ${cleanTitle}`,
      advice: 'Stay smooth, listen to your body, and control your pacing 🏃‍♂️.',
    });
  });

  return workouts.length > 0 ? workouts : DEFAULT_WORKOUTS;
}

export default function App() {
  const [plans, setPlans] = useState<TrainingPlan[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hm_training_plans');
      return saved ? JSON.parse(saved) : [INITIAL_PLAN];
    }
    return [INITIAL_PLAN];
  });

  const [activePlanId, setActivePlanId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const savedActive = localStorage.getItem('hm_active_plan_id');
      return savedActive || 'plan-1';
    }
    return 'plan-1';
  });

  const [themeColor, setThemeColor] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hm_theme_color');
      const isValid = THEME_COLORS.some((c) => c.hex === saved);
      return isValid && saved ? saved : THEME_COLORS[0].hex;
    }
    return THEME_COLORS[0].hex;
  });

  const [showThemePicker, setShowThemePicker] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'whole' | 'previous'>('upcoming');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [expandedWorkoutIds, setExpandedWorkoutIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPaceCalc, setShowPaceCalc] = useState(false);
  const [showArchiveManager, setShowArchiveManager] = useState(false);
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const [newPlanName, setNewPlanName] = useState('');
  const [newStartDate, setNewStartDate] = useState('2026-07-27');
  const [newRaceDate, setNewRaceDate] = useState('2026-09-20');
  const [newTargetPace, setNewTargetPace] = useState('5:40 /km');
  const [newTargetTime, setNewTargetTime] = useState('< 2:00:00');
  const [pastedPlanText, setPastedPlanText] = useState('');

  // Stored as strings to permit backspace clearing without forcing a leading '0'
  const [paceMinStr, setPaceMinStr] = useState('5');
  const [paceSecStr, setPaceSecStr] = useState('40');

  const todayStr = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  useEffect(() => {
    setPlans((prev) =>
      prev.map((p) => {
        if (p.raceDateStr < todayStr && p.status === 'active') {
          return { ...p, status: 'archived' };
        }
        return p;
      })
    );
  }, [todayStr]);

  useEffect(() => {
    localStorage.setItem('hm_training_plans', JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    localStorage.setItem('hm_active_plan_id', activePlanId);
  }, [activePlanId]);

  useEffect(() => {
    localStorage.setItem('hm_theme_color', themeColor);
  }, [themeColor]);

  const activePlan = useMemo(() => {
    return plans.find((p) => p.id === activePlanId) || plans[0] || INITIAL_PLAN;
  }, [plans, activePlanId]);

  const daysUntilRace = useMemo(() => {
    const now = new Date(todayStr);
    const race = new Date(activePlan.raceDateStr);
    const diffTime = race.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, [todayStr, activePlan]);

  const filterWorkouts = (workouts: Workout[]) => {
    if (selectedCategoryFilter === 'All') return workouts;
    return workouts.filter((w) => w.category === selectedCategoryFilter);
  };

  const upcomingWorkouts = useMemo(() => {
    return filterWorkouts(activePlan.workouts.filter((w) => w.dateStr >= todayStr));
  }, [activePlan, todayStr, selectedCategoryFilter]);

  const previousWorkouts = useMemo(() => {
    return filterWorkouts(activePlan.workouts.filter((w) => w.dateStr < todayStr).slice().reverse());
  }, [activePlan, todayStr, selectedCategoryFilter]);

  const wholeWorkouts = useMemo(() => {
    return filterWorkouts(activePlan.workouts);
  }, [activePlan, selectedCategoryFilter]);

  const currentWeekNum = useMemo(() => {
    const nextWorkout = activePlan.workouts.find((w) => w.dateStr >= todayStr);
    return nextWorkout ? nextWorkout.weekNumber : 8;
  }, [activePlan, todayStr]);

  const currentWeekWorkouts = useMemo(() => {
    return activePlan.workouts.filter((w) => w.weekNumber === currentWeekNum);
  }, [activePlan, currentWeekNum]);

  const currentWeekKm = useMemo(() => {
    return currentWeekWorkouts
      .reduce((sum, w) => sum + (w.numericKm || 0), 0)
      .toFixed(1);
  }, [currentWeekWorkouts]);

  const totalPlanCompletedKm = useMemo(() => {
    return activePlan.workouts
      .filter((w) => w.dateStr < todayStr)
      .reduce((sum, w) => sum + (w.numericKm || 0), 0)
      .toFixed(1);
  }, [activePlan, todayStr]);

  const totalPlanKm = useMemo(() => {
    return activePlan.workouts
      .reduce((sum, w) => sum + (w.numericKm || 0), 0)
      .toFixed(1);
  }, [activePlan]);

  const workoutsByWeek = useMemo(() => {
    const weeksMap: Record<number, Workout[]> = {};
    wholeWorkouts.forEach((w) => {
      if (!weeksMap[w.weekNumber]) {
        weeksMap[w.weekNumber] = [];
      }
      weeksMap[w.weekNumber].push(w);
    });
    return weeksMap;
  }, [wholeWorkouts]);

  const upcomingByWeek = useMemo(() => {
    const weeksMap: Record<number, Workout[]> = {};
    upcomingWorkouts.forEach((w) => {
      if (!weeksMap[w.weekNumber]) {
        weeksMap[w.weekNumber] = [];
      }
      weeksMap[w.weekNumber].push(w);
    });
    return weeksMap;
  }, [upcomingWorkouts]);

  const previousByWeek = useMemo(() => {
    const weeksMap: Record<number, Workout[]> = {};
    previousWorkouts.forEach((w) => {
      if (!weeksMap[w.weekNumber]) {
        weeksMap[w.weekNumber] = [];
      }
      weeksMap[w.weekNumber].push(w);
    });
    return weeksMap;
  }, [previousWorkouts]);

  // Stepper Handlers for Minutes & Seconds
  const adjustMin = (delta: number) => {
    const current = parseInt(paceMinStr, 10) || 0;
    const val = Math.max(1, Math.min(20, current + delta));
    setPaceMinStr(String(val));
  };

  const adjustSec = (delta: number) => {
    const current = parseInt(paceSecStr, 10) || 0;
    let newSec = current + delta;
    if (newSec > 59) {
      newSec = 0;
      adjustMin(1);
    } else if (newSec < 0) {
      newSec = 59;
      adjustMin(-1);
    }
    setPaceSecStr(String(newSec));
  };

  const paceCalculations = useMemo(() => {
    const pMin = parseInt(paceMinStr, 10) || 0;
    const pSec = parseInt(paceSecStr, 10) || 0;
    const totalPaceSec = pMin * 60 + pSec;
    const formatTime = (seconds: number) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      const mStr = String(m).padStart(2, '0');
      const sStr = String(s).padStart(2, '0');
      return h > 0 ? `${h}:${mStr}:${sStr}` : `${m}:${sStr}`;
    };
    return {
      fiveK: formatTime(totalPaceSec * 5),
      tenK: formatTime(totalPaceSec * 10),
      sixteenK: formatTime(totalPaceSec * 16),
      halfMarathon: formatTime(totalPaceSec * 21.0975),
    };
  }, [paceMinStr, paceSecStr]);

  const toggleExpand = (id: string) => {
    setExpandedWorkoutIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCopyStrava = (e: React.MouseEvent, id: string, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleArchiveCurrentPlan = () => {
    setPlans((prev) =>
      prev.map((p) => (p.id === activePlan.id ? { ...p, status: 'archived' } : p))
    );
  };

  const handleDeletePlan = (e: React.MouseEvent, planIdToDelete: string) => {
    e.stopPropagation();
    if (plans.length <= 1) {
      alert('You must keep at least one active plan.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this plan?')) {
      const updated = plans.filter((p) => p.id !== planIdToDelete);
      setPlans(updated);
      if (activePlanId === planIdToDelete) {
        setActivePlanId(updated[0].id);
      }
    }
  };

  const handleCreateNewPlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanName.trim()) return;

    const newId = `plan-${Date.now()}`;
    const formattedDateDisplay = new Date(newRaceDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const parsedWorkouts = pastedPlanText.trim()
      ? parsePastedAIPlan(pastedPlanText, newStartDate, newPlanName)
      : DEFAULT_WORKOUTS.map((w, idx) => ({ ...w, id: `custom-${newId}-${idx}` }));

    const isHistorical = newRaceDate < todayStr;

    const newPlan: TrainingPlan = {
      id: newId,
      name: newPlanName,
      targetPace: newTargetPace,
      startDateStr: newStartDate,
      raceDateStr: newRaceDate,
      raceDateDisplay: formattedDateDisplay,
      targetTime: newTargetTime,
      status: isHistorical ? 'archived' : 'active',
      workouts: parsedWorkouts,
    };

    setPlans((prev) => [...prev, newPlan]);
    setActivePlanId(newId);
    setShowNewPlanModal(false);
    setShowArchiveManager(false);
    setNewPlanName('');
    setPastedPlanText('');
  };

  const handleExportSingleRun = (e: React.MouseEvent, workout: Workout) => {
    e.stopPropagation();
    openGoogleCalendar(workout, activePlan.name);
  };

  const handleExportWeek = () => {
    const content = generateICSContent(currentWeekWorkouts, `${activePlan.name} - Week ${currentWeekNum}`);
    triggerICSDownload(content, `${activePlan.name}_Week_${currentWeekNum}.ics`);
    setShowExportMenu(false);
  };

  const handleExportUpcoming = () => {
    const content = generateICSContent(upcomingWorkouts, `${activePlan.name} - Upcoming Runs`);
    triggerICSDownload(content, `${activePlan.name}_Upcoming_Runs.ics`);
    setShowExportMenu(false);
  };

  const handleExportEntirePlan = () => {
    const content = generateICSContent(activePlan.workouts, activePlan.name);
    triggerICSDownload(content, `${activePlan.name}_Full_Plan.ics`);
    setShowExportMenu(false);
  };

  const renderWorkoutCard = (workout: Workout) => {
    const isExpanded = !!expandedWorkoutIds[workout.id];
    const isToday = workout.dateStr === todayStr;
    const badgeStyle = getWorkoutBadgeColor(workout.category);

    return (
      <div
        key={workout.id}
        onClick={() => toggleExpand(workout.id)}
        className={`p-4 sm:p-5 rounded-2xl border bg-slate-900/60 transition-all cursor-pointer ${
          isToday ? 'ring-2 ring-offset-2 ring-offset-slate-950 border-transparent' : 'border-slate-800 hover:border-slate-700'
        }`}
        style={isToday ? { '--tw-ring-color': themeColor } as React.CSSProperties : undefined}
      >
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              {isToday && (
                <span 
                  className="inline-block text-[10px] font-black uppercase text-white px-2 py-0.5 rounded-full shadow-sm"
                  style={{ backgroundColor: themeColor }}
                >
                  Today
                </span>
              )}
              {/* CATEGORY BADGE WITH HIGH-CONTRAST BADGE HELPER */}
              <span className={`inline-block text-[11px] px-2.5 py-0.5 rounded-full border ${badgeStyle}`}>
                {workout.category}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {workout.dayName}, {workout.displayDate} • Week {workout.weekNumber}
              </span>
            </div>
            <div className="font-extrabold text-white text-base sm:text-lg truncate">{workout.workoutType}</div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <span className="font-black text-sm sm:text-base mr-1" style={{ color: themeColor }}>{workout.totalKm}</span>
            <button
              onClick={(e) => handleExportSingleRun(e, workout)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
              title="Add run to Google Calendar"
            >
              <CalendarPlus className="w-4 h-4" style={{ color: themeColor }} />
            </button>
            <button
              onClick={(e) => handleCopyStrava(e, workout.id, workout.stravaTitle)}
              className="p-2 rounded-xl border transition-colors"
              style={{ 
                backgroundColor: `${themeColor}1a`, 
                borderColor: `${themeColor}4d`,
                color: themeColor 
              }}
              title="Copy Strava Title"
            >
              {copiedId === workout.id ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            <button className="text-slate-500 hover:text-slate-300 p-1">
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="mt-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs sm:text-sm text-slate-300">
          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Breakdown</span>
          {workout.breakdown}
        </div>

        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2 animate-in fade-in duration-150">
            <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/50 space-y-2">
              <p className="text-xs text-slate-300 italic">
                <strong className="not-italic" style={{ color: themeColor }}>Coach Advice: </strong>
                {workout.advice}
              </p>
              {workout.nrc && (
                <div className="inline-block bg-emerald-500/10 text-emerald-400 text-[11px] px-2 py-0.5 rounded border border-emerald-500/20 font-semibold">
                  Suggested NRC: {workout.nrc}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const categories: (WorkoutType | 'All')[] = ['All', 'Speed', 'Tempo', 'Long Run', 'Easy', 'Recovery', 'Race Day'];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 p-6 shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Trophy className="w-48 h-48" style={{ color: themeColor }} />
          </div>
          <div className="relative z-10 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {/* MMR RUNNING HUB BADGE: FADED THEME TINT BG + SLATE-300 TEXT */}
                <div 
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border text-slate-300"
                  style={{ 
                    backgroundColor: `${themeColor}26`, 
                    borderColor: `${themeColor}4d`,
                  }}
                >
                  <Flame className="w-3.5 h-3.5" style={{ color: themeColor }} />
                  <span>MMR Running Hub</span>
                </div>

                {/* Horizontal Theme Color Selector Next To Badge */}
                <div className="relative flex items-center">
                  <button
                    onClick={() => setShowThemePicker(!showThemePicker)}
                    className="w-5 h-5 rounded-full border-2 border-slate-700 hover:scale-110 transition-transform focus:outline-none shadow-md shrink-0"
                    style={{ backgroundColor: themeColor }}
                    title="Change theme color"
                  />
                  {showThemePicker && (
                    <div className="absolute left-7 top-1/2 -translate-y-1/2 flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-full shadow-2xl z-50 animate-in fade-in slide-in-from-left-2 duration-150">
                      {THEME_COLORS.map((theme) => (
                        <button
                          key={theme.hex}
                          onClick={() => {
                            setThemeColor(theme.hex);
                            setShowThemePicker(false);
                          }}
                          className={`w-5 h-5 rounded-full transition-transform hover:scale-110 shrink-0 ${
                            themeColor === theme.hex ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-900 scale-105' : ''
                          }`}
                          style={{ backgroundColor: theme.hex }}
                          title={theme.name}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {activePlan.status === 'archived' && (
                  <span className="bg-slate-800 text-slate-400 text-xs px-2.5 py-0.5 rounded-full border border-slate-700">
                    Archived Block
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-1.5 w-full sm:w-auto">
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="w-full justify-center inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors whitespace-nowrap"
                  >
                    <Download className="w-3 h-3 shrink-0" style={{ color: themeColor }} />
                    <span className="whitespace-nowrap">Export Cal</span>
                    <ChevronDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                  </button>

                  {showExportMenu && (
                    <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1 z-50">
                      <button
                        onClick={handleExportEntirePlan}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-between"
                      >
                        <span>Export Whole Plan</span>
                        <Calendar className="w-3.5 h-3.5 shrink-0 ml-1" style={{ color: themeColor }} />
                      </button>
                      <button
                        onClick={handleExportWeek}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-between"
                      >
                        <span>Export Current Week</span>
                        <BarChart3 className="w-3.5 h-3.5 shrink-0 ml-1" style={{ color: themeColor }} />
                      </button>
                      <button
                        onClick={handleExportUpcoming}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-between"
                      >
                        <span>Export Upcoming Runs</span>
                        <PlayCircle className="w-3.5 h-3.5 shrink-0 ml-1" style={{ color: themeColor }} />
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowArchiveManager(!showArchiveManager)}
                  className="w-full justify-center inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors whitespace-nowrap"
                >
                  <FolderArchive className="w-3 h-3 shrink-0" style={{ color: themeColor }} />
                  <span className="whitespace-nowrap">Plans</span>
                </button>

                <button
                  onClick={() => setShowPaceCalc(!showPaceCalc)}
                  className="w-full justify-center inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors whitespace-nowrap"
                >
                  <Calculator className="w-3 h-3 shrink-0" style={{ color: themeColor }} />
                  <span className="whitespace-nowrap">Pace</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {activePlan.name}
              </h1>
              {daysUntilRace > 0 && (
                /* COUNTDOWN BADGE: FADED THEME TINT BG + SLATE-300 TEXT */
                <div 
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-300 border px-3 py-1 rounded-full"
                  style={{ 
                    backgroundColor: `${themeColor}26`, 
                    borderColor: `${themeColor}4d`,
                  }}
                >
                  <Clock className="w-3.5 h-3.5" style={{ color: themeColor }} />
                  <span>{daysUntilRace} Days To Race Day</span>
                </div>
              )}
            </div>

            {/* TOTAL DISTANCE / VOLUME SECTION WITH SLATE-300 LABEL TEXT */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-xs text-slate-300">
                <span className="flex items-center gap-1 text-slate-300">
                  <BarChart3 className="w-3.5 h-3.5" style={{ color: themeColor }} />
                  Week {currentWeekNum} Volume: <strong style={{ color: themeColor }}>{currentWeekKm} km</strong>
                </span>
                <span>{totalPlanCompletedKm} / {totalPlanKm} km Total</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(100, (Number(totalPlanCompletedKm) / Number(totalPlanKm)) * 100)}%`,
                    backgroundColor: themeColor
                  }}
                />
              </div>
            </div>
          </div>
        </header>

        {showArchiveManager && (
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Archive className="w-4 h-4" style={{ color: themeColor }} />
                Training Block Manager
              </h3>
              <button
                onClick={() => setShowNewPlanModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-bold transition-colors"
                style={{ backgroundColor: themeColor }}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Plan</span>
              </button>
            </div>
            <div className="space-y-2">
              {plans.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setActivePlanId(p.id)}
                  className={`p-3 rounded-xl border flex justify-between items-center cursor-pointer transition-all ${
                    p.id === activePlan.id
                      ? 'text-white'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                  style={p.id === activePlan.id ? {
                    borderColor: `${themeColor}cc`,
                    backgroundColor: `${themeColor}1a`
                  } : undefined}
                >
                  <div>
                    <div className="font-bold text-sm">{p.name}</div>
                    <div className="text-xs text-slate-500">{p.raceDateDisplay} • Target: {p.targetTime}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.status === 'archived' ? (
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-semibold">History / Completed</span>
                    ) : (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">Active</span>
                    )}
                    <button
                      onClick={(e) => handleDeletePlan(e, p.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-1"
                      title="Delete Plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {activePlan.status === 'active' && (
              <button onClick={handleArchiveCurrentPlan} className="text-xs text-slate-400 flex items-center gap-1 pt-1 underline hover:brightness-125" style={{ color: themeColor }}>
                <Archive className="w-3 h-3" /> Archive current active plan
              </button>
            )}
          </div>
        )}

        {showNewPlanModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <PlusCircle className="w-4 h-4" style={{ color: themeColor }} />
                  Add Training Plan
                </h3>
                <button onClick={() => setShowNewPlanModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateNewPlanSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Plan Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Spring 10k Prep, London HM 2027"
                    value={newPlanName}
                    onChange={(e) => setNewPlanName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Plan Start Date</label>
                    <input
                      type="date"
                      required
                      value={newStartDate}
                      onChange={(e) => setNewStartDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Race Date</label>
                    <input
                      type="date"
                      required
                      value={newRaceDate}
                      onChange={(e) => setNewRaceDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Target Pace</label>
                    <input
                      type="text"
                      placeholder="e.g. 5:30 /km"
                      value={newTargetPace}
                      onChange={(e) => setNewTargetPace(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Target Time</label>
                    <input
                      type="text"
                      placeholder="e.g. Sub-2:00"
                      value={newTargetTime}
                      onChange={(e) => setNewTargetTime(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" style={{ color: themeColor }} />
                      Paste Gemini / ChatGPT / Custom AI Plan Text
                    </label>
                    <span className="text-[10px] text-slate-500">Optional</span>
                  </div>
                  <textarea
                    rows={4}
                    placeholder="Paste raw workout output from Gemini, Claude, or ChatGPT here (bullet points, markdown tables, or text lines)..."
                    value={pastedPlanText}
                    onChange={(e) => setPastedPlanText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Leave blank to load default 8-week Half-Marathon template.
                  </p>
                </div>
                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNewPlanModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 text-xs font-bold hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl text-white text-xs font-bold shadow-lg transition-brightness hover:brightness-110"
                    style={{ backgroundColor: themeColor }}
                  >
                    Save & Activate
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* PACE CALCULATOR COMPONENT */}
        {showPaceCalc && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            
            {/* ROW 1: HEADER TITLE */}
            <div className="border-b border-slate-800/80 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calculator className="w-4 h-4" style={{ color: themeColor }} /> Pace Calculator
              </h3>
            </div>

            {/* ROW 2: CENTERED PACE INPUTS */}
            <div className="flex justify-center my-1">
              <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
                
                {/* Minute Input + Arrow Buttons */}
                <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                  <input 
                    type="text" 
                    value={paceMinStr} 
                    onChange={(e) => setPaceMinStr(e.target.value.replace(/[^0-9]/g, ''))} 
                    className="w-10 bg-transparent text-center font-bold py-1 text-sm focus:outline-none" 
                    style={{ color: themeColor }}
                  />
                  <div className="flex flex-col border-l border-slate-700/80">
                    <button 
                      type="button" 
                      onClick={() => adjustMin(1)} 
                      className="px-1 hover:bg-slate-700/80 text-slate-400 hover:text-white text-[9px] transition-colors"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => adjustMin(-1)} 
                      className="px-1 hover:bg-slate-700/80 text-slate-400 hover:text-white text-[9px] transition-colors border-t border-slate-700/60"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <span className="text-xs text-slate-400 font-bold">:</span>

                {/* Second Input + Arrow Buttons */}
                <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                  <input 
                    type="text" 
                    value={paceSecStr} 
                    onChange={(e) => setPaceSecStr(e.target.value.replace(/[^0-9]/g, ''))} 
                    className="w-10 bg-transparent text-center font-bold py-1 text-sm focus:outline-none" 
                    style={{ color: themeColor }}
                  />
                  <div className="flex flex-col border-l border-slate-700/80">
                    <button 
                      type="button" 
                      onClick={() => adjustSec(1)} 
                      className="px-1 hover:bg-slate-700/80 text-slate-400 hover:text-white text-[9px] transition-colors"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => adjustSec(-1)} 
                      className="px-1 hover:bg-slate-700/80 text-slate-400 hover:text-white text-[9px] transition-colors border-t border-slate-700/60"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <span className="text-xs text-slate-400 font-medium ml-0.5">/km</span>
              </div>
            </div>

            {/* ROW 3: RESTORED 2x2 STACKED CARDS GRID */}
            <div className="grid grid-cols-2 gap-2 text-center pt-1">
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                <div className="text-[10px] uppercase font-bold text-slate-500">5k</div>
                <div className="text-base font-black text-white mt-0.5">{paceCalculations.fiveK}</div>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                <div className="text-[10px] uppercase font-bold text-slate-500">10k</div>
                <div className="text-base font-black text-white mt-0.5">{paceCalculations.tenK}</div>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                <div className="text-[10px] uppercase font-bold text-slate-500">16k</div>
                <div className="text-base font-black text-white mt-0.5">{paceCalculations.sixteenK}</div>
              </div>

              <div 
                className="bg-slate-950/80 p-3 rounded-xl border"
                style={{ 
                  borderColor: `${themeColor}4d`,
                  backgroundColor: `${themeColor}0d` 
                }}
              >
                <div className="text-[10px] uppercase font-bold" style={{ color: themeColor }}>21.1k</div>
                <div className="text-base font-black mt-0.5" style={{ color: themeColor }}>{paceCalculations.halfMarathon}</div>
              </div>
            </div>

          </div>
        )}

        <div className="flex bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 gap-1 backdrop-blur-md">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'upcoming'
                ? 'text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
            style={activeTab === 'upcoming' ? { backgroundColor: themeColor } : undefined}
          >
            <PlayCircle className="w-4 h-4" />
            <span>Upcoming Runs</span>
          </button>
          <button
            onClick={() => setActiveTab('whole')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'whole'
                ? 'text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
            style={activeTab === 'whole' ? { backgroundColor: themeColor } : undefined}
          >
            <Calendar className="w-4 h-4" />
            <span>Whole Plan</span>
          </button>
          <button
            onClick={() => setActiveTab('previous')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'previous'
                ? 'text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
            style={activeTab === 'previous' ? { backgroundColor: themeColor } : undefined}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Previous Runs</span>
          </button>
        </div>

        {/* CATEGORY FILTER PILLS */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {categories.map((cat) => {
            const isSelected = selectedCategoryFilter === cat;
            const badgeClass = cat === 'All' 
              ? (isSelected ? 'bg-slate-700 text-white border-slate-600' : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700')
              : getWorkoutBadgeColor(cat);

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`text-xs px-3 py-1 rounded-full border transition-all ${badgeClass} ${
                  isSelected ? 'ring-1 ring-white/30 scale-105' : 'opacity-70 hover:opacity-100'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {activeTab === 'upcoming' && (
          <div className="space-y-6">
            {Object.keys(upcomingByWeek).length > 0 ? (
              Object.keys(upcomingByWeek)
                .map(Number)
                .sort((a, b) => a - b)
                .map((weekNum) => {
                  const weekWorkouts = upcomingByWeek[weekNum];
                  const weekKmTotal = weekWorkouts
                    .reduce((sum, w) => sum + (w.numericKm || 0), 0)
                    .toFixed(1);
                  return (
                    <div key={weekNum} className="space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2 pt-1 px-1">
                        <div className="flex items-center gap-2">
                          {/* WEEK NUMBER BADGE: FADED THEME TINT BG + SLATE-300 TEXT */}
                          <span 
                            className="text-xs font-black capitalize tracking-wider text-slate-300 px-2.5 py-1 rounded-md border"
                            style={{ 
                              backgroundColor: `${themeColor}26`, 
                              borderColor: `${themeColor}4d`,
                            }}
                          >
                            Week {weekNum}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-slate-400">
                          Total Volume: <strong style={{ color: themeColor }}>{weekKmTotal} km</strong>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {weekWorkouts.map((workout) => renderWorkoutCard(workout))}
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="p-8 text-center text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
                No runs found matching this filter. 🏃‍♂️
              </div>
            )}
          </div>
        )}

        {activeTab === 'whole' && (
          <div className="space-y-6">
            {Object.keys(workoutsByWeek).length > 0 ? (
              Object.keys(workoutsByWeek)
                .map(Number)
                .sort((a, b) => a - b)
                .map((weekNum) => {
                  const weekWorkouts = workoutsByWeek[weekNum];
                  const weekKmTotal = weekWorkouts
                    .reduce((sum, w) => sum + (w.numericKm || 0), 0)
                    .toFixed(1);
                  return (
                    <div key={weekNum} className="space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2 pt-1 px-1">
                        <div className="flex items-center gap-2">
                          {/* WEEK NUMBER BADGE: FADED THEME TINT BG + SLATE-300 TEXT */}
                          <span 
                            className="text-xs font-black capitalize tracking-wider text-slate-300 px-2.5 py-1 rounded-md border"
                            style={{ 
                              backgroundColor: `${themeColor}26`, 
                              borderColor: `${themeColor}4d`,
                            }}
                          >
                            Week {weekNum}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-slate-400">
                          Total Volume: <strong style={{ color: themeColor }}>{weekKmTotal} km</strong>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {weekWorkouts.map((workout) => renderWorkoutCard(workout))}
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="p-8 text-center text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
                No runs found matching this filter. 🏃‍♂️
              </div>
            )}
          </div>
        )}

        {activeTab === 'previous' && (
          <div className="space-y-6">
            {previousWorkouts && previousWorkouts.length > 0 ? (
              Object.keys(previousByWeek)
                .map(Number)
                .sort((a, b) => b - a)
                .map((weekNum) => {
                  const weekWorkouts = previousByWeek[weekNum] || [];
                  const weekKmTotal = weekWorkouts
                    .reduce((sum, w) => sum + (w.numericKm || 0), 0)
                    .toFixed(1);
                  return (
                    <div key={weekNum} className="space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2 pt-1 px-1">
                        <div className="flex items-center gap-2">
                          {/* WEEK NUMBER BADGE: FADED THEME TINT BG + SLATE-300 TEXT */}
                          <span 
                            className="text-xs font-black capitalize tracking-wider text-slate-300 px-2.5 py-1 rounded-md border"
                            style={{ 
                              backgroundColor: `${themeColor}26`, 
                              borderColor: `${themeColor}4d`,
                            }}
                          >
                            Week {weekNum}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-slate-400">
                          Total Volume: <strong style={{ color: themeColor }}>{weekKmTotal} km</strong>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {weekWorkouts.map((workout) => renderWorkoutCard(workout))}
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="p-8 text-center text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
                No completed runs yet in this block. Your journey begins soon!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
