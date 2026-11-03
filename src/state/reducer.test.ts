import { describe, expect, it } from 'vitest';
import { GENERAL_LIST_ID } from '../constants';
import { makeTask } from '../test/factories';
import type { AppData } from '../types';
import { reducer } from './reducer';

const moduleA = { id: 'mod-a', name: 'Symbolic AI', code: 'COMP3070' };
const base: AppData = {
  version: 1,
  modules: [moduleA],
  tasks: [makeTask({ id: 'in-general' }), makeTask({ id: 'in-module', listId: moduleA.id })],
};

describe('reducer', () => {
  it('toggles completion both ways', () => {
    const once = reducer(base, { type: 'task/toggle', id: 'in-general' });
    expect(once.tasks[0]?.completed).toBe(true);
    const twice = reducer(once, { type: 'task/toggle', id: 'in-general' });
    expect(twice.tasks[0]?.completed).toBe(false);
  });

  it('updates a task without touching its completed status', () => {
    const done = reducer(base, { type: 'task/toggle', id: 'in-general' });
    const { listId, type, due, notes, weight } = makeTask();
    const draft = { listId, type, due, notes, weight, title: 'Renamed' };
    const next = reducer(done, { type: 'task/update', id: 'in-general', draft });

    expect(next.tasks[0]).toMatchObject({ title: 'Renamed', completed: true });
  });

  it('deleting a module removes its tasks and leaves others', () => {
    const next = reducer(base, { type: 'module/delete', id: moduleA.id });

    expect(next.modules).toEqual([]);
    expect(next.tasks.map((task) => task.id)).toEqual(['in-general']);
  });

  it('restores a deleted task', () => {
    const task = base.tasks[1]!;
    const removed = reducer(base, { type: 'task/delete', id: task.id });
    expect(reducer(removed, { type: 'task/restore', task }).tasks).toContainEqual(task);
  });

  it('restores into General when the task module has since been deleted', () => {
    const task = base.tasks[1]!;
    const withoutModule = reducer(base, { type: 'module/delete', id: moduleA.id });
    const next = reducer(withoutModule, { type: 'task/restore', task });

    expect(next.tasks.find((item) => item.id === task.id)?.listId).toBe(GENERAL_LIST_ID);
  });

  it('does not mutate the previous state', () => {
    const snapshot = structuredClone(base);
    reducer(base, { type: 'module/delete', id: moduleA.id });
    expect(base).toEqual(snapshot);
  });
});
