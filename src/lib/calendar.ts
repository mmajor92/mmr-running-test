import type { Workout } from '../types';
import { addDays, parseISODate, toCalendarDateString, toICSTimestamp } from './date';

/**
 * Escapes a value for an ICS property, in the order RFC 5545 requires:
 * backslash first, then the delimiters, then newlines. The old version skipped
 * backslashes entirely, so any advice text containing one produced a broken feed.
 */
function escapeICS(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

const encoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;

function byteLength(char: string): number {
  if (encoder) return encoder.encode(char).length;
  return char.codePointAt(0)! > 0x7f ? 2 : 1;
}

/**
 * Folds a content line to 75 octets, as required by RFC 5545.
 * Iterating code points (not UTF-16 units) keeps emoji intact - the plan text
 * is full of them, and splitting a surrogate pair corrupts the file.
 */
function foldLine(line: string): string {
  const limit = 73;
  const chunks: string[] = [];
  let current = '';
  let bytes = 0;

  for (const char of line) {
    const size = byteLength(char);
    if (bytes + size > limit && current) {
      chunks.push(current);
      current = '';
      bytes = 0;
    }
    current += char;
    bytes += size;
  }
  if (current) chunks.push(current);

  return chunks.join('\r\n ');
}

function buildDescription(workout: Workout): string {
  const parts = [`Breakdown: ${workout.breakdown}`];
  if (workout.advice) parts.push(`Coach Advice: ${workout.advice}`);
  if (workout.nrc) parts.push(`NRC Guided Run: ${workout.nrc}`);
  return parts.join('\n');
}

export function generateICSContent(
  workouts: readonly Workout[],
  planName: string,
): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MMR Running Hub//Training Plan Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeICS(planName)}`,
  ];

  const stamp = toICSTimestamp();

  for (const workout of workouts) {
    const start = parseISODate(workout.dateStr);
    if (!start) continue; // Skip unparseable dates rather than emitting "NaN".

    const startFormatted = toCalendarDateString(start);
    const endFormatted = toCalendarDateString(addDays(start, 1));

    lines.push(
      'BEGIN:VEVENT',
      `UID:run-${workout.id}-${startFormatted}@mmrrunninghub.com`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${startFormatted}`,
      `DTEND;VALUE=DATE:${endFormatted}`,
      `SUMMARY:${escapeICS(`${workout.workoutType} (${workout.totalKm})`)}`,
      `DESCRIPTION:${escapeICS(buildDescription(workout))}`,
      'STATUS:CONFIRMED',
      'TRANSP:TRANSPARENT',
      'END:VEVENT',
    );
  }

  lines.push('END:VCALENDAR');
  return lines.map(foldLine).join('\r\n');
}

export function downloadICS(icsContent: string, filename: string): void {
  const safeName = filename.replace(/[^\w\-. ]+/g, '_').replace(/\s+/g, '_');
  const finalName = safeName.toLowerCase().endsWith('.ics') ? safeName : `${safeName}.ics`;

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = finalName;
  link.rel = 'noopener';
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 3000);
}

/** Google Calendar caps URL length, so details are trimmed. */
const MAX_DETAILS_LENGTH = 1200;

export function buildGoogleCalendarUrl(workout: Workout, planName: string): string | null {
  const start = parseISODate(workout.dateStr);
  if (!start) return null;

  const startFormatted = toCalendarDateString(start);
  const endFormatted = toCalendarDateString(addDays(start, 1));

  const details = [
    `Plan: ${planName}`,
    `Breakdown: ${workout.breakdown}`,
    workout.advice ? `Coach Advice: ${workout.advice}` : '',
    workout.nrc ? `NRC: ${workout.nrc}` : '',
  ]
    .filter(Boolean)
    .join('\n')
    .slice(0, MAX_DETAILS_LENGTH);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${workout.workoutType} (${workout.totalKm})`,
    dates: `${startFormatted}/${endFormatted}`,
    details,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Returns false if the popup was blocked, so the UI can say so. */
export function openGoogleCalendar(workout: Workout, planName: string): boolean {
  const url = buildGoogleCalendarUrl(workout, planName);
  if (!url) return false;

  const opened = window.open(url, '_blank', 'noopener,noreferrer');
  return opened !== null;
}
