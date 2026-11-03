import { GENERAL_LIST_ID } from '../constants';
import type { Task } from '../types';

export function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    listId: GENERAL_LIST_ID,
    title: 'Read chapter 3',
    type: 'homework',
    due: '2026-11-20',
    notes: '',
    weight: null,
    completed: false,
    createdAt: '2026-11-01T00:00:00.000Z',
    ...overrides,
  };
}
