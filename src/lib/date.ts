/**
 * Date helpers.
 *
 * WHY THIS FILE EXISTS
 * `new Date('2026-07-28')` is parsed as UTC midnight, but `getDate()` reads
 * local time. West of UTC that returns Jul 27, so every calendar export was
 * silently one day early. Always build dates with `parseISODate` below, which
 * constructs a *local* midnight instead.
 */

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parses YYYY-MM-DD into a local-midnight Date. Returns null if invalid. */
export function parseISODate(dateStr: unknown): Date | null {
  if (typeof dateStr !== 'string') return null;
  const match = ISO_DATE_RE.exec(dateStr.trim());
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  // Rejects rollovers such as 2026-02-30.
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

export function isValidISODate(dateStr: unknown): boolean {
  return parseISODate(dateStr) !== null;
}

/** Formats a Date as YYYY-MM-DD using local calendar parts. */
export function toISODateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Compact YYYYMMDD form used by ICS and Google Calendar URLs. */
export function toCalendarDateString(date: Date): string {
  return toISODateString(date).replace(/-/g, '');
}

export function todayISO(): string {
  return toISODateString(new Date());
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date.getTime());
  next.setDate(next.getDate() + days);
  return next;
}

export function addDaysISO(dateStr: string, days: number): string | null {
  const date = parseISODate(dateStr);
  return date ? toISODateString(addDays(date, days)) : null;
}

/** Whole days from `fromISO` to `toISO`. Negative if `toISO` is in the past. */
export function daysBetweenISO(fromISO: string, toISO: string): number {
  const from = parseISODate(fromISO);
  const to = parseISODate(toISO);
  if (!from || !to) return 0;
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((to.getTime() - from.getTime()) / msPerDay);
}

/** "Aug 1" */
export function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
}

/** "Sat" */
export function formatDayName(date: Date): string {
  return date.toLocaleDateString('en-GB', { weekday: 'short' });
}

/** "20 Sep 2026" */
export function formatLongDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatLongDateISO(dateStr: string): string {
  const date = parseISODate(dateStr);
  return date ? formatLongDate(date) : dateStr;
}

/** UTC timestamp in ICS DTSTAMP form: 20260814T120000Z */
export function toICSTimestamp(date: Date = new Date()): string {
  return `${date.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
}
