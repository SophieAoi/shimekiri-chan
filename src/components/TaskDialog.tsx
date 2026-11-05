import { useRef, useState, type FormEvent } from 'react';
import { flushSync } from 'react-dom';
import { DEFAULT_TASK_TYPE, GENERAL_LABEL, GENERAL_LIST_ID, TASK_TYPES } from '../constants';
import {
  toTaskDraft,
  validateTask,
  type TaskFormErrors,
  type TaskFormValues,
} from '../lib/validation';
import { useTracker } from '../state/TrackerContext';
import type { Task, TaskType } from '../types';
import { Field } from './Field';
import { Modal } from './Modal';

interface TaskDialogProps {
  /** The task being edited, or null when adding. */
  task: Task | null;
  defaultListId: string;
  /** Due date to start with when adding, e.g. the day picked on the calendar. */
  defaultDue?: string;
  onClose: () => void;
}

function initialValues(task: Task | null, defaultListId: string, defaultDue = ''): TaskFormValues {
  return {
    listId: task?.listId ?? defaultListId,
    title: task?.title ?? '',
    type: task?.type ?? DEFAULT_TASK_TYPE,
    // Blank when adding, so a wrong deadline can't slip through as a default, unless
    // the person picked the day themselves on the calendar.
    due: task?.due ?? defaultDue,
    notes: task?.notes ?? '',
    weight: task?.weight?.toString() ?? '',
  };
}

export function TaskDialog({ task, defaultListId, defaultDue, onClose }: TaskDialogProps) {
  const { data, addTask, updateTask } = useTracker();
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState(() => initialValues(task, defaultListId, defaultDue));
  const [errors, setErrors] = useState<TaskFormErrors>({});

  const set = <K extends keyof TaskFormValues>(key: K, value: TaskFormValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validateTask(values);

    if (Object.keys(nextErrors).length > 0) {
      flushSync(() => setErrors(nextErrors));
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }

    const draft = toTaskDraft(values);
    if (task) updateTask(task.id, draft);
    else addTask(draft);
    onClose();
  };

  return (
    <Modal title={task ? 'Edit task' : 'Add task'} onClose={onClose}>
      <form ref={formRef} onSubmit={onSubmit} noValidate>
        <Field label="Title" error={errors.title}>
          {(control) => (
            <input {...control} className="input" value={values.title} onChange={(e) => set('title', e.target.value)} />
          )}
        </Field>

        <div className="field-row">
          <Field label="Type">
            {({ id }) => (
              <select id={id} className="select" value={values.type} onChange={(e) => set('type', e.target.value as TaskType)}>
                {TASK_TYPES.map((meta) => (
                  <option key={meta.value} value={meta.value}>
                    {meta.label}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field label="Due date" error={errors.due}>
            {(control) => (
              <input {...control} className="input" type="date" value={values.due} onChange={(e) => set('due', e.target.value)} />
            )}
          </Field>
        </div>

        <div className="field-row">
          <Field label="List">
            {({ id }) => (
              <select id={id} className="select" value={values.listId} onChange={(e) => set('listId', e.target.value)}>
                <option value={GENERAL_LIST_ID}>{GENERAL_LABEL}</option>
                {data.modules.map((module) => (
                  <option key={module.id} value={module.id}>
                    {module.code || module.name}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field label="Weighting % (optional)" error={errors.weight}>
            {(control) => (
              <input {...control} className="input" type="number" inputMode="decimal" min="0" max="100" step="any" value={values.weight} onChange={(e) => set('weight', e.target.value)} />
            )}
          </Field>
        </div>

        <Field label="Notes (optional)" error={errors.notes}>
          {(control) => (
            <textarea {...control} className="input" rows={3} value={values.notes} onChange={(e) => set('notes', e.target.value)} />
          )}
        </Field>

        <div className="dialog-actions">
          <button className="btn btn-ghost" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" type="submit">
            {task ? 'Save changes' : 'Add task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
