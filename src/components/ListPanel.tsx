import { CheckCircle2, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { TASK_TYPES } from '../constants';
import { sectionKey } from '../hooks/usePrefs';
import { isUrgent, matchesFilter, sortTasks, tasksForList, type TypeFilter } from '../lib/tasks';
import { useTracker } from '../state/TrackerContext';
import type { Module, Task } from '../types';
import { EmptyState, PanelHeader, PanelToolbar } from './Panel';
import { TaskSection } from './TaskSection';
import { TypeIcon } from './TypeTag';

export interface PanelActions {
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onEditModule: (module: Module) => void;
  onDeleteModule: (module: Module) => void;
}

interface ListPanelProps {
  listId: string;
  heading: string;
  /** Present on module tabs, which unlike General can be renamed and deleted. */
  module?: Module;
  collapsed: string[];
  onToggleSection: (key: string) => void;
  actions: PanelActions;
}

function getSummary(tasks: Task[], today: string): string {
  const openCount = tasks.filter((task) => !task.completed).length;
  const urgentCount = tasks.filter((task) => isUrgent(task, today)).length;
  if (tasks.length === 0) return 'No tasks yet';
  if (openCount === 0) return 'All done!';
  return urgentCount > 0 ? `${openCount} to do · ${urgentCount} urgent` : `${openCount} to do`;
}

function getEmptyMessage(total: number, visible: number, open: number): string | null {
  if (total === 0) return 'Nothing here yet. Add your first task!';
  if (visible === 0) return 'No tasks of this type here.';
  if (open === 0) return 'All done here. Nice work!';
  return null;
}

/**
 * The General tab or a module tab: open tasks grouped into collapsible type sections,
 * with finished ones folded into a Completed section at the bottom.
 */
export function ListPanel({ listId, heading, module, collapsed, onToggleSection, actions }: ListPanelProps) {
  const { data, today } = useTracker();
  const [filter, setFilter] = useState<TypeFilter>('all');

  const tasks = sortTasks(tasksForList(data.tasks, listId));
  const visible = tasks.filter((task) => matchesFilter(task, filter));
  const open = visible.filter((task) => !task.completed);
  // Most recent first, since those are the ones you're likeliest to want to reopen.
  const done = visible.filter((task) => task.completed).reverse();
  const emptyMessage = getEmptyMessage(tasks.length, visible.length, open.length);

  // Completed starts closed, so for it a stored key means "opened" rather than "collapsed".
  const doneKey = sectionKey(listId, 'completed');

  return (
    <>
      <PanelHeader heading={heading} summary={getSummary(tasks, today)}>
        {module && (
          <>
            <button className="icon-btn" type="button" onClick={() => actions.onEditModule(module)} aria-label={`Rename ${module.name}`} title="Rename module">
              <Pencil size={18} aria-hidden="true" />
            </button>
            <button className="icon-btn icon-btn-danger" type="button" onClick={() => actions.onDeleteModule(module)} aria-label={`Delete ${module.name}`} title="Delete module">
              <Trash2 size={18} aria-hidden="true" />
            </button>
          </>
        )}
      </PanelHeader>

      <PanelToolbar filter={filter} onFilterChange={setFilter} onAddTask={actions.onAddTask} />

      {emptyMessage && <EmptyState>{emptyMessage}</EmptyState>}

      {TASK_TYPES.map((meta) => {
        const sectionTasks = open.filter((task) => task.type === meta.value);
        if (sectionTasks.length === 0) return null;

        const key = sectionKey(listId, meta.value);
        return (
          <TaskSection
            key={meta.value}
            heading={meta.plural}
            icon={<TypeIcon type={meta.value} />}
            tone={meta.value}
            tasks={sectionTasks}
            collapsed={collapsed.includes(key)}
            onToggle={() => onToggleSection(key)}
            onEdit={actions.onEditTask}
          />
        );
      })}

      {done.length > 0 && (
        <TaskSection
          heading="Completed"
          icon={<CheckCircle2 size={14} strokeWidth={2.25} aria-hidden="true" />}
          tone="done"
          tasks={done}
          collapsed={!collapsed.includes(doneKey)}
          onToggle={() => onToggleSection(doneKey)}
          onEdit={actions.onEditTask}
        />
      )}
    </>
  );
}
