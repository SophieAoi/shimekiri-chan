import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, type KeyboardEvent } from 'react';
import { addDays, addMonths, formatLongDate, formatMonth, monthGrid, startOfMonth, weekdayIndex } from '../lib/dates';
import { getUrgency } from '../lib/tasks';
import type { Task } from '../types';
import styles from './Calendar.module.css';

interface CalendarProps {
  /** First day of the month on show. */
  month: string;
  selected: string;
  today: string;
  /** Tasks to plot. Each lands on its due date. */
  tasks: readonly Task[];
  onSelect: (date: string) => void;
  onMonthChange: (month: string) => void;
}

const WEEKDAYS = [
  ['Mon', 'Monday'],
  ['Tue', 'Tuesday'],
  ['Wed', 'Wednesday'],
  ['Thu', 'Thursday'],
  ['Fri', 'Friday'],
  ['Sat', 'Saturday'],
  ['Sun', 'Sunday'],
] as const;

/** Chips drawn per day before the rest collapse into "+N". */
const MAX_CHIPS = 3;

/** Arrow-key steps in days. Page keys move by month and are handled separately. */
const KEY_STEPS: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };

/**
 * Month grid with each task drawn on its due date. Days are buttons in a roving tab
 * order: Tab reaches the selected day, arrows move between days and across months.
 */
export function Calendar({ month, selected, today, tasks, onSelect, onMonthChange }: CalendarProps) {
  const tableRef = useRef<HTMLTableElement>(null);
  // Set by keyboard moves, so focus follows the selection only when the keys moved it.
  const moveFocus = useRef(false);

  const days = monthGrid(month);
  const weeks = Array.from({ length: days.length / 7 }, (_, row) => days.slice(row * 7, row * 7 + 7));
  const byDate = new Map<string, Task[]>();
  for (const task of tasks) byDate.set(task.due, [...(byDate.get(task.due) ?? []), task]);

  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    tableRef.current?.querySelector<HTMLElement>(`[data-date="${selected}"]`)?.focus();
  }, [selected, month]);

  const onKeyDown = (event: KeyboardEvent) => {
    let next: string | undefined;
    const step = KEY_STEPS[event.key];
    if (step !== undefined) next = addDays(selected, step);
    else if (event.key === 'Home') next = addDays(selected, -weekdayIndex(selected));
    else if (event.key === 'End') next = addDays(selected, 6 - weekdayIndex(selected));
    else if (event.key === 'PageUp' || event.key === 'PageDown') {
      const target = addMonths(selected, event.key === 'PageUp' ? -1 : 1);
      // Keep the day of the month where it exists, e.g. 31 Jan steps to 28 Feb.
      const last = addDays(addMonths(target, 1), -1);
      const day = Math.min(Number(selected.slice(8)), Number(last.slice(8)));
      next = `${target.slice(0, 8)}${String(day).padStart(2, '0')}`;
    }
    if (!next) return;
    event.preventDefault();
    moveFocus.current = true;
    onSelect(next);
  };

  const dayLabel = (date: string, dayTasks: readonly Task[], overdue: boolean) => {
    const count = dayTasks.length;
    let label = formatLongDate(date);
    if (date === today) label = `Today, ${label}`;
    if (count > 0) label += `, ${count} ${count === 1 ? 'task' : 'tasks'}`;
    if (overdue) label += ', overdue';
    return `${label}${count > 0 ? ':' : ''}`;
  };

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <h3 className={styles.month} aria-live="polite">
          {formatMonth(month)}
        </h3>
        <div className={styles.nav}>
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => onSelect(today)}
            disabled={startOfMonth(today) === month && selected === today}
          >
            Today
          </button>
          <button className="icon-btn" type="button" onClick={() => onMonthChange(addMonths(month, -1))} aria-label="Previous month" title="Previous month">
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <button className="icon-btn" type="button" onClick={() => onMonthChange(addMonths(month, 1))} aria-label="Next month" title="Next month">
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>
      </div>

      <table ref={tableRef} className={styles.grid} onKeyDown={onKeyDown}>
        <caption className="sr-only">{formatMonth(month)}. Use the arrow keys to move between days.</caption>
        <thead>
          <tr>
            {WEEKDAYS.map(([short, long]) => (
              <th key={short} scope="col" abbr={long}>
                {short}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={week[0]}>
              {week.map((date) => {
                const dayTasks = byDate.get(date) ?? [];
                const overdue = dayTasks.some((task) => getUrgency(task, today) === 'overdue');
                const isSelected = date === selected;
                return (
                  <td key={date}>
                    <button
                      className={styles.day}
                      type="button"
                      data-date={date}
                      data-outside={startOfMonth(date) !== month}
                      data-overdue={overdue}
                      aria-pressed={isSelected}
                      aria-current={date === today ? 'date' : undefined}
                      tabIndex={isSelected ? 0 : -1}
                      onClick={() => onSelect(date)}
                    >
                      {/* The name comes from the content, so it includes the visible chip titles. */}
                      <span className="sr-only">{dayLabel(date, dayTasks, overdue)} </span>
                      <span className={styles.number} aria-hidden="true">
                        {Number(date.slice(8))}
                      </span>
                      {dayTasks.length > 0 && (
                        <span className={styles.chips}>
                          {dayTasks.slice(0, MAX_CHIPS).map((task) => (
                            <span
                              key={task.id}
                              className={styles.chip}
                              data-type={task.type}
                              data-overdue={getUrgency(task, today) === 'overdue'}
                            >
                              <span className={styles.chipText}>{task.title}</span>
                              {/* Separates titles in the spoken name; chips stack visually anyway. */}
                              <span className="sr-only">; </span>
                            </span>
                          ))}
                          {dayTasks.length > MAX_CHIPS && (
                            <span className={styles.more}>
                              +{dayTasks.length - MAX_CHIPS}
                              <span className="sr-only"> more</span>
                            </span>
                          )}
                        </span>
                      )}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
