import { GENERAL_LIST_ID, TASK_TYPES } from '../constants';
import { createSeedData } from '../data/seed';
import type { AppData, Module, Task } from '../types';
import { isValidISODate } from './dates';

export const STORAGE_KEY = 'shimekiri:data';
export const BACKUP_KEY = 'shimekiri:data-backup';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

function toModule(value: unknown): Module | null {
  if (!isRecord(value)) return null;
  const { id, name, code } = value;
  if (typeof id !== 'string' || typeof name !== 'string') return null;
  return { id, name, code: typeof code === 'string' ? code : '' };
}

function toTask(value: unknown, listIds: ReadonlySet<string>): Task | null {
  if (!isRecord(value)) return null;
  const { id, listId, title, type, due, notes, weight, completed, createdAt } = value;
  const knownType = TASK_TYPES.find((meta) => meta.value === type);

  if (typeof id !== 'string' || typeof title !== 'string') return null;
  if (!knownType || typeof due !== 'string' || !isValidISODate(due)) return null;

  return {
    id,
    // A task whose module has vanished is kept rather than silently lost.
    listId: typeof listId === 'string' && listIds.has(listId) ? listId : GENERAL_LIST_ID,
    title,
    type: knownType.value,
    due,
    notes: typeof notes === 'string' ? notes : '',
    weight: typeof weight === 'number' && Number.isFinite(weight) ? weight : null,
    completed: completed === true,
    createdAt: typeof createdAt === 'string' ? createdAt : '',
  };
}

/** Parses saved JSON. Returns null when the whole blob is unusable. */
export function parseData(raw: string): AppData | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isRecord(parsed) || !Array.isArray(parsed.modules) || !Array.isArray(parsed.tasks)) {
    return null;
  }

  const modules = parsed.modules.map(toModule).filter((item) => item !== null);
  const listIds = new Set([GENERAL_LIST_ID, ...modules.map((module) => module.id)]);
  const tasks = parsed.tasks
    .map((item) => toTask(item, listIds))
    .filter((item) => item !== null);

  return { version: 1, modules, tasks };
}

/**
 * Reads saved data, or returns the seed on first run. Unreadable data is copied to a
 * backup key first, because the next save would otherwise destroy it for good.
 */
export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return createSeedData();

    const data = parseData(raw);
    if (data) return data;

    localStorage.setItem(BACKUP_KEY, raw);
  } catch {
    // Storage can be blocked entirely, e.g. by browser privacy settings.
  }
  return createSeedData();
}

/** Returns false when the write failed, so the UI can warn instead of losing data silently. */
export function saveData(data: AppData): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}
