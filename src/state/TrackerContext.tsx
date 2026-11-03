import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { HAPPY_DURATION_MS } from '../constants';
import { useToday } from '../hooks/useToday';
import { getMood } from '../lib/mood';
import { loadData, parseData, saveData, STORAGE_KEY } from '../lib/storage';
import type { AppData, Module, ModuleDraft, Mood, Task, TaskDraft } from '../types';
import { reducer } from './reducer';

export interface ToastMessage {
  id: string;
  message: string;
  undo?: () => void;
}

interface TrackerValue {
  data: AppData;
  today: string;
  mood: Mood;
  saveFailed: boolean;
  toast: ToastMessage | null;
  dismissToast: () => void;
  addTask: (draft: TaskDraft) => void;
  updateTask: (id: string, draft: TaskDraft) => void;
  /** Finishing a task offers Undo, because it moves out of sight into Completed. */
  toggleTask: (task: Task) => void;
  deleteTask: (task: Task) => void;
  addModule: (draft: ModuleDraft) => string;
  updateModule: (id: string, draft: ModuleDraft) => void;
  deleteModule: (module: Module) => void;
}

const TrackerContext = createContext<TrackerValue | null>(null);

/** Not crypto.randomUUID, which is unavailable on plain-http LAN URLs (phone testing). */
const createId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

/** Owns all saved data and the side effects around it: persistence, sync, toasts, mood. */
export function TrackerProvider({ children }: { children: ReactNode }) {
  const [data, dispatch] = useReducer(reducer, undefined, loadData);
  const today = useToday();
  const [saveFailed, setSaveFailed] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const celebrationTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setSaveFailed(!saveData(data));
  }, [data]);

  // Another browser tab saved: adopt its data so neither tab overwrites the other.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || event.newValue === null) return;
      const next = parseData(event.newValue);
      if (next) dispatch({ type: 'data/replace', data: next });
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => () => clearTimeout(celebrationTimer.current), []);

  const dismissToast = useCallback(() => setToast(null), []);

  const celebrate = useCallback(() => {
    clearTimeout(celebrationTimer.current);
    setCelebrating(true);
    celebrationTimer.current = setTimeout(() => setCelebrating(false), HAPPY_DURATION_MS);
  }, []);

  const value = useMemo<TrackerValue>(
    () => ({
      data,
      today,
      mood: getMood(data.tasks, today, celebrating),
      saveFailed,
      toast,
      dismissToast,
      addTask: (draft) => {
        const task: Task = {
          ...draft,
          id: createId(),
          completed: false,
          createdAt: new Date().toISOString(),
        };
        dispatch({ type: 'task/add', task });
      },
      updateTask: (id, draft) => dispatch({ type: 'task/update', id, draft }),
      toggleTask: (task) => {
        dispatch({ type: 'task/toggle', id: task.id });
        if (!task.completed) {
          celebrate();
          setToast({
            id: createId(),
            message: `Finished "${task.title}"`,
            undo: () => dispatch({ type: 'task/toggle', id: task.id }),
          });
        }
      },
      deleteTask: (task) => {
        dispatch({ type: 'task/delete', id: task.id });
        setToast({
          id: createId(),
          message: `Deleted "${task.title}"`,
          undo: () => dispatch({ type: 'task/restore', task }),
        });
      },
      addModule: (draft) => {
        const id = createId();
        dispatch({ type: 'module/add', module: { ...draft, id } });
        return id;
      },
      updateModule: (id, draft) => dispatch({ type: 'module/update', id, draft }),
      deleteModule: (module) => {
        dispatch({ type: 'module/delete', id: module.id });
        setToast({ id: createId(), message: `Deleted ${module.name}` });
      },
    }),
    [data, today, celebrating, saveFailed, toast, celebrate, dismissToast],
  );

  return <TrackerContext.Provider value={value}>{children}</TrackerContext.Provider>;
}

export function useTracker(): TrackerValue {
  const value = useContext(TrackerContext);
  if (!value) throw new Error('useTracker must be used inside TrackerProvider');
  return value;
}
