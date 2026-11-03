import { useState } from 'react';
import { GENERAL_LABEL, UPCOMING_WINDOW_DAYS } from '../constants';
import {
  getUpcomingGroup,
  matchesFilter,
  UPCOMING_GROUPS,
  upcomingTasks,
  type TypeFilter,
} from '../lib/tasks';
import { useTracker } from '../state/TrackerContext';
import type { Task } from '../types';
import { EmptyState, PanelHeader, PanelToolbar } from './Panel';
import { TaskItem } from './TaskItem';
import styles from './UpcomingPanel.module.css';

interface UpcomingPanelProps {
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
}

/** Everything close across all tabs, grouped under time headings. */
export function UpcomingPanel({ onAddTask, onEditTask }: UpcomingPanelProps) {
  const { data, today } = useTracker();
  const [filter, setFilter] = useState<TypeFilter>('all');

  const upcoming = upcomingTasks(data.tasks, today);
  const visible = upcoming.filter((task) => matchesFilter(task, filter));
  const groups = UPCOMING_GROUPS.map((group) => ({
    ...group,
    tasks: visible.filter((task) => getUpcomingGroup(task, today) === group.id),
  })).filter((group) => group.tasks.length > 0);

  const listLabel = (listId: string) => {
    const module = data.modules.find((item) => item.id === listId);
    return module ? module.code || module.name : GENERAL_LABEL;
  };

  return (
    <>
      <PanelHeader
        heading="Upcoming"
        summary={`Overdue tasks and the next ${UPCOMING_WINDOW_DAYS} days, across all your tabs`}
      />
      <PanelToolbar filter={filter} onFilterChange={setFilter} onAddTask={onAddTask} />

      {groups.length === 0 && (
        <EmptyState>
          {upcoming.length === 0
            ? `Nothing due in the next ${UPCOMING_WINDOW_DAYS} days. Enjoy the calm!`
            : 'No upcoming tasks of this type.'}
        </EmptyState>
      )}

      {groups.map((group) => (
        <section key={group.id} className={styles.group} data-group={group.id}>
          <h3 className={styles.heading}>
            {group.label}
            <span className={styles.count}>{group.tasks.length}</span>
          </h3>
          <ul className={styles.list}>
            {group.tasks.map((task) => (
              <TaskItem key={task.id} task={task} onEdit={onEditTask} showType listLabel={listLabel(task.listId)} />
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
