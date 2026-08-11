import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, CheckCircle2, Flame, Trophy, PlayCircle, 
  ChevronDown, ChevronUp, Copy, Check, Calculator, 
  BarChart3, Archive, PlusCircle, FolderArchive, Clock, 
  Trash2, X, Download, CalendarPlus, Sparkles
} from 'lucide-react';

interface Workout {
  id: string;
  dateStr: string;        // YYYY-MM-DD
  displayDate: string;    // e.g. "Aug 1"
  dayName: string;        // e.g. "Sat"
  workoutType: string;
  category: 'intervals' | 'progression' | 'shakeout' | 'longrun' | 'raceday';
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

const DEFAULT_WORKOUTS: Workout[] = [
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
    const dateFormatted = w.dateStr.replace(/-/g, '');
    const uid = `run-${w.id}-${dateFormatted}@mmrrunninghub.com`;
    const summary = `${w.workoutType} (${w.totalKm})`;
    const description = `Breakdown: ${w.breakdown}\\nCoach Advice: ${w.advice}${w.nrc ? `\\nNRC Guided Run: ${w.nrc}` : ''}`;

    ics.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART;VALUE=DATE:${dateFormatted}`,
      `DTEND;VALUE=DATE:${dateFormatted}`,
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

function triggerICSDownload(icsContent: string, filename: string) {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.ics') ? filename : `${filename}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
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

    let category: Workout['category'] = 'progression';
    const lower = line.toLowerCase();
    if (lower.includes('interval') || lower.includes('speed') || lower.includes('tempo') || lower.includes('vo2')) category = 'intervals';
    else if (lower.includes('long') || lower.includes('steady')) category = 'longrun';
    else if (lower.includes('shakeout') || lower.includes('easy') || lower.includes('rest')) category = 'shakeout';
    else if (lower.includes('race') || lower.includes('pb') || lower.includes('marathon')) category = 'raceday';

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

export default function Index() {
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

  const [activeTab, setActiveTab] = useState<'upcoming' | 'whole' | 'previous'>('upcoming');
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

  const [paceMin, setPaceMin] = useState(5);
  const [paceSec, setPaceSec] = useState(40);

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

  const upcomingWorkouts = useMemo(() => {
    return activePlan.workouts.filter((w) => w.dateStr >= todayStr);
  }, [activePlan, todayStr]);

  const previousWorkouts = useMemo(() => {
    return activePlan.workouts.filter((w) => w.dateStr < todayStr).reverse();
  }, [activePlan, todayStr]);

  const currentWeekNum = useMemo(() => {
    const nextWorkout = activePlan.workouts.find((w) => w.dateStr >= todayStr);
    return nextWorkout ? nextWorkout.weekNumber : 8;
  }, [activePlan, todayStr]);

  const currentWeekWorkouts = useMemo(() => {
    return activePlan.workouts.filter((w) => w.weekNumber === currentWeekNum);
  }, [activePlan, currentWeekNum]);

  const currentWeekKm = useMemo(() => {
    return currentWeekWorkouts
      .reduce((sum, w) => sum + w.numericKm, 0)
      .toFixed(1);
  }, [currentWeekWorkouts]);

  const totalPlanCompletedKm = useMemo(() => {
    return activePlan.workouts
      .filter((w) => w.dateStr < todayStr)
      .reduce((sum, w) => sum + w.numericKm, 0)
      .toFixed(1);
  }, [activePlan, todayStr]);

  const totalPlanKm = useMemo(() => {
    return activePlan.workouts
      .reduce((sum, w) => sum + w.numericKm, 0)
      .toFixed(1);
  }, [activePlan]);

  const workoutsByWeek = useMemo(() => {
    const weeksMap: Record<number, Workout[]> = {};
    activePlan.workouts.forEach((w) => {
      if (!weeksMap[w.weekNumber]) {
        weeksMap[w.weekNumber] = [];
      }
      weeksMap[w.weekNumber].push(w);
    });
    return weeksMap;
  }, [activePlan]);

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

  const paceCalculations = useMemo(() => {
    const totalPaceSec = paceMin * 60 + paceSec;
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
      halfMarathon: formatTime(totalPaceSec * 21.0975),
    };
  }, [paceMin, paceSec]);

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
    const content = generateICSContent([workout], activePlan.name);
    triggerICSDownload(content, `${workout.workoutType.replace(/[^a-z0-9]/gi, '_')}.ics`);
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

  const getCategoryStyles = (category: Workout['category']) => {
    switch (category) {
      case 'intervals': 
        return 'border-purple-500/80 bg-purple-950/20 text-purple-400';
      case 'progression': 
        return 'border-emerald-500/80 bg-emerald-950/20 text-emerald-400';
      case 'shakeout': 
        return 'border-blue-500/80 bg-blue-950/20 text-blue-400';
      case 'longrun': 
        return 'border-orange-500/80 bg-orange-950/20 text-orange-400';
      case 'raceday': 
        return 'border-rose-500/80 bg-rose-950/20 text-rose-400';
      default: 
        return 'border-slate-800 bg-slate-900 text-slate-200';
    }
  };

  const renderWorkoutCard = (workout: Workout) => {
    const isExpanded = !!expandedWorkoutIds[workout.id];
    const isToday = workout.dateStr === todayStr;

    return (
      <div
        key={workout.id}
        onClick={() => toggleExpand(workout.id)}
        className={`p-4 sm:p-5 rounded-2xl border-2 ${getCategoryStyles(workout.category)} transition-all cursor-pointer ${
          isToday ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-slate-950' : 'hover:brightness-110'
        }`}
      >
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0 flex-1">
            
            {/* TODAY BADGE POSITIONED DIRECTLY ABOVE DATE */}
            {isToday && (
              <div className="mb-1">
                <span className="inline-block text-[10px] font-black uppercase bg-orange-500 text-white px-2 py-0.5 rounded-full shadow-sm">
                  Today
                </span>
              </div>
            )}

            <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-semibold text-slate-400 whitespace-nowrap">
              <span className="shrink-0">{workout.dayName}, {workout.displayDate}</span>
              <span className="shrink-0">•</span>
              <span className="shrink-0">Week {workout.weekNumber}</span>
            </div>
            <div className="font-extrabold text-white text-base sm:text-lg mt-0.5 truncate">{workout.workoutType}</div>
          </div>
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <span className="font-black text-orange-400 text-sm sm:text-base mr-1">{workout.totalKm}</span>
            <button
              onClick={(e) => handleExportSingleRun(e, workout)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
              title="Add single run to calendar (.ics)"
            >
              <CalendarPlus className="w-4 h-4 text-orange-400" />
            </button>
            <button
              onClick={(e) => handleCopyStrava(e, workout.id, workout.stravaTitle)}
              className="p-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 transition-colors"
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
                <strong className="text-orange-400 not-italic">Coach Advice: </strong>
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 p-6 shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Trophy className="w-48 h-48 text-orange-500" />
          </div>
          <div className="relative z-10 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/10 border border-orange-500/20 text-orange-400">
                  <Flame className="w-3.5 h-3.5" />
                  <span>MMR Running Hub</span>
                </div>
                {activePlan.status === 'archived' && (
                  <span className="bg-slate-800 text-slate-400 text-xs px-2.5 py-0.5 rounded-full border border-slate-700">
                    Archived Block
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-orange-400" />
                    <span>Export iCal</span>
                    <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
                  </button>

                  {showExportMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1 z-50">
                      <button
                        onClick={handleExportEntirePlan}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-between"
                      >
                        <span>Export Whole Plan</span>
                        <Calendar className="w-3.5 h-3.5 text-orange-400" />
                      </button>
                      <button
                        onClick={handleExportWeek}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-between"
                      >
                        <span>Export Current Week</span>
                        <BarChart3 className="w-3.5 h-3.5 text-orange-400" />
                      </button>
                      <button
                        onClick={handleExportUpcoming}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-between"
                      >
                        <span>Export Upcoming Runs</span>
                        <PlayCircle className="w-3.5 h-3.5 text-orange-400" />
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowArchiveManager(!showArchiveManager)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
                >
                  <FolderArchive className="w-3.5 h-3.5 text-orange-400" />
                  <span>Plans</span>
                </button>
                <button
                  onClick={() => setShowPaceCalc(!showPaceCalc)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
                >
                  <Calculator className="w-3.5 h-3.5 text-orange-400" />
                  <span>{showPaceCalc ? 'Hide Pace' : 'Pace Calc'}</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {activePlan.name}
              </h1>
              {daysUntilRace > 0 && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{daysUntilRace} Days To Race Day</span>
                </div>
              )}
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span className="flex items-center gap-1 text-slate-200">
                  <BarChart3 className="w-3.5 h-3.5 text-orange-400" />
                  Week {currentWeekNum} Volume: <strong className="text-orange-400">{currentWeekKm} km</strong>
                </span>
                <span>{totalPlanCompletedKm} / {totalPlanKm} km Total Progress</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-300"
                  style={{ width: `${Math.min(100, (Number(totalPlanCompletedKm) / Number(totalPlanKm)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </header>

        {showArchiveManager && (
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Archive className="w-4 h-4 text-orange-400" />
                Training Block Manager
              </h3>
              <button
                onClick={() => setShowNewPlanModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-colors"
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
                      ? 'border-orange-500/80 bg-orange-500/10 text-white'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
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
              <button onClick={handleArchiveCurrentPlan} className="text-xs text-slate-400 hover:text-orange-400 flex items-center gap-1 pt-1 underline">
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
                  <PlusCircle className="w-4 h-4 text-orange-400" />
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
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
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Race Date</label>
                    <input
                      type="date"
                      required
                      value={newRaceDate}
                      onChange={(e) => setNewRaceDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
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
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Target Time</label>
                    <input
                      type="text"
                      placeholder="e.g. Sub-2:00"
                      value={newTargetTime}
                      onChange={(e) => setNewTargetTime(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                      Paste Gemini / ChatGPT / Custom AI Plan Text
                    </label>
                    <span className="text-[10px] text-slate-500">Optional</span>
                  </div>
                  <textarea
                    rows={4}
                    placeholder="Paste raw workout output from Gemini, Claude, or ChatGPT here (bullet points, markdown tables, or text lines)..."
                    value={pastedPlanText}
                    onChange={(e) => setPastedPlanText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-orange-500 font-mono"
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
                    className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 shadow-lg shadow-orange-500/20"
                  >
                    Save & Activate
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showPaceCalc && (
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calculator className="w-4 h-4 text-orange-400" /> Target Pace & Split Calculator
              </h3>
              <span className="text-xs text-slate-400">Adjust pace to see estimated finish times</span>
            </div>
            <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 w-fit">
              <span className="text-xs font-semibold text-slate-300">Pace:</span>
              <div className="flex items-center gap-1">
                <input type="number" min="3" max="10" value={paceMin} onChange={(e) => setPaceMin(Number(e.target.value))} className="w-12 bg-slate-800 text-center font-bold text-orange-400 rounded py-1 text-sm border border-slate-700" />
                <span className="text-xs text-slate-400 font-bold">:</span>
                <input type="number" min="0" max="59" value={paceSec} onChange={(e) => setPaceSec(Number(e.target.value))} className="w-12 bg-slate-800 text-center font-bold text-orange-400 rounded py-1 text-sm border border-slate-700" />
                <span className="text-xs text-slate-400 font-medium ml-1">/km</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                <div className="text-[10px] uppercase font-bold text-slate-500">5k Finish</div>
                <div className="text-base font-black text-white mt-0.5">{paceCalculations.fiveK}</div>
              </div>
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                <div className="text-[10px] uppercase font-bold text-slate-500">10k Finish</div>
                <div className="text-base font-black text-white mt-0.5">{paceCalculations.tenK}</div>
              </div>
              <div className="bg-slate-950/80 p-3 rounded-xl border border-orange-500/30 bg-orange-500/5">
                <div className="text-[10px] uppercase font-bold text-orange-400">HM Finish (21.1k)</div>
                <div className="text-base font-black text-orange-400 mt-0.5">{paceCalculations.halfMarathon}</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 gap-1 backdrop-blur-md">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'upcoming'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <PlayCircle className="w-4 h-4" />
            <span>Upcoming Runs</span>
          </button>
          <button
            onClick={() => setActiveTab('whole')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'whole'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Whole Plan</span>
          </button>
          <button
            onClick={() => setActiveTab('previous')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'previous'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Previous Runs</span>
          </button>
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
                    .reduce((sum, w) => sum + w.numericKm, 0)
                    .toFixed(1);
                  return (
                    <div key={weekNum} className="space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2 pt-1 px-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 px-2.5 py-1 rounded-md border border-orange-500/30">
                            Week {weekNum}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-slate-400">
                          Total Volume: <strong className="text-orange-400">{weekKmTotal} km</strong>
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
                All runs in this block completed! Time to archive this plan and start a new target. 🎉
              </div>
            )}
          </div>
        )}

        {activeTab === 'whole' && (
          <div className="space-y-6">
            {Object.keys(workoutsByWeek)
              .map(Number)
              .sort((a, b) => a - b)
              .map((weekNum) => {
                const weekWorkouts = workoutsByWeek[weekNum];
                const weekKmTotal = weekWorkouts
                  .reduce((sum, w) => sum + w.numericKm, 0)
                  .toFixed(1);
                return (
                  <div key={weekNum} className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 pt-1 px-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 px-2.5 py-1 rounded-md border border-orange-500/30">
                          Week {weekNum}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-400">
                        Total Volume: <strong className="text-orange-400">{weekKmTotal} km</strong>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {weekWorkouts.map((workout) => renderWorkoutCard(workout))}
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {activeTab === 'previous' && (
          <div className="space-y-6">
            {Object.keys(previousByWeek).length > 0 ? (
              Object.keys(previousByWeek)
                .map(Number)
                .sort((a, b) => b - a)
                .map((weekNum) => {
                  const weekWorkouts = previousByWeek[weekNum];
                  const weekKmTotal = weekWorkouts
                    .reduce((sum, w) => sum + w.numericKm, 0)
                    .toFixed(1);
                  return (
                    <div key={weekNum} className="space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2 pt-1 px-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 px-2.5 py-1 rounded-md border border-orange-500/30">
                            Week {weekNum}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-slate-400">
                          Total Volume: <strong className="text-orange-400">{weekKmTotal} km</strong>
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
