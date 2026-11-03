import { describe, expect, it } from 'vitest';
import { makeTask } from '../test/factories';
import { getMood, getMoodMessage } from './mood';
import { getDueLabel, getUpcomingGroup, getUrgency, sortTasks, upcomingTasks } from './tasks';

const TODAY = '2026-11-02';

describe('getUrgency', () => {
  it.each([
    ['2026-11-01', 'overdue'],
    ['2026-11-02', 'today'],
    ['2026-11-03', 'soon'],
    ['2026-11-05', 'soon'],
    ['2026-11-06', 'later'],
  ])('treats a task due %s as %s', (due, expected) => {
    expect(getUrgency(makeTask({ due }), TODAY)).toBe(expected);
  });

  it('never flags a completed task, even past its date', () => {
    expect(getUrgency(makeTask({ due: '2026-01-01', completed: true }), TODAY)).toBe('done');
  });
});

describe('getDueLabel', () => {
  it.each([
    ['2026-10-30', 'Overdue by 3 days · Fri 30 Oct'],
    ['2026-11-01', 'Overdue by 1 day · Sun 1 Nov'],
    ['2026-11-02', 'Due today · Mon 2 Nov'],
    ['2026-11-03', 'Due tomorrow · Tue 3 Nov'],
    ['2026-11-05', 'Due in 3 days · Thu 5 Nov'],
    ['2026-11-20', 'Due Fri 20 Nov'],
  ])('labels %s', (due, expected) => {
    expect(getDueLabel(makeTask({ due }), TODAY)).toBe(expected);
  });
});

describe('sortTasks', () => {
  it('puts unfinished first, then earliest due, then oldest created', () => {
    const tasks = [
      makeTask({ id: 'done', due: '2026-01-01', completed: true }),
      makeTask({ id: 'later', due: '2026-12-01' }),
      makeTask({ id: 'same-new', due: '2026-11-10', createdAt: '2026-11-02T00:00:00Z' }),
      makeTask({ id: 'same-old', due: '2026-11-10', createdAt: '2026-11-01T00:00:00Z' }),
    ];

    expect(sortTasks(tasks).map((task) => task.id)).toEqual([
      'same-old',
      'same-new',
      'later',
      'done',
    ]);
  });

  it('does not mutate its input', () => {
    const tasks = [makeTask({ id: 'b', due: '2026-12-01' }), makeTask({ id: 'a', due: '2026-11-01' })];
    sortTasks(tasks);
    expect(tasks[0]?.id).toBe('b');
  });
});

describe('upcomingTasks', () => {
  it('keeps overdue and in-window tasks, drops completed and far-future ones', () => {
    const tasks = [
      makeTask({ id: 'overdue', due: '2026-10-01' }),
      makeTask({ id: 'edge', due: '2026-11-16' }),
      makeTask({ id: 'beyond', due: '2026-11-17' }),
      makeTask({ id: 'done', due: '2026-11-03', completed: true }),
    ];

    expect(upcomingTasks(tasks, TODAY).map((task) => task.id)).toEqual(['overdue', 'edge']);
  });
});

describe('getUpcomingGroup', () => {
  it.each([
    ['2026-11-01', 'overdue'],
    ['2026-11-02', 'today'],
    ['2026-11-03', 'week'],
    ['2026-11-09', 'week'],
    ['2026-11-10', 'later'],
  ])('puts a task due %s under %s', (due, expected) => {
    expect(getUpcomingGroup(makeTask({ due }), TODAY)).toBe(expected);
  });
});

describe('getMood', () => {
  const urgent = makeTask({ due: '2026-11-03' });
  const relaxed = makeTask({ due: '2026-12-01' });

  it('is relaxed with no tasks or only distant ones', () => {
    expect(getMood([], TODAY, false)).toBe('relaxed');
    expect(getMood([relaxed], TODAY, false)).toBe('relaxed');
  });

  it('is nervous when a deadline is close or missed', () => {
    expect(getMood([relaxed, urgent], TODAY, false)).toBe('nervous');
    expect(getMood([makeTask({ due: '2026-10-01' })], TODAY, false)).toBe('nervous');
  });

  it('ignores close deadlines that are already done', () => {
    expect(getMood([{ ...urgent, completed: true }], TODAY, false)).toBe('relaxed');
  });

  it('celebrates even while other deadlines are close', () => {
    expect(getMood([urgent], TODAY, true)).toBe('happy');
  });
});

describe('getMoodMessage', () => {
  it('uses the right singular and plural', () => {
    expect(getMoodMessage('nervous', 1)).toContain('1 deadline is');
    expect(getMoodMessage('nervous', 2)).toContain('2 deadlines are');
  });
});
