import { tasksForList } from '../lib/tasks';
import { useTracker } from '../state/TrackerContext';
import type { Module } from '../types';
import { Modal } from './Modal';

interface ConfirmDeleteModuleProps {
  module: Module;
  onClose: () => void;
}

/** Deleting a module takes its tasks with it, so this one action asks first. */
export function ConfirmDeleteModule({ module, onClose }: ConfirmDeleteModuleProps) {
  const { data, deleteModule } = useTracker();
  const taskCount = tasksForList(data.tasks, module.id).length;

  const onConfirm = () => {
    deleteModule(module);
    onClose();
  };

  return (
    <Modal title={`Delete ${module.name}?`} onClose={onClose}>
      <p>
        {taskCount === 0
          ? 'This tab has no tasks.'
          : `This also deletes its ${taskCount === 1 ? '1 task' : `${taskCount} tasks`}. This can't be undone.`}
      </p>
      <div className="dialog-actions">
        <button className="btn btn-ghost" type="button" onClick={onClose}>
          Keep module
        </button>
        <button className="btn btn-danger" type="button" onClick={onConfirm}>
          Delete module
        </button>
      </div>
    </Modal>
  );
}
