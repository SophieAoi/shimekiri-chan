import { Check, Circle, Pencil, Plus, Trash2 } from 'lucide-react';
import { useId, useState, type FormEvent } from 'react';
import { TITLE_MAX_LENGTH } from '../constants';
import { formatDate, isValidISODate } from '../lib/dates';
import { useTracker } from '../state/TrackerContext';
import type { Lecture, LectureCheck, Module } from '../types';
import { EmptyState } from './Panel';
import styles from './LecturePanel.module.css';

const CHECKS: readonly { check: LectureCheck; label: string }[] = [
  { check: 'attended', label: 'Attended' },
  { check: 'reviewed', label: 'Reviewed' },
];

/** Shared by the quick-add row and inline editing: a title and an optional date. */
function LectureFields({
  title,
  date,
  placeholder,
  onTitle,
  onDate,
}: {
  title: string;
  date: string;
  placeholder?: string;
  onTitle: (value: string) => void;
  onDate: (value: string) => void;
}) {
  const id = useId();
  return (
    <>
      <label className="sr-only" htmlFor={`${id}-title`}>
        Lecture title
      </label>
      <input
        id={`${id}-title`}
        className={`input ${styles.titleInput}`}
        value={title}
        placeholder={placeholder}
        maxLength={TITLE_MAX_LENGTH}
        onChange={(event) => onTitle(event.target.value)}
      />
      <label className="sr-only" htmlFor={`${id}-date`}>
        Lecture date (optional)
      </label>
      <input
        id={`${id}-date`}
        className={`input ${styles.dateInput}`}
        type="date"
        value={date}
        onChange={(event) => onDate(event.target.value)}
      />
    </>
  );
}

/** One lecture: its name and date, two one-tap checks, and edit and delete. */
function LectureRow({ lecture, number }: { lecture: Lecture; number: number }) {
  const { today, updateLecture, toggleLecture, deleteLecture } = useTracker();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(lecture.title);
  const [date, setDate] = useState(lecture.date);

  const save = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    updateLecture(lecture.id, { title: trimmed, date: isValidISODate(date) ? date : '' });
    setEditing(false);
  };

  if (editing) {
    return (
      <li className={styles.row}>
        <form className={styles.editForm} onSubmit={save}>
          <LectureFields title={title} date={date} onTitle={setTitle} onDate={setDate} />
          <div className={styles.editActions}>
            <button className="btn btn-ghost" type="button" onClick={() => setEditing(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" type="submit" disabled={!title.trim()}>
              Save
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className={styles.row} data-done={lecture.attended && lecture.reviewed}>
      <span className={styles.number} aria-hidden="true">
        {number}
      </span>
      <div className={styles.info}>
        <span className={styles.title}>{lecture.title}</span>
        {lecture.date && <span className={styles.date}>{formatDate(lecture.date, today)}</span>}
      </div>
      <div className={styles.checks}>
        {CHECKS.map(({ check, label }) => (
          <button
            key={check}
            className={styles.check}
            type="button"
            aria-pressed={lecture[check]}
            aria-label={`${label}: ${lecture.title}`}
            onClick={() => toggleLecture(lecture, check)}
          >
            {/* An empty circle until ticked, so it's clear these can be checked off. */}
            {lecture[check] ? (
              <Check size={14} strokeWidth={2.5} aria-hidden="true" />
            ) : (
              <Circle size={14} strokeWidth={2} aria-hidden="true" />
            )}
            {label}
          </button>
        ))}
      </div>
      <div className={styles.actions}>
        <button className="icon-btn" type="button" onClick={() => setEditing(true)} aria-label={`Edit "${lecture.title}"`} title="Edit lecture">
          <Pencil size={16} aria-hidden="true" />
        </button>
        <button className="icon-btn icon-btn-danger" type="button" onClick={() => deleteLecture(lecture)} aria-label={`Delete "${lecture.title}"`} title="Delete lecture">
          <Trash2 size={16} aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}

function Progress({ label, done, total }: { label: string; done: number; total: number }) {
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div className={styles.progress}>
      <div className={styles.progressText}>
        <span>{label}</span>
        <span>
          {done} of {total}
        </span>
      </div>
      <div className={styles.bar} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={total} aria-valuenow={done}>
        <span style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

/**
 * A module's lecture tracker: add lectures in one step, then tick off attending and
 * reviewing each one. Lectures stay in the order they were added, like a syllabus.
 */
export function LecturePanel({ module }: { module: Module }) {
  const { data, addLecture } = useTracker();
  const lectures = data.lectures.filter((lecture) => lecture.moduleId === module.id);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');

  // An empty title just uses the suggestion, so adding the next lecture is one click.
  const suggestion = `Lecture ${lectures.length + 1}`;

  const add = (event: FormEvent) => {
    event.preventDefault();
    addLecture(module.id, { title: title.trim() || suggestion, date: isValidISODate(date) ? date : '' });
    setTitle('');
    setDate('');
  };

  const count = (check: LectureCheck) => lectures.filter((lecture) => lecture[check]).length;

  return (
    <>
      <form className={styles.addForm} onSubmit={add}>
        <LectureFields title={title} date={date} placeholder={suggestion} onTitle={setTitle} onDate={setDate} />
        <button className="btn btn-primary" type="submit">
          <Plus size={18} aria-hidden="true" />
          Add lecture
        </button>
      </form>

      {lectures.length === 0 ? (
        <EmptyState>No lectures yet. Add your first one above.</EmptyState>
      ) : (
        <>
          <div className={styles.progressRow}>
            <Progress label="Attended" done={count('attended')} total={lectures.length} />
            <Progress label="Reviewed" done={count('reviewed')} total={lectures.length} />
          </div>
          <ul className={styles.list}>
            {lectures.map((lecture, index) => (
              <LectureRow key={lecture.id} lecture={lecture} number={index + 1} />
            ))}
          </ul>
        </>
      )}
    </>
  );
}

/** Header summary for the Lectures view. */
export function lectureSummary(lectures: readonly Lecture[]): string {
  if (lectures.length === 0) return 'No lectures yet';
  const reviewed = lectures.filter((lecture) => lecture.reviewed).length;
  const noun = lectures.length === 1 ? 'lecture' : 'lectures';
  return `${lectures.length} ${noun} · ${reviewed} reviewed`;
}
