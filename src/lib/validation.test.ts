import { describe, expect, it } from 'vitest';
import { GENERAL_LIST_ID, TITLE_MAX_LENGTH } from '../constants';
import { toTaskDraft, validateModule, validateTask, type TaskFormValues } from './validation';

const valid: TaskFormValues = {
  listId: GENERAL_LIST_ID,
  title: 'Essay',
  type: 'coursework',
  due: '2026-11-20',
  notes: '',
  weight: '',
};

describe('validateTask', () => {
  it('passes a minimal valid task', () => {
    expect(validateTask(valid)).toEqual({});
  });

  it('allows a past due date for logging something already late', () => {
    expect(validateTask({ ...valid, due: '2020-01-01' })).toEqual({});
  });

  it('requires a title that is not just spaces', () => {
    expect(validateTask({ ...valid, title: '   ' }).title).toBeDefined();
  });

  it('limits title length', () => {
    expect(validateTask({ ...valid, title: 'a'.repeat(TITLE_MAX_LENGTH + 1) }).title).toBeDefined();
  });

  it('requires a real due date', () => {
    expect(validateTask({ ...valid, due: '' }).due).toBeDefined();
    expect(validateTask({ ...valid, due: '2026-02-31' }).due).toBeDefined();
  });

  it.each(['0', '100', '12.5', ' 40 '])('accepts weight %s', (weight) => {
    expect(validateTask({ ...valid, weight }).weight).toBeUndefined();
  });

  it.each(['-1', '100.5', 'lots'])('rejects weight %s', (weight) => {
    expect(validateTask({ ...valid, weight }).weight).toBeDefined();
  });
});

describe('toTaskDraft', () => {
  it('trims text and keeps a blank weight distinct from zero', () => {
    const draft = toTaskDraft({ ...valid, title: '  Essay ', notes: ' hi ' });
    expect(draft).toMatchObject({ title: 'Essay', notes: 'hi', weight: null });
    expect(toTaskDraft({ ...valid, weight: '0' }).weight).toBe(0);
  });
});

describe('validateModule', () => {
  it('requires a name and treats the code as optional', () => {
    expect(validateModule({ name: 'Symbolic AI', code: '' })).toEqual({});
    expect(validateModule({ name: '  ', code: 'X' }).name).toBeDefined();
  });
});
