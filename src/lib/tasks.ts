import { DUE_SOON_DAYS, UPCOMING_WINDOW_DAYS } from '../constants';
import type { Task, TaskType, Urgency } from '../types';
import { daysBetween, formatDate } from './dates';

export type TypeFilter = TaskType | 'all';

export function getUrgency(task: Task, today: string): Urgency {
  if (task.completed) return 'done';
  const days = daysBetween(today, task.due);
  if (days < 0) return 'overdue';
  if (days === 0) return 'today';
  return days <= DUE_SOON_DAYS ? 'soon' : 'later';
}

export function isUrgent(task: Task, today: string): boolean {
  const urgency = getUrgency(task, today);
  return urgency === 'overdue' || urgency === 'today' || urgency === 'soon';
}

/** Human wording for a due date. Urgency is always in the text, never colour alone. */
export function getDueLabel(task: Task, today: string): string {
  const date = formatDate(task.due, today);
  if (task.completed) return `Was due ${date}`;

  const days = daysBetween(today, task.due);
  if (days === 0) return `Due today · ${date}`;
  if (days === 1) return `Due tomorrow · ${date}`;
  if (days === -1) return `Overdue by 1 day · ${date}`;
  if (days < 0) return `Overdue by ${-days} days · ${date}`;
  return days <= DUE_SOON_DAYS ? `Due in ${days} days · ${date}` : `Due ${date}`;
}

/** Unfinished tasks first, then earliest due date, then oldest created. Does not mutate. */
export function sortTasks(tasks: readonly Task[]): Task[] {
  return [...tasks].sort(
    (a, b) =>
      Number(a.completed) - Number(b.completed) ||
      a.due.localeCompare(b.due) ||
      a.createdAt.localeCompare(b.createdAt),
  );
}

export function tasksForList(tasks: readonly Task[], listId: string): Task[] {
  return tasks.filter((task) => task.listId === listId);
}

export function matchesFilter(task: Task, filter: TypeFilter): boolean {
  return filter === 'all' || task.type === filter;
}

/** Everything unfinished that is overdue or due inside the Upcoming window. */
export function upcomingTasks(tasks: readonly Task[], today: string): Task[] {
  return sortTasks(
    tasks.filter(
      (task) => !task.completed && daysBetween(today, task.due) <= UPCOMING_WINDOW_DAYS,
    ),
  );
}
