import { CheckCircle2, ListChecks, Pencil, Presentation, Trash2 } from 'lucide-react';
import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { TASK_TYPES } from '../constants';
import { sectionKey, type ModuleView } from '../hooks/usePrefs';
import { isUrgent, matchesFilter, sortTasks, tasksForList, type TypeFilter } from '../lib/tasks';
import { useTracker } from '../state/TrackerContext';
import type { Module, Task } from '../types';
import { LecturePanel, lectureSummary } from './LecturePanel';
import styles from './ListPanel.module.css';
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
  /** Tasks or Lectures. Only module tabs have the switch; General is always tasks. */
  view: ModuleView;
  onViewChange: (view: ModuleView) => void;
  actions: PanelActions;
}

const VIEWS: readonly { view: ModuleView; label: string; Icon: typeof ListChecks }[] = [
  { view: 'tasks', label: 'Tasks', Icon: ListChecks },
  { view: 'lectures', label: 'Lectures', Icon: Presentation },
];

/** The Tasks / Lectures switch under a module's title: two tabs, arrow keys between them. */
function ViewTabs({
  view,
  counts,
  panelId,
  onChange,
}: {
  view: ModuleView;
  counts: Record<ModuleView, number>;
  panelId: string;
  onChange: (view: ModuleView) => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);

  const onKeyDown = (event: KeyboardEvent) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = view === 'tasks' ? 'lectures' : 'tasks';
    const target = event.key === 'Home' ? 'tasks' : event.key === 'End' ? 'lectures' : next;
    onChange(target);
    requestAnimationFrame(() => listRef.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.focus());
  };

  return (
    <div ref={listRef} className={styles.viewTabs} role="tablist" aria-label="Module sections" onKeyDown={onKeyDown}>
      {VIEWS.map(({ view: value, label, Icon }) => {
        const selected = value === view;
        return (
          <button
            key={value}
            id={`${panelId}-${value}-tab`}
            className={styles.viewTab}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={selected ? panelId : undefined}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(value)}
          >
            <Icon size={16} aria-hidden="true" />
            {label}
            <span className={styles.viewCount}>{counts[value]}</span>
          </button>
        );
      })}
    </div>
  );
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
export function ListPanel(props: ListPanelProps) {
  const { listId, heading, module, collapsed, onToggleSection, view, onViewChange, actions } = props;
  const { data, today } = useTracker();
  const [filter, setFilter] = useState<TypeFilter>('all');
  const panelId = useId();
  const showLectures = module !== undefined && view === 'lectures';
  const lectures = module ? data.lectures.filter((lecture) => lecture.moduleId === module.id) : [];

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
      <PanelHeader heading={heading} summary={showLectures ? lectureSummary(lectures) : getSummary(tasks, today)}>
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

      {module && (
        <ViewTabs
          view={view}
          counts={{ tasks: tasks.filter((task) => !task.completed).length, lectures: lectures.length }}
          panelId={panelId}
          onChange={onViewChange}
        />
      )}

      <div id={panelId} role={module ? 'tabpanel' : undefined} aria-labelledby={module ? `${panelId}-${view}-tab` : undefined}>
        {showLectures && module ? (
          <LecturePanel module={module} />
        ) : (
          <>
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
        )}
      </div>
    </>
  );
}
