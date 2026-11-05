import { ChevronDown, Layers, Plus, type LucideIcon } from 'lucide-react';
import { useEffect, useRef, type KeyboardEvent } from 'react';
import styles from './Tabs.module.css';

export interface TabItem {
  id: string;
  label: string;
  /** Decorative line icon shown before the label. Hidden from screen readers. */
  icon?: LucideIcon;
  /** Second line shown in the sidebar, e.g. the module name under its code. */
  detail?: string;
  fullLabel: string;
  /** Unfinished tasks in this tab, shown as the badge number. */
  openCount: number;
  /** How many of those are urgent. Any at all turns the badge red. */
  urgentCount: number;
  /** Fixed tabs (Upcoming, General) are listed apart from modules. */
  group: 'fixed' | 'module';
}

interface TabsProps {
  tabs: TabItem[];
  activeId: string;
  panelId: string;
  /** True in the sidebar layout: tabs stack, show detail, and modules can fold away. */
  vertical: boolean;
  modulesCollapsed: boolean;
  onToggleModules: () => void;
  onSelect: (id: string) => void;
  onAddModule: () => void;
}

export const tabElementId = (id: string) => `tab-${id}`;
const MODULE_LIST_ID = 'module-tabs';

const PREVIOUS_KEYS = new Set(['ArrowLeft', 'ArrowUp']);
const NEXT_KEYS = new Set(['ArrowRight', 'ArrowDown']);

/** Number badge: green when nothing is urgent, red otherwise. */
function CountBadge({ id, openCount, urgentCount }: { id: string; openCount: number; urgentCount: number }) {
  if (openCount === 0) return null;
  return (
    <>
      <span className={styles.badge} data-urgent={urgentCount > 0} aria-hidden="true">
        {openCount}
      </span>
      {/* Read as a description, so the control's name stays just its label. */}
      <span id={id} hidden>
        {urgentCount > 0 ? `${openCount} to do, ${urgentCount} urgent` : `${openCount} to do`}
      </span>
    </>
  );
}

/**
 * Two ARIA tablists (fixed views, then modules) that behave as one: arrow keys move
 * across both, and only one tab at a time is in the Tab order.
 */
export function Tabs(props: TabsProps) {
  const { tabs, activeId, panelId, vertical, modulesCollapsed, onToggleModules, onSelect, onAddModule } = props;
  const navRef = useRef<HTMLElement>(null);

  const fixed = tabs.filter((tab) => tab.group === 'fixed');
  const modules = tabs.filter((tab) => tab.group === 'module');
  const hideModules = vertical && modulesCollapsed;
  const reachable = hideModules ? fixed : tabs;
  // If the open tab is folded away, the first visible tab keeps keyboard access.
  const focusableId = reachable.some((tab) => tab.id === activeId) ? activeId : reachable[0]?.id;
  const activeModuleHidden = hideModules && modules.some((tab) => tab.id === activeId);

  const selectedTab = () => navRef.current?.querySelector<HTMLElement>('[aria-selected="true"]');

  // The tab list can scroll, so keep the selected tab visible.
  useEffect(() => {
    selectedTab()?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [activeId]);

  const onKeyDown = (event: KeyboardEvent) => {
    if ((event.target as HTMLElement).getAttribute('role') !== 'tab') return;
    const index = reachable.findIndex((tab) => tab.id === activeId);
    const lastIndex = reachable.length - 1;
    let nextIndex: number | undefined;

    // Both arrow pairs work in either layout, so nobody has to know which is active.
    if (PREVIOUS_KEYS.has(event.key)) nextIndex = index <= 0 ? lastIndex : index - 1;
    else if (NEXT_KEYS.has(event.key)) nextIndex = index === lastIndex ? 0 : index + 1;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = lastIndex;

    const next = nextIndex === undefined ? undefined : reachable[nextIndex];
    if (!next) return;

    event.preventDefault();
    onSelect(next.id);
    requestAnimationFrame(() => selectedTab()?.focus());
  };

  const renderTab = (tab: TabItem) => {
    const selected = tab.id === activeId;
    const countId = `${tabElementId(tab.id)}-count`;
    return (
      <button
        key={tab.id}
        id={tabElementId(tab.id)}
        className={styles.tab}
        type="button"
        role="tab"
        title={tab.fullLabel}
        aria-selected={selected}
        aria-controls={selected ? panelId : undefined}
        aria-describedby={tab.openCount > 0 ? countId : undefined}
        tabIndex={tab.id === focusableId ? 0 : -1}
        onClick={() => onSelect(tab.id)}
      >
        {tab.icon && <tab.icon className={styles.icon} size={18} strokeWidth={1.75} aria-hidden="true" />}
        <span className={styles.text}>
          <span className={styles.label}>{tab.label}</span>
          {vertical && tab.detail && <span className={styles.detail}> {tab.detail}</span>}
        </span>
        <CountBadge id={countId} openCount={tab.openCount} urgentCount={tab.urgentCount} />
      </button>
    );
  };

  const orientation = vertical ? 'vertical' : 'horizontal';
  const sum = (key: 'openCount' | 'urgentCount') => modules.reduce((total, tab) => total + tab[key], 0);

  return (
    <nav ref={navRef} className={styles.bar} aria-label="Task lists" onKeyDown={onKeyDown}>
      <div className={styles.lists}>
        <div className={styles.list} role="tablist" aria-label="Views" aria-orientation={orientation}>
          {fixed.map(renderTab)}
        </div>

        {vertical && (
          <div className={styles.groupHeader} data-active={activeModuleHidden}>
            <button
              className={styles.groupToggle}
              type="button"
              aria-expanded={!modulesCollapsed}
              aria-controls={MODULE_LIST_ID}
              aria-describedby={modulesCollapsed ? 'module-tabs-count' : undefined}
              onClick={onToggleModules}
            >
              <Layers className={styles.icon} size={18} strokeWidth={1.75} aria-hidden="true" />
              <span className={styles.groupLabel}>Modules</span>
              {/* Sits beside the label, so the badge lines up with the tabs' badges. */}
              <ChevronDown className={styles.chevron} size={16} aria-hidden="true" />
              {/* Folded modules still report their total, so a deadline can't hide. */}
              {modulesCollapsed && (
                <CountBadge id="module-tabs-count" openCount={sum('openCount')} urgentCount={sum('urgentCount')} />
              )}
            </button>
          </div>
        )}

        {modules.length > 0 && (
          <div
            id={MODULE_LIST_ID}
            className={styles.list}
            role="tablist"
            aria-label="Modules"
            aria-orientation={orientation}
            hidden={hideModules}
          >
            {modules.map(renderTab)}
          </div>
        )}

        {/* Outside the tablist, which may only hold tabs. Shown even while folded. */}
        {vertical && (
          <button className={styles.addRow} type="button" onClick={onAddModule}>
            <Plus className={styles.icon} size={18} strokeWidth={1.75} aria-hidden="true" />
            Add module
          </button>
        )}
      </div>

      {!vertical && (
        <button className={styles.add} type="button" onClick={onAddModule} aria-label="Add module" title="Add module">
          <Plus size={18} aria-hidden="true" />
        </button>
      )}
    </nav>
  );
}
