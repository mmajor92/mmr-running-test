import type { Workout, WorkoutCategory } from '../types';
import {
  addDays,
  formatDayName,
  formatDisplayDate,
  parseISODate,
  toISODateString,
} from './date';

export interface ParseResult {
  workouts: Workout[];
  warnings: string[];
}

const WEEK_HEADER_RE = /\bweek\s*(\d{1,2})\b/i;

/** Only unit-suffixed distances count. `5k Pace` is a pace reference, not a distance. */
const DISTANCE_RE = /(\d+(?:[.,]\d+)?)\s*(kilometres|kilometers|km|kms|miles|mile|mi)\b/gi;
const TOTAL_RE = /(?:total|=)\D{0,12}?(\d+(?:[.,]\d+)?)\s*(km|mi|miles?)\b/i;
const MINUTES_RE = /(\d{2,3})\s*(?:-?\s*)?(?:min|mins|minute|minutes)\b/i;

const KM_PER_MILE = 1.60934;
/** Used only to estimate distance for time-based sessions, e.g. "65 mins easy". */
const ESTIMATE_SEC_PER_KM = 390;

const WEEKDAYS: ReadonlyArray<{ re: RegExp; offset: number }> = [
  { re: /\bmon(?:day)?\b/i, offset: 0 },
  { re: /\btue(?:s|sday)?\b/i, offset: 1 },
  { re: /\bwed(?:nesday)?\b/i, offset: 2 },
  { re: /\bthu(?:r|rs|rsday)?\b/i, offset: 3 },
  { re: /\bfri(?:day)?\b/i, offset: 4 },
  { re: /\bsat(?:urday)?\b/i, offset: 5 },
  { re: /\bsun(?:day)?\b/i, offset: 6 },
];

/** Fallback slots when a line names no weekday: Tue, Thu, Fri, Sat, Sun, Wed, Mon. */
const FALLBACK_OFFSETS = [1, 3, 4, 5, 6, 2, 0] as const;

const CATEGORY_RULES: ReadonlyArray<{ category: WorkoutCategory; keywords: readonly string[] }> = [
  { category: 'raceday', keywords: ['race day', 'race-day', 'pb attempt', 'time trial', 'half marathon', 'half-marathon', 'marathon'] },
  { category: 'intervals', keywords: ['interval', 'vo2', 'threshold', 'tempo', 'speed', 'ladder', 'fartlek', 'rep', 'hill'] },
  { category: 'longrun', keywords: ['long run', 'long-run', 'steady', 'endurance', 'peak run'] },
  { category: 'shakeout', keywords: ['shakeout', 'shake-out', 'recovery', 'rest', 'stride'] },
  { category: 'progression', keywords: ['progression', 'easy', 'aerobic', 'zone 2'] },
];

/** "5x2 mins", "6 x 400m" - a rep scheme is an interval session even with no keyword. */
const REP_SCHEME_RE = /\b\d{1,2}\s*[x×]\s*\d/i;

function detectCategory(line: string): WorkoutCategory {
  const lower = line.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((keyword) => lower.includes(keyword))) return rule.category;
  }
  if (REP_SCHEME_RE.test(line)) return 'intervals';
  return 'progression';
}

function toKm(value: string, unit: string): number {
  const amount = Number(value.replace(',', '.'));
  if (!Number.isFinite(amount)) return 0;
  return /^mi/i.test(unit) ? amount * KM_PER_MILE : amount;
}

interface DistanceResult {
  km: number;
  estimated: boolean;
}

/**
 * Distance strategy, in priority order:
 *  1. An explicit total ("= 7.0 km Total")
 *  2. The sum of every unit-suffixed leg ("1.5 km warmup + 5 km + 1 km cooldown")
 *  3. An estimate from a stated duration ("65 mins")
 * The old parser took the *first* match, so a warmup line reported 1.5 km total.
 */
function extractDistance(line: string): DistanceResult {
  const totalMatch = TOTAL_RE.exec(line);
  if (totalMatch) {
    const km = toKm(totalMatch[1], totalMatch[2]);
    if (km > 0) return { km, estimated: false };
  }

  DISTANCE_RE.lastIndex = 0;
  let sum = 0;
  let match: RegExpExecArray | null;
  while ((match = DISTANCE_RE.exec(line)) !== null) {
    sum += toKm(match[1], match[2]);
  }
  if (sum > 0) return { km: Math.round(sum * 10) / 10, estimated: false };

  const minutesMatch = MINUTES_RE.exec(line);
  if (minutesMatch) {
    const minutes = Number(minutesMatch[1]);
    if (Number.isFinite(minutes) && minutes > 0) {
      const km = (minutes * 60) / ESTIMATE_SEC_PER_KM;
      return { km: Math.round(km * 10) / 10, estimated: true };
    }
  }

  return { km: 0, estimated: true };
}

