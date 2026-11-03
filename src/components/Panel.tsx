import { Plus } from 'lucide-react';
import { useId, type ReactNode } from 'react';
import { TASK_TYPES } from '../constants';
import type { TypeFilter } from '../lib/tasks';
import styles from './Panel.module.css';

interface PanelHeaderProps {
  heading: string;
  summary: string;
  children?: ReactNode;
}

export function PanelHeader({ heading, summary, children }: PanelHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.titles}>
        <h2 className={styles.heading}>{heading}</h2>
        <p className={styles.summary}>{summary}</p>
      </div>
      {children && <div className={styles.headerActions}>{children}</div>}
    </header>
  );
}

interface PanelToolbarProps {
  filter: TypeFilter;
  onFilterChange: (filter: TypeFilter) => void;
  onAddTask: () => void;
}

export function PanelToolbar({ filter, onFilterChange, onAddTask }: PanelToolbarProps) {
  const filterId = useId();

  return (
    <div className={styles.toolbar}>
      <label className={styles.filter} htmlFor={filterId}>
        Show
        <select
          id={filterId}
          className="select"
          value={filter}
          onChange={(event) => onFilterChange(event.target.value as TypeFilter)}
        >
          <option value="all">All types</option>
          {TASK_TYPES.map((meta) => (
            <option key={meta.value} value={meta.value}>
              {meta.plural}
            </option>
          ))}
        </select>
      </label>
      <button className={`btn btn-primary ${styles.addTask}`} type="button" onClick={onAddTask}>
        <Plus size={20} aria-hidden="true" />
        Add task
      </button>
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className={styles.empty}>{children}</p>;
}
