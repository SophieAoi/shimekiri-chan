import type { AppData } from '../types';

/** First-run data. Only used when nothing has been saved yet. */
export function createSeedData(): AppData {
  return {
    version: 1,
    modules: [
      { id: 'seed-comp3040', code: 'COMP3040', name: 'Mobile Device Programming' },
      { id: 'seed-comp3041', code: 'COMP3041', name: 'Professional Ethics' },
      { id: 'seed-comp3070', code: 'COMP3070', name: 'Symbolic AI' },
      { id: 'seed-mpu3142mc', code: 'MPU 3142MC', name: 'Malay Communication II' },
      { id: 'seed-fyp', code: '', name: 'Final Year Project' },
    ],
    tasks: [],
  };
}