const NOISE_PREFIXES = [
  'title',
  'note',
  'notes',
  'disclaimer',
  'total',
  'weekly total',
  'summary',
  'plan',
  'target',
  'goal',
  'key',
  'legend',
  'overview',
] as const;

function isNoiseLine(line: string): boolean {
  if (line.length < 5) return true;
  if (/^#{1,6}\s/.test(line)) return true; // Any markdown heading, not just ###.
  if (/^[#>*\-=_|\s]+$/.test(line)) return true; // Rules and empty bullets.
  if (/^\|?\s*[-:|\s]+\|?$/.test(line)) return true; // Markdown table separators.

  const lower = line.toLowerCase().replace(/^[\s*\-#>|]+/, '');
  return NOISE_PREFIXES.some((prefix) => lower.startsWith(`${prefix}:`) || lower === prefix);
}

function cleanTitle(line: string): string {
  return line
    .replace(/^[\s*\-#>|\d.)]+/, '')
    .replace(/\|/g, ' ')
    .replace(/\*\*/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max).trimEnd()}...` : text;
}

/**
 * Parses pasted AI output into workouts.
 *
 * Unlike the previous version this never substitutes the built-in template on
 * failure. It returns an empty list plus warnings, so the caller can tell the
 * runner what happened instead of silently loading someone else's plan.
 */
export function parsePastedPlan(
  rawText: string,
  startDateStr: string,
  planName: string,
): ParseResult {
  const warnings: string[] = [];
  const startDate = parseISODate(startDateStr);

  if (!startDate) {
    return { workouts: [], warnings: ['Plan start date is not a valid date.'] };
  }

  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { workouts: [], warnings: ['Nothing to parse - the pasted text was empty.'] };
  }

  const workouts: Workout[] = [];
  const usedOffsets = new Map<number, Set<number>>();
  const batchId = Date.now().toString(36);
  let currentWeek = 1;
  let estimatedCount = 0;
  let sawWeekHeader = false;

  const claimOffset = (week: number, preferred: number | null): number => {
    const used = usedOffsets.get(week) ?? new Set<number>();
    usedOffsets.set(week, used);

    if (preferred !== null && !used.has(preferred)) {
      used.add(preferred);
      return preferred;
    }
    for (const offset of FALLBACK_OFFSETS) {
      if (!used.has(offset)) {
        used.add(offset);
        return offset;
      }
    }
    // More than seven sessions in a week: stack the overflow on the last day.
    return 6;
  };

  for (const line of lines) {
    const weekMatch = WEEK_HEADER_RE.exec(line);
    // A bare week header is metadata. A line that names a week *and* a session
    // is still a session, so only skip when the line is basically just the header.
    if (weekMatch && line.replace(WEEK_HEADER_RE, '').replace(/[^a-z0-9]/gi, '').length < 4) {
      currentWeek = Number(weekMatch[1]);
      sawWeekHeader = true;
      continue;
    }
    if (weekMatch) {
      currentWeek = Number(weekMatch[1]);
      sawWeekHeader = true;
    }

    if (isNoiseLine(line)) continue;

    const title = cleanTitle(line);
    if (!title) continue;

    const weekday = WEEKDAYS.find((day) => day.re.test(line));
    const offset = claimOffset(currentWeek, weekday ? weekday.offset : null);
    const sessionDate = addDays(startDate, (currentWeek - 1) * 7 + offset);
    const dateStr = toISODateString(sessionDate);

    const { km, estimated } = extractDistance(line);
    if (estimated) estimatedCount += 1;

    const numericKm = km > 0 ? km : 5;
    const workoutType = truncate(title, 34);

    workouts.push({
      id: `parsed-${batchId}-${workouts.length}`,
      weekNumber: currentWeek,
      dateStr,
      displayDate: formatDisplayDate(sessionDate),
      dayName: formatDayName(sessionDate),
      workoutType,
      category: detectCategory(line),
      breakdown: line,
      numericKm,
      totalKm: `${numericKm.toFixed(1)} km`,
      stravaTitle: `${planName} (W${currentWeek}): ${workoutType}`,
      advice: 'Stay smooth, listen to your body, and control your pacing 🏃‍♂️.',
    });
  }

  if (workouts.length === 0) {
    warnings.push('No sessions were recognised in that text.');
  }
  if (!sawWeekHeader && workouts.length > 0) {
    warnings.push('No "Week N" headings found, so every session was placed in week 1.');
  }
  if (estimatedCount > 0) {
    warnings.push(
      `${estimatedCount} session${estimatedCount === 1 ? '' : 's'} had no distance, so it was estimated.`,
    );
  }

  workouts.sort((a, b) => a.dateStr.localeCompare(b.dateStr));
  return { workouts, warnings };
}
