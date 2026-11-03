/**
 * Due dates are calendar days, not moments in time, so they are stored as local
 * YYYY-MM-DD strings. `new Date('2026-03-01')` parses as UTC midnight, which is the
 * previous day west of Greenwich, so these helpers never go through that path.
 */

const MS_PER_DAY = 86_400_000;
const MIN_YEAR = 2000;
const MAX_YEAR = 2100;

const pad = (value: number) => String(value).padStart(2, '0');

function parts(iso: string): [year: number, month: number, day: number] {
  const [year = 0, month = 1, day = 1] = iso.split('-').map(Number);
  return [year, month, day];
}

/** Today's date in the person's own timezone. */
export function toISODate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** True for a real calendar date in a sensible range, so 2026-02-31 and year 0002 fail. */
export function isValidISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = parts(value);
  if (year < MIN_YEAR || year > MAX_YEAR) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

/** Whole days from `from` to `to`. Uses UTC so daylight saving cannot skew the result. */
export function daysBetween(from: string, to: string): number {
  const [fromYear, fromMonth, fromDay] = parts(from);
  const [toYear, toMonth, toDay] = parts(to);
  const start = Date.UTC(fromYear, fromMonth - 1, fromDay);
  const end = Date.UTC(toYear, toMonth - 1, toDay);
  return Math.round((end - start) / MS_PER_DAY);
}

export function addDays(iso: string, days: number): string {
  const [year, month, day] = parts(iso);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

/**
 * Short date such as "Mon 14 Dec". The year appears only when it differs from today's.
 * Assembled from parts because browsers punctuate the en-GB pattern differently.
 */
export function formatDate(iso: string, today: string): string {
  const [year, month, day] = parts(iso);
  const dateParts = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).formatToParts(new Date(Date.UTC(year, month - 1, day)));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    dateParts.find((item) => item.type === type)?.value;

  const label = `${part('weekday')} ${part('day')} ${part('month')}`;
  return year === parts(today)[0] ? label : `${label} ${year}`;
}
