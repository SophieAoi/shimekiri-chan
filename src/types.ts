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
  notes: string;
  /** Percentage of the module grade, or null when not set. */
  weight: number | null;
  completed: boolean;
  /** ISO timestamp, used as a stable tie-break when two tasks share a due date. */
  createdAt: string;
}

/** The fields a person edits in the task form. */
export type TaskDraft = Pick<Task, 'listId' | 'title' | 'type' | 'due' | 'notes' | 'weight'>;

export interface Module {
  id: string;
  name: string;
  /** Short label such as COMP3040, shown on the tab. May be empty. */
  code: string;
}

export type ModuleDraft = Pick<Module, 'name' | 'code'>;

export interface AppData {
  version: 1;
  modules: Module[];
  tasks: Task[];
}
