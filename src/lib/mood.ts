import type { Mood, Task } from '../types';
import { isUrgent } from './tasks';

/** A fresh celebration beats everything, then any close deadline makes the mascot nervous. */
export function getMood(tasks: readonly Task[], today: string, celebrating: boolean): Mood {
  if (celebrating) return 'happy';
  return tasks.some((task) => isUrgent(task, today)) ? 'nervous' : 'relaxed';
}

export function getMoodMessage(mood: Mood, urgentCount: number): string {
  if (mood === 'happy') return 'Yay, one down! Well done!';
  if (mood === 'relaxed') return 'Nothing due soon. Tea time~';
  return urgentCount === 1 ? 'Eep! 1 deadline is close!' : `Eep! ${urgentCount} deadlines are close!`;
}
