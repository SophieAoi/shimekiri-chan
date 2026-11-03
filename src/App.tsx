import { useState } from 'react';
import styles from './App.module.css';
import { ConfirmDeleteModule } from './components/ConfirmDeleteModule';
import { ListPanel, type PanelActions } from './components/ListPanel';
import { Mascot } from './components/Mascot';
import { ModuleDialog } from './components/ModuleDialog';
import { TaskDialog } from './components/TaskDialog';
import { tabElementId, Tabs, type TabItem } from './components/Tabs';
import { Toast } from './components/Toast';
import { UpcomingPanel } from './components/UpcomingPanel';
import {
  GENERAL_LABEL,
  GENERAL_LIST_ID,
  SIDEBAR_MEDIA_QUERY,
  UPCOMING_LABEL,
  UPCOMING_TAB_ID,
} from './constants';
import { useMediaQuery } from './hooks/useMediaQuery';
import { usePrefs } from './hooks/usePrefs';
import { getMoodMessage } from './lib/mood';
import { isUrgent, tasksForList } from './lib/tasks';
import { TrackerProvider, useTracker } from './state/TrackerContext';
import type { Module, Task } from './types';

const PANEL_ID = 'task-panel';

type OpenDialog =
  | { kind: 'task'; task: Task | null }
  | { kind: 'module'; module: Module | null }
  | { kind: 'deleteModule'; module: Module };

function Shell() {
  const { data, today, mood, saveFailed, addModule, updateModule } = useTracker();
  const { activeTabId, collapsed, setActiveTab, toggleSection } = usePrefs();
  const [dialog, setDialog] = useState<OpenDialog | null>(null);
  const isWide = useMediaQuery(SIDEBAR_MEDIA_QUERY);
  const closeDialog = () => setDialog(null);

  const urgent = data.tasks.filter((task) => isUrgent(task, today));
  const countUrgent = (listId: string) => tasksForList(urgent, listId).length;

  const tabs: TabItem[] = [
    {
      id: UPCOMING_TAB_ID,
      label: UPCOMING_LABEL,
      icon: '📅',
      fullLabel: UPCOMING_LABEL,
      urgentCount: 0,
      group: 'fixed',
    },
    {
      id: GENERAL_LIST_ID,
      label: GENERAL_LABEL,
      icon: '⭐',
      fullLabel: GENERAL_LABEL,
      urgentCount: countUrgent(GENERAL_LIST_ID),
      group: 'fixed',
    },
    ...data.modules.map((module): TabItem => ({
      id: module.id,
      label: module.code || module.name,
      detail: module.code ? module.name : undefined,
      fullLabel: [module.code, module.name].filter(Boolean).join(' '),
      urgentCount: countUrgent(module.id),
      group: 'module',
    })),
  ];

  // A saved or just-deleted tab may no longer exist, so fall back rather than show nothing.
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[1]!;
  const activeModule = data.modules.find((module) => module.id === activeTab.id);

  const actions: PanelActions = {
    onAddTask: () => setDialog({ kind: 'task', task: null }),
    onEditTask: (task) => setDialog({ kind: 'task', task }),
    onEditModule: (module) => setDialog({ kind: 'module', module }),
    onDeleteModule: (module) => setDialog({ kind: 'deleteModule', module }),
  };

  return (
    <div className={styles.app}>
      {/* A column on wide screens; on narrow ones its children join the page grid. */}
      <div className={styles.sidebar}>
        <header className={styles.header}>
          <h1 className={styles.logo}>
            Shimekiri
            <span className={styles.kanji} lang="ja">
              締切
            </span>
          </h1>
        </header>

        <div className={styles.nav}>
          <Tabs
            tabs={tabs}
            activeId={activeTab.id}
            panelId={PANEL_ID}
            vertical={isWide}
            onSelect={setActiveTab}
            onAddModule={() => setDialog({ kind: 'module', module: null })}
          />
        </div>

        <aside className={styles.mascot} aria-label="Shimekiri-chan">
          <Mascot mood={mood} message={getMoodMessage(mood, urgent.length)} />
        </aside>
      </div>

      <main className={styles.main}>
        {saveFailed && (
          <p className={styles.warning} role="alert">
            Your browser couldn't save the latest changes, so they may be lost when you close
            this page. Check that site storage is allowed and not full.
          </p>
        )}
        <div id={PANEL_ID} className={styles.panel} role="tabpanel" aria-labelledby={tabElementId(activeTab.id)}>
          {activeTab.id === UPCOMING_TAB_ID ? (
            <UpcomingPanel key={UPCOMING_TAB_ID} onAddTask={actions.onAddTask} onEditTask={actions.onEditTask} />
          ) : (
            <ListPanel
              key={activeTab.id}
              listId={activeTab.id}
              heading={activeTab.fullLabel}
              module={activeModule}
              collapsed={collapsed}
              onToggleSection={toggleSection}
              actions={actions}
            />
          )}
        </div>
      </main>

      <Toast />

      {dialog?.kind === 'task' && (
        <TaskDialog
          task={dialog.task}
          defaultListId={activeTab.id === UPCOMING_TAB_ID ? GENERAL_LIST_ID : activeTab.id}
          onClose={closeDialog}
        />
      )}
      {dialog?.kind === 'module' && (
        <ModuleDialog
          module={dialog.module}
          onSave={(draft) => {
            if (dialog.module) updateModule(dialog.module.id, draft);
            else setActiveTab(addModule(draft));
          }}
          onClose={closeDialog}
        />
      )}
      {dialog?.kind === 'deleteModule' && (
        <ConfirmDeleteModule module={dialog.module} onClose={closeDialog} />
      )}
    </div>
  );
}

export function App() {
  return (
    <TrackerProvider>
      <Shell />
    </TrackerProvider>
  );
}
