import { useId, type ReactNode } from 'react';
import type { Mood } from '../types';
import styles from './Mascot.module.css';

/** Palette for Shimekiri-chan. Kept here because nothing else in the app uses it. */
const LINER = '#1d1418';
const HAIR = '#2a2126';
const HAIR_SHINE = '#5a4650';
const SKIN = '#f3d4c2';
const SKIN_EDGE = '#dfb19c';
const SHADOW = '#a7798d';
const IRIS = '#7a4f3a';
const LIP_TOP = '#ad3656';
const LIP_BOTTOM = '#c64a6c';
const LIP_LINE = '#7a2140';
const MOUTH = '#5a1f30';
const GOLD = '#c9a24a';
const GOLD_LIGHT = '#ead08a';

/** Everything on the face is drawn for her right side (viewer's left), then mirrored. */
const MIRROR = 'translate(116 0) scale(-1 1)';

function Mirrored({ children }: { children: ReactNode }) {
  return (
    <>
      <g>{children}</g>
      <g transform={MIRROR}>{children}</g>
    </>
  );
}

/** Almond doll eye: smoky lid, big iris, winged liner and a few long lashes. */
function OpenEye({ clipId }: { clipId: string }) {
  return (
    <>
      <path d="M28 62Q42 43 57.5 58Q43 51 28 62Z" fill={SHADOW} opacity="0.55" />
      <path d="M31 63.5Q42 51 55 61.5Q44 72 31 63.5Z" fill="#fff" />
      <g clipPath={`url(#${clipId})`}>
        <circle cx="43.5" cy="62.5" r="6.8" fill={IRIS} />
        <circle cx="43.5" cy="62.5" r="3.1" fill={LINER} />
        <circle cx="46" cy="60" r="2" fill="#fff" />
        <circle cx="41.2" cy="65.2" r="0.9" fill="#fff" />
      </g>
      <path d="M33 65.6Q44 71.5 54 62.6" fill="none" stroke="#7d5a63" strokeWidth="0.8" />
      <Lashes />
    </>
  );
}

/** Upper liner with a wing and lashes, shared by open and smiling eyes. */
function Lashes({ d = 'M30 63Q42 50.5 55.6 61.6' }: { d?: string }) {
  return (
    <g fill="none" stroke={LINER} strokeLinecap="round">
      <path d={d} strokeWidth="2.6" />
      <path d="M31 62.9L24.2 58.6" strokeWidth="2.2" />
      <path d="M32.6 60.4l-3.6-3.6M35.8 57.6l-2.4-4.4M39.4 55.8l-1.1-4.6" strokeWidth="1.4" />
    </g>
  );
}

/** Only the eyes, brows and mouth change with mood. */
function Face({ mood, clipId }: { mood: Mood; clipId: string }) {
  const brow = { fill: 'none', stroke: HAIR, strokeWidth: 2.4, strokeLinecap: 'round' } as const;

  if (mood === 'happy') {
    return (
      <>
        <Mirrored>
          <path d="M30 50Q40 42 52 47" {...brow} />
          <path d="M28 62Q42 43 57.5 58Q43 51 28 62Z" fill={SHADOW} opacity="0.55" />
          {/* Smiling eyes: an upturned lash line. */}
          <Lashes d="M32 64Q43 55 54.5 63" />
        </Mirrored>
        {/* Open smile with a row of teeth. */}
        <path d="M47 85Q58 89 69 85Q66 97 58 97Q50 97 47 85Z" fill={MOUTH} stroke={LIP_BOTTOM} strokeWidth="2.6" strokeLinejoin="round" />
        <path d="M49.5 86.4Q58 89.6 66.5 86.4L65.6 88.8Q58 91 50.4 88.8Z" fill="#fff" />
        <path className={styles.sparkle} d="M8 18l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5Z" fill={GOLD} />
        <path className={styles.sparkle} d="M104 98l2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill={GOLD} />
      </>
    );
  }

  if (mood === 'nervous') {
    return (
      <>
        <Mirrored>
          {/* Inner ends raised: worried, not cross. */}
          <path d="M30 49Q42 48 51 43" {...brow} />
          <OpenEye clipId={clipId} />
        </Mirrored>
        {/* Glossy lips parted in a little gasp. */}
        <ellipse cx="58" cy="88" rx="5" ry="4.6" fill={LIP_BOTTOM} />
        <ellipse cx="58" cy="88.2" rx="2.6" ry="2.4" fill={MOUTH} />
        <path className={styles.sweat} d="M13 34c4 6 6 8 6 11a6 6 0 0 1-12 0c0-3 2-5 6-11Z" fill="#d6e6f5" stroke="#8aa6c4" strokeWidth="1.3" />
      </>
    );
  }

  return (
    <>
      <Mirrored>
        <path d="M30 50Q40 43 52 48" {...brow} />
        <g className={styles.blink}>
          <OpenEye clipId={clipId} />
        </g>
      </Mirrored>
      {/* Full glossy lips: a cupid's bow on top, a fuller lower lip, a highlight. */}
      <path d="M47.5 86Q52.5 80.5 56.5 82.8Q58 83.8 59.5 82.8Q63.5 80.5 68.5 86Q58 87.6 47.5 86Z" fill={LIP_TOP} />
      <path d="M47.5 86Q58 87.6 68.5 86Q65 94.5 58 94.5Q51 94.5 47.5 86Z" fill={LIP_BOTTOM} />
      <path d="M48 86Q58 88 68 86" fill="none" stroke={LIP_LINE} strokeWidth="0.9" strokeLinecap="round" />
      <ellipse cx="60.5" cy="90.4" rx="3.6" ry="1.2" fill="#fff" opacity="0.55" />
    </>
  );
}

