export type TaskType = 'exam' | 'homework' | 'coursework';

/** How pressing a task is right now. Drives highlights, sorting labels and the mascot. */
export type Urgency = 'done' | 'overdue' | 'today' | 'soon' | 'later';

export type Mood = 'relaxed' | 'nervous' | 'happy';

export interface Task {
  id: string;
  /** The tab this task belongs to: GENERAL_LIST_ID or a module id. */
  listId: string;
  title: string;
  type: TaskType;
  /** Local calendar date as YYYY-MM-DD. Deliberately not a timestamp, see lib/dates.ts. */
  due: string;
  /** Optional time on the due date as 24-hour HH:MM, or '' when only the day matters. */
  dueTime: string;
  notes: string;
  /** Percentage of the module grade, or null when not set. */
  weight: number | null;
  completed: boolean;
  /** ISO timestamp, used as a stable tie-break when two tasks share a due date. */
  createdAt: string;
}

/** The fields a person edits in the task form. */
export type TaskDraft = Pick<Task, 'listId' | 'title' | 'type' | 'due' | 'dueTime' | 'notes' | 'weight'>;

export interface Module {
  id: string;
  name: string;
  /** Short label such as COMP3040, shown on the tab. May be empty. */
  code: string;
}

export type ModuleDraft = Pick<Module, 'name' | 'code'>;

/** One lecture in a module's lecture tracker. */
export interface Lecture {
  id: string;
  moduleId: string;
  title: string;
  /** Local calendar date as YYYY-MM-DD, or '' when not set. */
  date: string;
  attended: boolean;
  /** Notes written up or recording rewatched: the lecture has been gone over since. */
  reviewed: boolean;
  createdAt: string;
}

export type LectureDraft = Pick<Lecture, 'title' | 'date'>;
export type LectureCheck = 'attended' | 'reviewed';

export interface AppData {
  version: 1;
  modules: Module[];
  tasks: Task[];
  lectures: Lecture[];
}
