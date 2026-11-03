import { describe, expect, it, vi } from 'vitest';
import { GENERAL_LIST_ID } from '../constants';
import { createSeedData } from '../data/seed';
import { makeTask } from '../test/factories';
import { BACKUP_KEY, loadData, parseData, saveData, STORAGE_KEY } from './storage';

describe('loadData', () => {
  it('returns the seed on first run', () => {
    expect(loadData()).toEqual(createSeedData());
  });

  it('round-trips saved data', () => {
    const data = { ...createSeedData(), tasks: [makeTask({ weight: 25, notes: 'Room 3' })] };
    saveData(data);
    expect(loadData()).toEqual(data);
  });

  it('does not bring the seed back after every module was deleted', () => {
    saveData({ version: 1, modules: [], tasks: [] });
    expect(loadData().modules).toEqual([]);
  });

  it('backs up corrupt data before falling back to the seed', () => {
    localStorage.setItem(STORAGE_KEY, '{not json');

    expect(loadData()).toEqual(createSeedData());
    expect(localStorage.getItem(BACKUP_KEY)).toBe('{not json');
  });

  it('survives storage being blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(loadData()).toEqual(createSeedData());
  });
});

describe('saveData', () => {
  it('reports failure when storage is full', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError');
    });
    expect(saveData(createSeedData())).toBe(false);
  });
});

describe('parseData', () => {
  it('rejects the wrong shape', () => {
    expect(parseData('[]')).toBeNull();
    expect(parseData('{"modules":[]}')).toBeNull();
  });

  it('drops malformed tasks but keeps the good ones', () => {
    const raw = JSON.stringify({
      modules: [],
      tasks: [makeTask(), { id: 'x', title: 'bad date', type: 'exam', due: 'whenever' }, null],
    });
    expect(parseData(raw)?.tasks.map((task) => task.id)).toEqual(['task-1']);
  });

  it('moves tasks with a missing module to General instead of losing them', () => {
    const raw = JSON.stringify({ modules: [], tasks: [makeTask({ listId: 'gone' })] });
    expect(parseData(raw)?.tasks[0]?.listId).toBe(GENERAL_LIST_ID);
  });
});
