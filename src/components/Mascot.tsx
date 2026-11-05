import type { Mood } from '../types';
import styles from './Mascot.module.css';

/** Palette for Shimekiri-chan. Kept here because nothing else in the app uses it. */
const INK = '#26222e';
const HAIR = '#2b2733';
const SKIN = '#f8e3d7';
const SKIN_EDGE = '#e6c3b2';
const LIPS = '#b2536a';
const BLUSH = '#f1a5a8';
const GOLD = '#d2a54c';
const FRAME = '#2b2b33';

/** Lens centres. Eyes, brows and blush are placed relative to these. */
const LENSES = [44, 72] as const;
const EYE_Y = 65;

/** Big glossy eyes with a small flick of lashes at the outer corner. */
function Eyes({ blink = false }: { blink?: boolean }) {
  return (
    <g className={blink ? styles.blink : undefined}>
      {LENSES.map((cx, index) => {
        const outer = index === 0 ? -1 : 1;
        return (
          <g key={cx}>
            <circle cx={cx} cy={EYE_Y} r="6" fill={INK} />
            <circle cx={cx + 1.9} cy={EYE_Y - 2} r="1.9" fill="#fff" />
            <circle cx={cx - 1.6} cy={EYE_Y + 2} r="0.9" fill="#fff" />
            {/* Upper lash line, then the flick. */}
            <path
              d={`M${cx - 6} ${EYE_Y - 3}q6 -5 12 0m${outer === 1 ? 0 : -12} 0l${outer * 2.6} -2`}
              fill="none"
              stroke={INK}
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </g>
        );
      })}
    </g>
  );
}

/** Only the face changes with mood; hair, glasses and head stay put. */
function Face({ mood }: { mood: Mood }) {
  const line = { fill: 'none', stroke: INK, strokeLinecap: 'round' } as const;

  if (mood === 'happy') {
    return (
      <>
        <path d="M37 50q7-4 14-2M65 48q7-2 14 2" {...line} strokeWidth="1.8" />
        {/* Smiling eyes: closed arcs. */}
        <path d="M38 67q6-7 12 0M66 67q6-7 12 0" {...line} strokeWidth="2.4" />
        <path d="M51 83q7 9 14 0Z" fill={LIPS} stroke={LIPS} strokeWidth="1.5" strokeLinejoin="round" />
        <path className={styles.sparkle} d="M8 20l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5Z" fill={GOLD} />
        <path className={styles.sparkle} d="M106 92l2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill={GOLD} />
      </>
    );
  }

  if (mood === 'nervous') {
    return (
      <>
        {/* Inner ends raised: worried, not cross. */}
        <path d="M37 50q7 0 13-5M66 45q6 5 13 5" {...line} strokeWidth="1.8" />
        <Eyes />
        {/* A small round gasp. */}
        <ellipse cx="58" cy="86" rx="3" ry="3.6" fill="#8f3a4f" />
        <path className={styles.sweat} d="M15 40c4 6 6 8 6 11a6 6 0 0 1-12 0c0-3 2-5 6-11Z" fill="#d6e6f5" stroke="#8aa6c4" strokeWidth="1.3" />
      </>
    );
  }

  return (
    <>
      <path d="M37 50q7-4 14-2M65 48q7-2 14 2" {...line} strokeWidth="1.8" />
      <Eyes blink />
      {/* A soft closed smile. */}
      <path d="M53 84q5 4 10 0" fill="none" stroke={LIPS} strokeWidth="2.2" strokeLinecap="round" />
    </>
  );
}

/**
 * Shimekiri-chan, an original character: sleek dark hair in a high ponytail, round
 * glasses and gold studs. The speech bubble carries the meaning; the face sets the mood.
 */
export function Mascot({ mood, message }: { mood: Mood; message: string }) {
  return (
    <div className={styles.mascot} data-mood={mood}>
      <p className={styles.bubble} role="status">
        {message}
      </p>
      <svg className={styles.art} viewBox="-2 0 124 122" aria-hidden="true">
        <g className={styles.body}>
          {/* Ponytail first, so the head sits in front of it. It swings from the tie. */}
          <g className={styles.ponytail}>
            <path
              d="M84 24C98 8 120 14 116 38c-2 16-10 28-6 46-12-8-14-24-12-38 1-10-4-16-14-16Z"
              fill={HAIR}
            />
            <path d="M100 24c8 4 10 14 7 26" fill="none" stroke="#fff" strokeOpacity="0.16" strokeWidth="2.5" strokeLinecap="round" />
          </g>

          {/* Hair behind the face, pulled back smoothly. */}
          <path d="M20 62C18 34 36 16 58 16s40 18 38 46c0 10-3 18-6 22V58H26v26c-3-4-6-12-6-22Z" fill={HAIR} />

          {/* Ears with gold studs. */}
          <ellipse cx="25.5" cy="68" rx="4.2" ry="6.2" fill={SKIN} stroke={SKIN_EDGE} strokeWidth="1" />
          <ellipse cx="90.5" cy="68" rx="4.2" ry="6.2" fill={SKIN} stroke={SKIN_EDGE} strokeWidth="1" />
          <circle cx="25.5" cy="76" r="2.1" fill={GOLD} />
          <circle cx="90.5" cy="76" r="2.1" fill={GOLD} />

          {/* Face. */}
          <path d="M26 56c0 28 14 48 32 48s32-20 32-48c0-16-14-26-32-26S26 40 26 56Z" fill={SKIN} stroke={SKIN_EDGE} strokeWidth="1" />

          {/* Side part on her right, with the fringe swept across to the left temple. */}
          <path
            d="M25 60C22 36 38 21 60 21c20 0 33 13 31 33-5-10-11-16-19-18-12 6-28 10-38 14-4 2-7 5-9 10Z"
            fill={HAIR}
          />
          {/* Strands in the fringe and a soft shine on the crown. */}
          <path d="M70 38C60 43 47 46 37 51M64 34C54 38 42 41 32 47" fill="none" stroke="#45404f" strokeWidth="1" strokeLinecap="round" />
          <path d="M37 31q9-7 21-8" fill="none" stroke="#fff" strokeOpacity="0.16" strokeWidth="2.5" strokeLinecap="round" />

          {/* Scrunchie at the base of the ponytail, in the app's blue. */}
          <ellipse cx="88" cy="24" rx="6.5" ry="4.8" transform="rotate(-35 88 24)" fill="var(--blue-700)" />
          <path d="M84.5 22.5q3.5-3 7 0" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.3" strokeLinecap="round" />

          {/* Blush and a tiny nose. */}
          <ellipse cx="35" cy="79" rx="6" ry="3.4" fill={BLUSH} opacity="0.5" />
          <ellipse cx="81" cy="79" rx="6" ry="3.4" fill={BLUSH} opacity="0.5" />
          <path d="M58.5 72q1.8 3-1 4.2" fill="none" stroke="#d29f8c" strokeWidth="1.3" strokeLinecap="round" />

          <Face mood={mood} />

          {/* Round glasses over the eyes: thin frames, a faint lens tint. */}
          <g fill="none" stroke={FRAME} strokeWidth="1.6">
            {LENSES.map((cx) => (
              <circle key={cx} cx={cx} cy={EYE_Y} r="11.5" fill="#fff" fillOpacity="0.12" />
            ))}
            <path d="M55.5 63q2.5-2.5 5 0M32.5 62l-6-2M83.5 62l6-2" strokeLinecap="round" />
          </g>
        </g>
      </svg>
    </div>
  );
}
