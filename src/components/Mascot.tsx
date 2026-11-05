import type { Mood } from '../types';
import styles from './Mascot.module.css';

/**
 * Palette for Shimekiri-chan: flat fills, one outline colour, no gradients, so she
 * reads clearly at around 64px. Kept here because nothing else in the app uses it.
 */
const LINE = '#3b2a2e';
const SKIN = '#fde6d2';
const HAIR = '#7a4a32';
const HIGHLIGHT = '#b98058';
const TEAL = '#5ec4b6';
const TEAL_DEEP = '#2f8f84';
const PINK = '#f7a8c0';
const PINK_DEEP = '#e0708f';
const CREAM = '#fff8ec';
const MOUTH = '#8a3550';

const outline = { stroke: LINE, strokeWidth: 2.5, strokeLinejoin: 'round', strokeLinecap: 'round' } as const;

/** Four-point sparkle centred on (x, y). */
function Sparkle({ x, y, size, fill }: { x: number; y: number; size: number; fill: string }) {
  const s = size;
  const t = size * 0.28;
  return (
    <path
      className={styles.sparkle}
      d={`M${x} ${y - s}L${x + t} ${y - t}L${x + s} ${y}L${x + t} ${y + t}L${x} ${y + s}L${x - t} ${y + t}L${x - s} ${y}L${x - t} ${y - t}Z`}
      fill={fill}
      stroke={LINE}
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  );
}

/** One big open eye: white, teal iris, pupil, a highlight and a thick lash line. */
function Eye({ cx, side, wide = false }: { cx: number; side: -1 | 1; wide?: boolean }) {
  // side: -1 for the eye on the viewer's left, so the lash flicks point outwards.
  const ry = wide ? 9.5 : 8;
  const iris = wide ? 4 : 5.2;
  return (
    <g>
      <ellipse cx={cx} cy="64" rx="7" ry={ry} fill="#fff" {...outline} strokeWidth="2" />
      <circle cx={cx} cy="65" r={iris} fill={TEAL_DEEP} />
      <circle cx={cx} cy="65" r={iris * 0.5} fill={LINE} />
      <circle cx={cx + 1.8} cy="62.6" r="1.8" fill="#fff" />
      {/* Lash line across the top, then two flicks at the outer corner. */}
      <path d={`M${cx - 7.5} ${64 - ry * 0.55}Q${cx} ${64 - ry - 3} ${cx + 7.5} ${64 - ry * 0.55}`} fill="none" {...outline} strokeWidth="3" />
      <path
        d={`M${cx + side * 7} ${64 - ry * 0.6}l${side * 3.5} -2.5M${cx + side * 5} ${64 - ry * 0.95}l${side * 2.5} -3`}
        fill="none"
        {...outline}
        strokeWidth="2"
      />
    </g>
  );
}

/** Only the brows, eyes, mouth and extras change between expressions. */
function Face({ mood }: { mood: Mood }) {
  if (mood === 'happy') {
    // Celebrating: a wink, a big grin and sparkles.
    return (
      <>
        <path d="M37 50q7-4 14-1M65 49q7-3 14 1" fill="none" {...outline} />
        <Eye cx={45} side={-1} />
        {/* Winking eye: a closed, upturned arc with a lash flick. */}
        <path d="M64 66q7-7 14 0M78 66l3-2" fill="none" {...outline} strokeWidth="3" />
        <path d="M48 81Q58 84 68 81Q66.5 95 58 95Q49.5 95 48 81Z" fill={MOUTH} {...outline} />
        <path d="M50 82.4Q58 84.8 66 82.4L65.4 85.6Q58 87.4 50.6 85.6Z" fill="#fff" />
        <ellipse cx="58" cy="91.5" rx="4.5" ry="2.4" fill={PINK_DEEP} />
        <Sparkle x={12} y={24} size={7} fill={PINK} />
        <Sparkle x={106} y={30} size={6} fill={TEAL} />
        <Sparkle x={104} y={98} size={5} fill={CREAM} />
      </>
    );
  }

  if (mood === 'nervous') {
    // Stressed: brows up in the middle, wide eyes, a gritted "ugh" and a sweat drop.
    return (
      <>
        <path d="M37 48q8 1 14-4M65 44q6 5 14 4" fill="none" {...outline} />
        <Eye cx={45} side={-1} wide />
        <Eye cx={71} side={1} wide />
        <rect x="50" y="83" width="16" height="7.5" rx="3.75" fill="#fff" {...outline} />
        <path d="M50.5 86.75h15M54.5 83.5v6.5M58 83.5v6.5M61.5 83.5v6.5" fill="none" stroke={LINE} strokeWidth="1.2" />
        <path className={styles.sweat} d="M97 40c4.5 6.5 6.5 9 6.5 12a6.5 6.5 0 0 1-13 0c0-3 2-5.5 6.5-12Z" fill="#c9f0ea" {...outline} strokeWidth="2" />
      </>
    );
  }

  // Relaxed: one brow raised, a lopsided smirk, a single sparkle.
  return (
    <>
      <path d="M37 50q7-4 14-1M65 45q7-5 14-1" fill="none" {...outline} />
      <g className={styles.blink}>
        <Eye cx={45} side={-1} />
        <Eye cx={71} side={1} />
      </g>
      <path d="M51 85q7 4 15-3" fill="none" {...outline} strokeWidth="2.8" />
      <path d="M66 82l2.2-1.4" fill="none" {...outline} strokeWidth="2.2" />
      <Sparkle x={104} y={28} size={5.5} fill={PINK} />
    </>
  );
}

