import { Pencil, Trash2 } from 'lucide-react';
import { getDueLabel, getUrgency } from '../lib/tasks';
import { useTracker } from '../state/TrackerContext';
import type { Task } from '../types';
import styles from './TaskItem.module.css';
import { TypeTag } from './TypeTag';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  /** Only needed where types are mixed; inside a type section the heading says it. */
  showType?: boolean;
  /** Shown on the Upcoming tab, where tasks from every list are mixed together. */
  listLabel?: string;
}

export function TaskItem({ task, onEdit, showType = false, listLabel }: TaskItemProps) {
  const { today, toggleTask, deleteTask } = useTracker();
  const urgency = getUrgency(task, today);

  return (
    <li className={styles.item} data-urgency={urgency}>
      <input
        className={styles.check}
        type="checkbox"
        checked={task.completed}
        onChange={() => toggleTask(task)}
        aria-label={`Mark "${task.title}" as ${task.completed ? 'not done' : 'done'}`}
      />

      <p className={styles.title}>{task.title}</p>
      <div className={styles.meta}>
        {showType && <TypeTag type={task.type} />}
        {listLabel && <span className={styles.list}>{listLabel}</span>}
        {task.weight !== null && <span className={styles.weight}>{task.weight}%</span>}
        <span className={styles.due}>{getDueLabel(task, today)}</span>
      </div>
      {task.notes && <p className={styles.notes}>{task.notes}</p>}

      <div className={styles.actions}>
        <button className="icon-btn" type="button" onClick={() => onEdit(task)} aria-label={`Edit "${task.title}"`} title="Edit">
          <Pencil size={18} aria-hidden="true" />
        </button>
        <button className="icon-btn icon-btn-danger" type="button" onClick={() => deleteTask(task)} aria-label={`Delete "${task.title}"`} title="Delete">
          <Trash2 size={18} aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}
