import { ChevronDown } from 'lucide-react';
import { useId, type ReactNode } from 'react';
import { isUrgent } from '../lib/tasks';
import { useTracker } from '../state/TrackerContext';
import type { Task, TaskType } from '../types';
import { TaskItem } from './TaskItem';
import styles from './TaskSection.module.css';

interface TaskSectionProps {
  heading: string;
  icon: ReactNode;
  /** Colours the icon: a task type, or 'done' for the Completed section. */
  tone: TaskType | 'done';
  tasks: Task[];
  collapsed: boolean;
  onToggle: () => void;
  onEdit: (task: Task) => void;
}

/** A collapsible group of tasks: one per type, plus Completed at the bottom. */
export function TaskSection({ heading, icon, tone, tasks, collapsed, onToggle, onEdit }: TaskSectionProps) {
  const { today } = useTracker();
  const listId = useId();
  const isDone = tone === 'done';
  const urgentCount = tasks.filter((task) => isUrgent(task, today)).length;

  return (
    <section className={styles.section} data-tone={tone}>
      <h3 className={styles.heading}>
        <button className={styles.toggle} type="button" aria-expanded={!collapsed} aria-controls={listId} onClick={onToggle}>
          <ChevronDown className={styles.chevron} size={18} aria-hidden="true" />
          <span className={styles.icon} data-tone={tone}>
            {icon}
          </span>
          {heading}
          <span className={styles.count}>
            {tasks.length}
            <span className="sr-only">{isDone ? ' done' : ' to do'}</span>
          </span>
          {/* Stays visible when collapsed, so closing a section can't hide a deadline. */}
          {urgentCount > 0 && <span className={styles.urgent}>{urgentCount} urgent</span>}
        </button>
      </h3>
      <ul id={listId} className={styles.list} hidden={collapsed}>
        {tasks.map((task) => (
          // Completed mixes types, so its rows need the type tag back.
          <TaskItem key={task.id} task={task} onEdit={onEdit} showType={isDone} />
        ))}
      </ul>
    </section>
  );
}