/**
 * Shimekiri-chan, an original Y2K-inspired mascot: big lashed eyes, rosy cheeks and
 * voluminous brown hair with a butterfly clip. Flat colours and thick outlines keep
 * her readable at small sizes. The speech bubble carries the meaning; the face sets
 * the mood.
 */
export function Mascot({ mood, message }: { mood: Mood; message: string }) {
  return (
    <div className={styles.mascot} data-mood={mood}>
      <p className={styles.bubble} role="status">
        {message}
      </p>
      <svg className={styles.art} viewBox="-2 0 124 122" aria-hidden="true">
        <g className={styles.body}>
          {/* Big, rounded hair behind the face, flicking out at the ends. */}
          <path d="M12 64C4 36 22 6 58 6s54 30 46 58c4 16 2 30 12 38-10 4-22 0-28-8l-4-24H32l-4 24c-6 8-18 12-28 8 10-8 8-22 12-38Z" fill={HAIR} {...outline} />
          <path d="M16 68c-3 12-3 24-8 32 6 0 10-2 13-6-2-8-4-16-5-26ZM100 68c3 12 3 24 8 32-6 0-10-2-13-6 2-8 4-16 5-26Z" fill={HIGHLIGHT} />

          {/* Face. */}
          <path d="M28 58c0-20 14-30 30-30s30 10 30 30c0 24-14 42-30 42S28 82 28 58Z" fill={SKIN} {...outline} />

          {/* Swept fringe with chunky lighter highlights. */}
          <path d="M24 62C20 34 36 18 60 18s38 18 32 44c-4-12-12-22-24-24-2 6-8 9-14 8-8-1-16 2-22 8-4 3-6 6-8 8Z" fill={HAIR} {...outline} />
          <path d="M42 25c9-5 21-5 30-1-9 0-18 3-24 8ZM80 31c8 6 11 15 11 24-3-8-7-15-13-20Z" fill={HIGHLIGHT} />

          {/* Butterfly clip: the Y2K touch. */}
          <g transform="rotate(20 82 26)">
            <ellipse cx="77" cy="24" rx="5" ry="6" fill={TEAL} {...outline} strokeWidth="1.8" />
            <ellipse cx="87" cy="24" rx="5" ry="6" fill={TEAL} {...outline} strokeWidth="1.8" />
            <ellipse cx="78" cy="31" rx="3.4" ry="3.6" fill={PINK} {...outline} strokeWidth="1.6" />
            <ellipse cx="86" cy="31" rx="3.4" ry="3.6" fill={PINK} {...outline} strokeWidth="1.6" />
            <rect x="80.6" y="20" width="2.8" height="14" rx="1.4" fill={LINE} />
          </g>

          {/* Rosy cheeks and a small nose. */}
          <ellipse cx="38" cy="77" rx="6" ry="3.6" fill={PINK} />
          <ellipse cx="78" cy="77" rx="6" ry="3.6" fill={PINK} />
          <path d="M57 73q2 2 4 0" fill="none" {...outline} strokeWidth="1.8" />

          <Face mood={mood} />
        </g>
      </svg>
    </div>
  );
}
