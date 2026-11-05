import type { Mood } from '../types';
import styles from './Mascot.module.css';

const INK = 'var(--ink)';

/** Big glossy eyes: a dark circle with two white highlights, the classic "cute" recipe. */
function Eyes({ blink = false }: { blink?: boolean }) {
  return (
    <g className={blink ? styles.blink : undefined}>
      {[42, 78].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="63" r="8.5" fill={INK} />
          <circle cx={cx + 2.6} cy="59" r="3.2" fill="#fff" />
          <circle cx={cx - 3} cy="67.5" r="1.5" fill="#fff" />
        </g>
      ))}
    </g>
  );
}

/** Each mood only swaps the face and small extras, so the body stays one shared shape. */
function Face({ mood }: { mood: Mood }) {
  const stroke = { fill: 'none', stroke: INK, strokeWidth: 3, strokeLinecap: 'round' } as const;

  if (mood === 'happy') {
    return (
      <>
        <path d="M33 66q9-14 18 0M69 66q9-14 18 0" {...stroke} strokeWidth="3.5" />
        <path d="M53 72h14q-1 10-7 10t-7-10Z" fill="var(--indigo-700)" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        <path className={styles.sparkle} d="M10 22l3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" fill="var(--indigo-300)" />
        <path className={styles.sparkle} d="M108 8l2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" fill="var(--blue-300)" />
      </>
    );
  }

  if (mood === 'nervous') {
    return (
      <>
        {/* Inner ends raised: worried, not cross. */}
        <path d="M33 50l10-4M87 50l-10-4" {...stroke} strokeWidth="2.5" />
        <Eyes />
        {/* A round "gasp" mouth. */}
        <circle cx="60" cy="78" r="4.5" fill="var(--indigo-700)" stroke={INK} strokeWidth="2.5" />
        <path className={styles.sweat} d="M101 28c5 7 7 10 7 13a7 7 0 0 1-14 0c0-3 2-6 7-13Z" fill="var(--blue-300)" stroke="var(--blue-700)" strokeWidth="1.5" />
      </>
    );
  }

  return (
    <>
      <Eyes blink />
      {/* A small round "o" mouth. */}
      <circle cx="60" cy="77" r="2.8" fill="var(--indigo-700)" stroke={INK} strokeWidth="2" />
    </>
  );
}

/** Shimekiri-chan, an original onigiri mascot. The speech bubble carries the meaning. */
export function Mascot({ mood, message }: { mood: Mood; message: string }) {
  return (
    <div className={styles.mascot} data-mood={mood}>
      <p className={styles.bubble} role="status">
        {message}
      </p>
      <svg className={styles.art} viewBox="-2 0 124 122" aria-hidden="true">
        <g className={styles.body}>
          <ellipse cx="44" cy="111" rx="9" ry="5" fill="var(--indigo-300)" stroke={INK} strokeWidth="2.5" />
          <ellipse cx="76" cy="111" rx="9" ry="5" fill="var(--indigo-300)" stroke={INK} strokeWidth="2.5" />
          <path
            d="M60 10c10 0 16 6 22 16l24 42c10 18 0 40-22 40H36C14 108 4 86 14 68l24-42c6-10 12-16 22-16Z"
            fill="#fff"
            stroke={INK}
            strokeWidth="3"
          />
          <path d="M42 107V88a4 4 0 0 1 4-4h28a4 4 0 0 1 4 4v19Z" fill="var(--blue-700)" />
          <circle cx="28" cy="75" r="7" fill="var(--indigo-200)" />
          <circle cx="92" cy="75" r="7" fill="var(--indigo-200)" />
          <Face mood={mood} />
        </g>
      </svg>
    </div>
  );
}
