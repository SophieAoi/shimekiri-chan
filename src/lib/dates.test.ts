import { describe, expect, it } from 'vitest';
import {
  addDays,
  addMonths,
  daysBetween,
  formatDate,
  formatLongDate,
  formatMonth,
  isValidISODate,
  monthGrid,
  startOfMonth,
  toISODate,
  weekdayIndex,
} from './dates';

describe('toISODate', () => {
  it('uses the local calendar day, including just before midnight', () => {
    expect(toISODate(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });
});

describe('isValidISODate', () => {
  it.each(['2026-02-28', '2028-02-29', '2000-01-01', '2100-12-31'])('accepts %s', (date) => {
    expect(isValidISODate(date)).toBe(true);
  });

  it.each(['', 'soon', '2026-02-31', '2026-13-01', '2027-02-29', '0002-01-01', '2026-1-1'])(
    'rejects "%s"',
    (date) => {
      expect(isValidISODate(date)).toBe(false);
    },
  );
});

describe('daysBetween', () => {
  it('counts forwards, backwards and across a year boundary', () => {
    expect(daysBetween('2026-11-02', '2026-11-05')).toBe(3);
    expect(daysBetween('2026-11-02', '2026-10-31')).toBe(-2);
    expect(daysBetween('2026-12-31', '2027-01-01')).toBe(1);
  });

  it('is not skewed by a daylight saving change', () => {
    expect(daysBetween('2026-03-28', '2026-03-30')).toBe(2);
  });
});

describe('addDays', () => {
  it('rolls over month ends', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });
});

describe('formatDate', () => {
  it('omits the year when it matches the current year', () => {
    expect(formatDate('2026-12-14', '2026-11-02')).toBe('Mon 14 Dec');
  });

  it('includes the year otherwise', () => {
    expect(formatDate('2027-01-04', '2026-11-02')).toBe('Mon 4 Jan 2027');
  });
});

describe('calendar helpers', () => {
  it('numbers weekdays from Monday', () => {
    expect(weekdayIndex('2026-11-02')).toBe(0); // Monday
    expect(weekdayIndex('2026-11-08')).toBe(6); // Sunday
  });

  it('finds month starts and steps across years', () => {
    expect(startOfMonth('2026-11-25')).toBe('2026-11-01');
    expect(addMonths('2026-12-15', 1)).toBe('2027-01-01');
    expect(addMonths('2026-01-31', -1)).toBe('2025-12-01');
  });

  it('pads a month out to whole Monday-to-Sunday weeks', () => {
    const grid = monthGrid('2026-11-01'); // 1 Nov 2026 is a Sunday
    expect(grid[0]).toBe('2026-10-26');
    expect(grid.at(-1)).toBe('2026-12-06');
    expect(grid).toHaveLength(42);
    expect(monthGrid('2027-02-01')).toHaveLength(28); // Feb 2027 starts on a Monday
  });

  it('formats month and long day labels', () => {
    expect(formatMonth('2026-11-05')).toBe('November 2026');
    expect(formatLongDate('2026-11-05')).toBe('Thursday 5 November');
  });
});
