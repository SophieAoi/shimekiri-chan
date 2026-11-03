import { useCallback, useEffect, useState } from 'react';
import { UPCOMING_TAB_ID } from '../constants';

const PREFS_KEY = 'shimekiri:prefs';

interface Prefs {
  activeTabId: string;
  /** Collapsed sections, stored as sectionKey(listId, type). */
  collapsed: string[];
}

export const sectionKey = (listId: string, type: string) => `${listId}:${type}`;

function loadPrefs(): Prefs {
  const fallback: Prefs = { activeTabId: UPCOMING_TAB_ID, collapsed: [] };
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(PREFS_KEY) ?? 'null');
    if (typeof saved !== 'object' || saved === null) return fallback;

    const { activeTabId, collapsed } = saved as Partial<Prefs>;
    return {
      activeTabId: typeof activeTabId === 'string' ? activeTabId : fallback.activeTabId,
      collapsed: Array.isArray(collapsed) ? collapsed.filter((k) => typeof k === 'string') : [],
    };
  } catch {
    return fallback;
  }
}

/** View preferences, kept apart from task data because losing them does no harm. */
export function usePrefs() {
  const [prefs, setPrefs] = useState(loadPrefs);

  useEffect(() => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch {
      // Not worth bothering anyone about: the app just opens on its default view.
    }
  }, [prefs]);

  const setActiveTab = useCallback((activeTabId: string) => {
    setPrefs((current) => ({ ...current, activeTabId }));
  }, []);

  const toggleSection = useCallback((key: string) => {
    setPrefs((current) => ({
      ...current,
      collapsed: current.collapsed.includes(key)
        ? current.collapsed.filter((item) => item !== key)
        : [...current.collapsed, key],
    }));
  }, []);

  return { ...prefs, setActiveTab, toggleSection };
}
