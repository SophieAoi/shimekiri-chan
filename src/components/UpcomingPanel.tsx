import { useState } from 'react';
import { GENERAL_LABEL } from '../constants';
import { formatLongDate, startOfMonth } from '../lib/dates';
import { getUrgency, matchesFilter, sortTasks, type TypeFilter } from '../lib/tasks';
import { useTracker } from '../state/TrackerContext';
import type { Task } from '../types';
import { Calendar } from './Calendar';
import { EmptyState, PanelHeader, PanelToolbar } from './Panel';
import { TaskItem } from './TaskItem';
import styles from './UpcomingPanel.module.css';

interface UpcomingPanelProps {
  /** Opens the add dialog, with the due date filled in when a day is picked. */
  onAddTask: (due?: string) => void;
  onEditTask: (task: Task) => void;
}

/**
 * A month calendar of every unfinished task across all tabs. Overdue work is listed
 * above it, so nothing slips out of sight in an earlier month, and the picked day's
 * tasks are listed below it with the usual controls.
 */
export function UpcomingPanel({ onAddTask, onEditTask }: UpcomingPanelProps) {
  const { data, today } = useTracker();
  const [filter, setFilter] = useState<TypeFilter>('all');
  const [selected, setSelected] = useState(today);
  const [month, setMonth] = useState(() => startOfMonth(today));

  const open = sortTasks(data.tasks.filter((task) => !task.completed && matchesFilter(task, filter)));
  const overdue = open.filter((task) => getUrgency(task, today) === 'overdue');
  // Overdue tasks already sit in their own list, so each task appears only once.
  const onDay = open.filter((task) => task.due === selected && !overdue.includes(task));
  const overdueOnDay = overdue.some((task) => task.due === selected);

  const select = (date: string) => {
    setSelected(date);
    setMonth(startOfMonth(date));
  };

  // Paging months moves the selection too: to today in its own month, else the 1st.
  const changeMonth = (next: string) => {
    setMonth(next);
    setSelected(next === startOfMonth(today) ? today : next);
  };

  const listLabel = (listId: string) => {
    const module = data.modules.find((item) => item.id === listId);
    return module ? module.code || module.name : GENERAL_LABEL;
  };

  const renderList = (tasks: readonly Task[]) => (
    <ul className={styles.list}>
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} onEdit={onEditTask} showType listLabel={listLabel(task.listId)} />
      ))}
    </ul>
  );

  return (
    <>
      <PanelHeader heading="Upcoming" summary="Every deadline across your tabs, by month" />
      <PanelToolbar
        filter={filter}
        onFilterChange={setFilter}
        // A past day is never offered as a due date.
        onAddTask={() => onAddTask(selected >= today ? selected : undefined)}
      />

      {overdue.length > 0 && (
        <section className={styles.group} data-group="overdue">
          <h3 className={styles.heading}>
            Overdue
            <span className={styles.count}>{overdue.length}</span>
          </h3>
          {renderList(overdue)}
        </section>
      )}

      <Calendar
        month={month}
        selected={selected}
        today={today}
        tasks={open}
        onSelect={select}
        onMonthChange={changeMonth}
      />

      <section className={styles.group}>
        <h3 className={styles.heading} aria-live="polite">
          {selected === today ? `Today, ${formatLongDate(selected)}` : formatLongDate(selected)}
          {onDay.length > 0 && <span className={styles.count}>{onDay.length}</span>}
        </h3>
        {onDay.length > 0 && renderList(onDay)}
        {onDay.length === 0 && (
          <EmptyState>{overdueOnDay ? 'This day’s tasks are overdue. See the list above.' : 'Nothing due on this day.'}</EmptyState>
        )}
      </section>
    </>
  );
}
