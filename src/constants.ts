import type { TaskType } from './types';

export const GENERAL_LIST_ID = 'general';
export const GENERAL_LABEL = 'General';
export const UPCOMING_TAB_ID = 'upcoming';
export const UPCOMING_LABEL = 'Upcoming';

/** Tasks due within this many days count as "due soon". */
export const DUE_SOON_DAYS = 3;
/** The Upcoming tab shows overdue tasks plus this many days ahead. */
export const UPCOMING_WINDOW_DAYS = 14;

/** Wide enough for the sidebar layout. Keep in step with the 900px breakpoints in CSS. */
export const SIDEBAR_MEDIA_QUERY = '(min-width: 900px)';

export const HAPPY_DURATION_MS = 2500;
export const TOAST_DURATION_MS = 6000;

export const TITLE_MAX_LENGTH = 120;
export const NOTES_MAX_LENGTH = 1000;
export const MODULE_NAME_MAX_LENGTH = 80;
export const MODULE_CODE_MAX_LENGTH = 16;

export interface TaskTypeMeta {
  value: TaskType;
  label: string;
  plural: string;
}

/** Display order of the type sections within a tab. */
export const TASK_TYPES: readonly TaskTypeMeta[] = [
  { value: 'exam', label: 'Exam', plural: 'Exams' },
  { value: 'homework', label: 'Homework', plural: 'Homework' },
  { value: 'coursework', label: 'Coursework', plural: 'Coursework' },
];

export const DEFAULT_TASK_TYPE: TaskType = 'homework';
