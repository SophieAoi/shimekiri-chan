import { BookOpen, FolderKanban, GraduationCap, type LucideIcon } from 'lucide-react';
import { TASK_TYPES } from '../constants';
import type { TaskType } from '../types';
import styles from './TypeTag.module.css';

const ICONS: Record<TaskType, LucideIcon> = {
  exam: GraduationCap,
  homework: BookOpen,
  coursework: FolderKanban,
};

export function TypeIcon({ type }: { type: TaskType }) {
  const Icon = ICONS[type];
  return <Icon size={14} strokeWidth={2.25} aria-hidden="true" />;
}

/** Coloured pill. The icon and word mean types stay distinct without relying on colour. */
export function TypeTag({ type }: { type: TaskType }) {
  const label = TASK_TYPES.find((meta) => meta.value === type)?.label;
  return (
    <span className={styles.tag} data-type={type}>
      <TypeIcon type={type} />
      {label}
    </span>
  );
}
