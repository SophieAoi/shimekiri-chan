import { Plus } from 'lucide-react';
import { useEffect, useRef, type KeyboardEvent } from 'react';
import styles from './Tabs.module.css';

export interface TabItem {
  id: string;
  label: string;
  /** Decorative emoji shown before the label. Hidden from screen readers. */
  icon?: string;
  /** Second line shown in the sidebar, e.g. the module name under its code. */
  detail?: string;
  fullLabel: string;
  urgentCount: number;
  /** Modules are spaced apart from the fixed Upcoming and General tabs. */
  group: 'fixed' | 'module';
}

interface TabsProps {
  tabs: TabItem[];
  activeId: string;
  panelId: string;
  /** True in the sidebar layout, where tabs stack and show their detail line. */
  vertical: boolean;
  onSelect: (id: string) => void;
  onAddModule: () => void;
}

export const tabElementId = (id: string) => `tab-${id}`;

const PREVIOUS_KEYS = new Set(['ArrowLeft', 'ArrowUp']);
const NEXT_KEYS = new Set(['ArrowRight', 'ArrowDown']);

/** ARIA tablist with roving focus: Tab enters it, arrow keys move between tabs. */
export function Tabs({ tabs, activeId, panelId, vertical, onSelect, onAddModule }: TabsProps) {
  const listRef = useRef<HTMLDivElement>(null);

  const activeTab = () => listRef.current?.querySelector<HTMLElement>('[aria-selected="true"]');

  // The tab list can scroll, so keep the selected tab visible.
  useEffect(() => {
    activeTab()?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [activeId]);

  const onKeyDown = (event: KeyboardEvent) => {
    const index = tabs.findIndex((tab) => tab.id === activeId);
    const lastIndex = tabs.length - 1;
    let nextIndex: number | undefined;

    // Both arrow pairs work in either layout, so nobody has to know which is active.
    if (PREVIOUS_KEYS.has(event.key)) nextIndex = index === 0 ? lastIndex : index - 1;
    else if (NEXT_KEYS.has(event.key)) nextIndex = index === lastIndex ? 0 : index + 1;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = lastIndex;

    const next = nextIndex === undefined ? undefined : tabs[nextIndex];
    if (!next) return;

    event.preventDefault();
    onSelect(next.id);
    requestAnimationFrame(() => activeTab()?.focus());
  };

  return (
    <nav className={styles.bar} aria-label="Task lists">
      <div
        ref={listRef}
        className={styles.list}
        role="tablist"
        aria-label="Task lists"
        aria-orientation={vertical ? 'vertical' : 'horizontal'}
        onKeyDown={onKeyDown}
      >
        {tabs.map((tab) => {
          const selected = tab.id === activeId;
          return (
            <button
              key={tab.id}
              id={tabElementId(tab.id)}
              className={styles.tab}
              data-group={tab.group}
              type="button"
              role="tab"
              title={tab.fullLabel}
              aria-selected={selected}
              aria-controls={selected ? panelId : undefined}
              tabIndex={selected ? 0 : -1}
              onClick={() => onSelect(tab.id)}
            >
              {tab.icon && (
                <span className={styles.icon} aria-hidden="true">
                  {tab.icon}
                </span>
              )}
              <span className={styles.text}>
                <span className={styles.label}>{tab.label}</span>
                {vertical && tab.detail && <span className={styles.detail}> {tab.detail}</span>}
              </span>
              {tab.urgentCount > 0 && (
                <span className={styles.badge}>
                  {tab.urgentCount}
                  <span className="sr-only"> urgent</span>
                </span>
              )}
            </button>
          );
        })}
      </div>
      <button className={styles.add} type="button" onClick={onAddModule} title="Add module">
        <Plus size={18} aria-hidden="true" />
        <span className={styles.addLabel}>Add module</span>
      </button>
    </nav>
  );
}
