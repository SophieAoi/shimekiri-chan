import { GENERAL_LIST_ID } from '../constants';
import type { AppData, Module, ModuleDraft, Task, TaskDraft } from '../types';

export type Action =
  | { type: 'task/add'; task: Task }
  | { type: 'task/update'; id: string; draft: TaskDraft }
  | { type: 'task/toggle'; id: string }
  | { type: 'task/delete'; id: string }
  | { type: 'task/restore'; task: Task }
  | { type: 'module/add'; module: Module }
  | { type: 'module/update'; id: string; draft: ModuleDraft }
  | { type: 'module/delete'; id: string }
  | { type: 'data/replace'; data: AppData };

/**
 * Pure state transitions. Ids and timestamps arrive inside the action because React
 * may run a reducer twice in Strict Mode, so it must not generate them itself.
 */
export function reducer(state: AppData, action: Action): AppData {
  const mapTask = (id: string, change: (task: Task) => Task) => ({
    ...state,
    tasks: state.tasks.map((task) => (task.id === id ? change(task) : task)),
  });

  switch (action.type) {
    case 'task/add':
    case 'task/restore': {
      // A restored task may belong to a module that has been deleted since.
      const { task } = action;
      const listExists =
        task.listId === GENERAL_LIST_ID || state.modules.some((m) => m.id === task.listId);
      const restored = listExists ? task : { ...task, listId: GENERAL_LIST_ID };
      return { ...state, tasks: [...state.tasks, restored] };
    }
    case 'task/update':
      return mapTask(action.id, (task) => ({ ...task, ...action.draft }));
    case 'task/toggle':
      return mapTask(action.id, (task) => ({ ...task, completed: !task.completed }));
    case 'task/delete':
      return { ...state, tasks: state.tasks.filter((task) => task.id !== action.id) };
    case 'module/add':
      return { ...state, modules: [...state.modules, action.module] };
    case 'module/update':
      return {
        ...state,
        modules: state.modules.map((module) =>
          module.id === action.id ? { ...module, ...action.draft } : module,
        ),
      };
    case 'module/delete':
      return {
        ...state,
        modules: state.modules.filter((module) => module.id !== action.id),
        tasks: state.tasks.filter((task) => task.listId !== action.id),
      };
    case 'data/replace':
      return action.data;
  }
}
