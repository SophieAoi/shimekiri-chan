import {
  MODULE_CODE_MAX_LENGTH,
  MODULE_NAME_MAX_LENGTH,
  NOTES_MAX_LENGTH,
  TITLE_MAX_LENGTH,
} from '../constants';
import type { ModuleDraft, TaskDraft } from '../types';
import { isValidISODate } from './dates';

/** Raw form values. Weight stays a string so an empty field is distinct from 0. */
export type TaskFormValues = Omit<TaskDraft, 'weight'> & { weight: string };

export type TaskFormErrors = Partial<Record<'title' | 'due' | 'notes' | 'weight', string>>;

function validateWeight(raw: string): string | undefined {
  if (raw.trim() === '') return undefined;
  const weight = Number(raw);
  return Number.isFinite(weight) && weight >= 0 && weight <= 100
    ? undefined
    : 'Enter a percentage from 0 to 100.';
}

export function validateTask(values: TaskFormValues): TaskFormErrors {
  const errors: TaskFormErrors = {};
  const title = values.title.trim();

  if (!title) errors.title = 'Give this task a title.';
  else if (title.length > TITLE_MAX_LENGTH) {
    errors.title = `Keep the title under ${TITLE_MAX_LENGTH} characters.`;
  }
  if (!values.due) errors.due = 'Choose a due date.';
  else if (!isValidISODate(values.due)) errors.due = 'Enter a valid date.';
  if (values.notes.trim().length > NOTES_MAX_LENGTH) {
    errors.notes = `Keep notes under ${NOTES_MAX_LENGTH} characters.`;
  }
  const weightError = validateWeight(values.weight);
  if (weightError) errors.weight = weightError;

  return errors;
}

/** Converts valid form values into the stored shape. */
export function toTaskDraft(values: TaskFormValues): TaskDraft {
  const weight = values.weight.trim();
  return {
    listId: values.listId,
    title: values.title.trim(),
    type: values.type,
    due: values.due,
    notes: values.notes.trim(),
    weight: weight === '' ? null : Number(weight),
  };
}

export function validateModule(values: ModuleDraft): Partial<Record<keyof ModuleDraft, string>> {
  const name = values.name.trim();
  const errors: Partial<Record<keyof ModuleDraft, string>> = {};

  if (!name) errors.name = 'Give this module a name.';
  else if (name.length > MODULE_NAME_MAX_LENGTH) {
    errors.name = `Keep the name under ${MODULE_NAME_MAX_LENGTH} characters.`;
  }
  if (values.code.trim().length > MODULE_CODE_MAX_LENGTH) {
    errors.code = `Keep the code under ${MODULE_CODE_MAX_LENGTH} characters.`;
  }
  return errors;
}