/**
 * Shimekiri-chan, an original fashion-doll style character: a sleek high ponytail,
 * oversized gold glasses and hoops. The speech bubble carries the meaning; the face
 * sets the mood.
 */
export function Mascot({ mood, message }: { mood: Mood; message: string }) {
  // The eye clip needs an id that is unique on the page.
  const clipId = `${useId().replace(/:/g, '')}-eye`;

  return (
    <div className={styles.mascot} data-mood={mood}>
      <p className={styles.bubble} role="status">
        {message}
      </p>
      <svg className={styles.art} viewBox="-2 0 124 122" aria-hidden="true">
        <defs>
          {/* Keeps the iris inside the eye. Mirrored along with the eye it clips. */}
          <clipPath id={clipId}>
            <path d="M31 63.5Q42 51 55 61.5Q44 72 31 63.5Z" />
          </clipPath>
        </defs>

        <g className={styles.body}>
          {/* High ponytail behind the head, swinging from the cuff. */}
          <g className={styles.ponytail}>
            <path d="M80 20C96 2 124 8 120 36c-2 18-12 30-6 54-16-10-18-30-16-46 1-12-6-20-18-18Z" fill={HAIR} />
            <path d="M104 16c10 6 12 18 8 32" fill="none" stroke={HAIR_SHINE} strokeWidth="2.5" strokeLinecap="round" />
          </g>

          {/* Hair behind the face. */}
          <path d="M18 58C14 30 34 12 58 12s44 18 40 46c0 10-3 18-6 24L90 56H26l-2 26c-3-6-6-14-6-24Z" fill={HAIR} />

          {/* Face: a wide brow narrowing to a small, pointed chin. */}
          <path d="M24 54C24 34 40 26 58 26s34 8 34 28c0 22-14 44-34 50C38 98 24 76 24 54Z" fill={SKIN} stroke={SKIN_EDGE} strokeWidth="1" />

          {/* Slicked-back hairline with face-framing strands. */}
          <path d="M22 60C20 34 36 18 58 18s38 16 36 42c-2-12-8-22-20-26-6-2-12-3-16-1-4-2-10-1-16 1-12 4-18 14-20 26Z" fill={HAIR} />
          <Mirrored>
            <path d="M28 42c-6 14-4 34 3 46-3-12-3-28 1-40Z" fill={HAIR} />
          </Mirrored>
          <path d="M36 26q12-8 24-7" fill="none" stroke={HAIR_SHINE} strokeWidth="2.5" strokeLinecap="round" />

          {/* Gold cuff at the base of the ponytail. */}
          <rect x="78" y="17.5" width="12" height="7" rx="3" transform="rotate(-40 84 21)" fill={GOLD} />
          <path d="M80.5 21.5l6-5" stroke={GOLD_LIGHT} strokeWidth="1.2" strokeLinecap="round" />

          {/* Gold hoops below the strands. */}
          <Mirrored>
            <circle cx="27" cy="82" r="5.5" fill="none" stroke={GOLD} strokeWidth="1.8" />
          </Mirrored>

          {/* Contour blush, a tiny nose and a beauty mark. */}
          <Mirrored>
            <ellipse cx="34" cy="78" rx="7" ry="3.4" fill="#e58e98" opacity="0.35" />
          </Mirrored>
          <path d="M56 76.5q2 1.6 4 0" fill="none" stroke="#c48a77" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="71" cy="81" r="0.9" fill="#4a2f2f" />

          <Face mood={mood} clipId={clipId} />

          {/* Oversized thin gold frames with a slight cat-eye lift. */}
          <Mirrored>
            <g fill="none" stroke={GOLD} strokeWidth="1.3" strokeLinecap="round">
              <rect x="29" y="52" width="27.5" height="21" rx="9" fill="#fff" fillOpacity="0.08" />
              <path d="M29.6 56.5l-2.4-3.2M29 61l-5-2" />
            </g>
          </Mirrored>
          <path d="M56.5 60q1.5-2 3 0" fill="none" stroke={GOLD} strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}
