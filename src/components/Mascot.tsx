import type { Mood } from '../types';
import styles from './Mascot.module.css';

const INK = 'var(--ink)';

/** Each mood only swaps the face and small extras, so the body stays one shared shape. */
function Face({ mood }: { mood: Mood }) {
  const stroke = { fill: 'none', stroke: INK, strokeWidth: 3, strokeLinecap: 'round' } as const;

  if (mood === 'happy') {
    return (
      <>
        <path d="M37 58q6-9 12 0M71 58q6-9 12 0" {...stroke} />
        <path d="M51 65h18q-1 12-9 12t-9-12Z" fill="var(--pink-700)" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        <path className={styles.sparkle} d="M10 22l3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" fill="var(--pink-300)" />
        <path className={styles.sparkle} d="M108 8l2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" fill="var(--teal-300)" />
      </>
    );
  }

  if (mood === 'nervous') {
    return (
      <>
        {/* Inner ends raised: worried, not cross. */}
        <path d="M36 49l11-4M84 49l-11-4" {...stroke} />
        <circle cx="43" cy="58" r="5.5" fill={INK} />
        <circle cx="77" cy="58" r="5.5" fill={INK} />
        <circle cx="45" cy="56" r="1.8" fill="#fff" />
        <circle cx="79" cy="56" r="1.8" fill="#fff" />
        <path d="M50 71q5-6 10 0t10 0" {...stroke} />
        <path className={styles.sweat} d="M101 28c5 7 7 10 7 13a7 7 0 0 1-14 0c0-3 2-6 7-13Z" fill="var(--teal-300)" stroke="var(--teal-700)" strokeWidth="1.5" />
      </>
    );
  }

  return (
    <>
      <path d="M37 56q6 6 12 0M71 56q6 6 12 0M54 68q6 5 12 0" {...stroke} />
      <text className={styles.snooze} x="94" y="30" fill="var(--teal-700)">z</text>
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
          <ellipse cx="44" cy="111" rx="9" ry="5" fill="var(--pink-300)" stroke={INK} strokeWidth="2.5" />
          <ellipse cx="76" cy="111" rx="9" ry="5" fill="var(--pink-300)" stroke={INK} strokeWidth="2.5" />
          <path
            d="M60 10c10 0 16 6 22 16l24 42c10 18 0 40-22 40H36C14 108 4 86 14 68l24-42c6-10 12-16 22-16Z"
            fill="#fff"
            stroke={INK}
            strokeWidth="3"
          />
          <path d="M42 107V88a4 4 0 0 1 4-4h28a4 4 0 0 1 4 4v19Z" fill="var(--teal-700)" />
          <circle cx="31" cy="68" r="6.5" fill="var(--pink-200)" />
          <circle cx="89" cy="68" r="6.5" fill="var(--pink-200)" />
          <Face mood={mood} />
        </g>
      </svg>
    </div>
  );
}
