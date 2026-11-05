import { useId, type ReactNode } from 'react';
import type { Mood } from '../types';
import styles from './Mascot.module.css';

/** Palette for Shimekiri-chan. Kept here because nothing else in the app uses it. */
const LINER = '#22150f';
const BROW = '#6e4632';
const LID = '#eedbe9';
const CREASE = '#a07466';
const MOUTH = '#5a2232';
const LIP_EDGE = '#7d3a50';
const GOLD = '#c9a24a';
const GOLD_LIGHT = '#ead08a';
const HAIR_SHINE = '#9a6c4e';

/** Everything on the face is drawn for her right side (viewer's left), then mirrored. */
const MIRROR = 'translate(116 0) scale(-1 1)';

/** Eye opening, shared by the white, its clip and the lid shading. */
const EYE = 'M31 63.5Q42 51 55 61.5Q44 72 31 63.5Z';

function Mirrored({ children }: { children: ReactNode }) {
  return (
    <>
      <g>{children}</g>
      <g transform={MIRROR}>{children}</g>
    </>
  );
}

interface Ids {
  skin: string;
  hair: string;
  iris: string;
  lipTop: string;
  lipBottom: string;
  eye: string;
}

/** Pale shimmery lid and a soft crease, as on a fashion doll. */
function Lid() {
  return (
    <>
      <path d="M29 60.5Q42 45 57 57Q43 51.5 29 60.5Z" fill={LID} />
      <path d="M31 57Q43 47.5 55 55" fill="none" stroke={CREASE} strokeWidth="0.8" opacity="0.6" />
    </>
  );
}

/** Upper liner with a wing and fine lashes, shared by open and smiling eyes. */
function Lashes({ d = 'M30 63Q42 50.5 55.6 61.6' }: { d?: string }) {
  return (
    <g fill="none" stroke={LINER} strokeLinecap="round">
      <path d={d} strokeWidth="2.2" />
      <path d="M31 62.9L24.6 59" strokeWidth="1.8" />
      <path d="M32.6 60.4l-3.4-3.4M35.8 57.6l-2.2-4.2M39.4 55.8l-1-4.4M43 55.2l-0.4-4" strokeWidth="1.1" />
    </g>
  );
}

/** Almond eye with a glowing amber iris. */
function OpenEye({ ids }: { ids: Ids }) {
  return (
    <>
      <Lid />
      <path d={EYE} fill="#fbf7f5" />
      <g clipPath={`url(#${ids.eye})`}>
        <circle cx="43.5" cy="62.5" r="6.8" fill={`url(#${ids.iris})`} />
        <circle cx="43.5" cy="62.5" r="3" fill="#1a100c" />
        <circle cx="46" cy="60" r="2" fill="#fff" />
        <circle cx="41.2" cy="65.2" r="0.9" fill="#fff" opacity="0.8" />
        {/* The lid casts a little shadow on the top of the eye. */}
        <path d="M30 60Q42 50 56 59V56H30Z" fill="#000" opacity="0.08" />
      </g>
      <path d="M33 65.6Q44 71.5 54 62.6" fill="none" stroke="#8a6458" strokeWidth="0.7" />
      <Lashes />
    </>
  );
}

/** The signature pout: a small, very full mouth with a strong gloss. */
function Pout({ ids }: { ids: Ids }) {
  return (
    // Scaled up around the mouth's centre: the pout is the signature feature.
    <g transform="translate(58 88) scale(1.18) translate(-58 -88)">
      <path d="M49 85Q53 80 56.6 82Q58 82.8 59.4 82Q63 80 67 85Q58 86.6 49 85Z" fill={`url(#${ids.lipTop})`} />
      <path d="M49 85Q58 86.6 67 85Q66 93.5 58 94Q50 93.5 49 85Z" fill={`url(#${ids.lipBottom})`} />
      <path d="M49.5 85.2Q58 87 66.5 85.2" fill="none" stroke={LIP_EDGE} strokeWidth="0.8" strokeLinecap="round" />
      <ellipse cx="58.6" cy="89.4" rx="4.4" ry="1.8" fill="#fff" opacity="0.6" />
      <ellipse cx="55" cy="83.3" rx="1.7" ry="0.6" fill="#fff" opacity="0.5" />
    </g>
  );
}

/** Only the eyes, brows and mouth change with mood. */
function Face({ mood, ids }: { mood: Mood; ids: Ids }) {
  const brow = { fill: 'none', stroke: BROW, strokeWidth: 1.8, strokeLinecap: 'round' } as const;

  if (mood === 'happy') {
    return (
      <>
        <Mirrored>
          <path d="M30 47.5Q40 40.5 52 44.5" {...brow} />
          <Lid />
          {/* Smiling eyes: an upturned lash line. */}
          <Lashes d="M32 64Q43 55 54.5 63" />
        </Mirrored>
        {/* Open smile in the same glossy mauve. */}
        <path d="M48 85Q58 88.5 68 85Q65.5 96 58 96Q50.5 96 48 85Z" fill={MOUTH} stroke={`url(#${ids.lipBottom})`} strokeWidth="2.8" strokeLinejoin="round" />
        <path d="M50.4 86.3Q58 89.2 65.6 86.3L64.8 88.6Q58 90.6 51.2 88.6Z" fill="#fff" />
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
          <path d="M30 47.5Q42 47 51 42" {...brow} />
          <OpenEye ids={ids} />
        </Mirrored>
        {/* Glossy lips parted in a little gasp. */}
        <ellipse cx="58" cy="88" rx="5.2" ry="4.8" fill={`url(#${ids.lipBottom})`} />
        <ellipse cx="58" cy="88.3" rx="2.6" ry="2.4" fill={MOUTH} />
        <ellipse cx="59.5" cy="85" rx="1.6" ry="0.6" fill="#fff" opacity="0.55" />
        <path className={styles.sweat} d="M13 34c4 6 6 8 6 11a6 6 0 0 1-12 0c0-3 2-5 6-11Z" fill="#d6e6f5" stroke="#8aa6c4" strokeWidth="1.3" />
      </>
    );
  }

  return (
    <>
      <Mirrored>
        <path d="M30 48Q40 41 52 45" {...brow} />
        <g className={styles.blink}>
          <OpenEye ids={ids} />
        </g>
      </Mirrored>
      <Pout ids={ids} />
    </>
  );
}

/**
 * Shimekiri-chan, an original fashion-doll style character with soft, shaded
 * rendering: glossy brown hair in a high ponytail, amber eyes, a mauve pout and gold
 * glasses. The speech bubble carries the meaning; the face sets the mood.
 */
export function Mascot({ mood, message }: { mood: Mood; message: string }) {
  // Gradient and clip ids must be unique on the page.
  const base = useId().replace(/:/g, '');
  const ids: Ids = {
    skin: `${base}-skin`,
    hair: `${base}-hair`,
    iris: `${base}-iris`,
    lipTop: `${base}-lip-top`,
    lipBottom: `${base}-lip-bottom`,
    eye: `${base}-eye`,
  };

  return (
    <div className={styles.mascot} data-mood={mood}>
      <p className={styles.bubble} role="status">
        {message}
      </p>
      <svg className={styles.art} viewBox="-2 0 124 122" aria-hidden="true">
        <defs>
          {/* Warm tan skin, lit from the front and shading towards the edges. */}
          <radialGradient id={ids.skin} cx="0.47" cy="0.42" r="0.68">
            <stop offset="0" stopColor="#e9bd9c" />
            <stop offset="0.65" stopColor="#dba582" />
            <stop offset="1" stopColor="#c48765" />
          </radialGradient>
          <linearGradient id={ids.hair} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6e4a33" />
            <stop offset="0.55" stopColor="#4d3122" />
            <stop offset="1" stopColor="#3a241a" />
          </linearGradient>
          <radialGradient id={ids.iris} cx="0.5" cy="0.6" r="0.6">
            <stop offset="0" stopColor="#c58b45" />
            <stop offset="0.6" stopColor="#94602c" />
            <stop offset="1" stopColor="#5c3a1c" />
          </radialGradient>
          <linearGradient id={ids.lipTop} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9e5a70" />
            <stop offset="1" stopColor="#874a5f" />
          </linearGradient>
          <linearGradient id={ids.lipBottom} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#b8778c" />
            <stop offset="1" stopColor="#934f65" />
          </linearGradient>
          {/* Keeps the iris inside the eye. Mirrored along with the eye it clips. */}
          <clipPath id={ids.eye}>
            <path d={EYE} />
          </clipPath>
        </defs>

        <g className={styles.body}>
          {/* High ponytail behind the head, swinging from the cuff. */}
          <g className={styles.ponytail}>
            <path d="M80 20C96 2 124 8 120 36c-2 18-12 30-6 54-16-10-18-30-16-46 1-12-6-20-18-18Z" fill={`url(#${ids.hair})`} />
            <path d="M104 16c10 6 12 18 8 32M110 40c-1 14-4 24-1 38" fill="none" stroke={HAIR_SHINE} strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
          </g>

          {/* Hair behind the face. */}
          <path d="M18 58C14 30 34 12 58 12s44 18 40 46c0 10-3 18-6 24L90 56H26l-2 26c-3-6-6-14-6-24Z" fill={`url(#${ids.hair})`} />

          {/* Face: a wide brow narrowing to a small chin, with soft contour. */}
          <path d="M24 54C24 34 40 26 58 26s34 8 34 28c0 22-14 44-34 50C38 98 24 76 24 54Z" fill={`url(#${ids.skin})`} />
          <Mirrored>
            <ellipse cx="29" cy="80" rx="6" ry="9" fill="#b9775a" opacity="0.18" />
            <ellipse cx="36" cy="77" rx="6.5" ry="3.2" fill="#d98a86" opacity="0.3" />
          </Mirrored>
          {/* Nose: a soft side shadow, a highlight and a small base. */}
          <path d="M56.5 66q-2 7 0 10" fill="none" stroke="#b37d62" strokeWidth="1.1" strokeLinecap="round" opacity="0.5" />
          <path d="M59 67v7" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" opacity="0.25" />
          <path d="M55.6 77.4q2.4 1.4 4.8 0" fill="none" stroke="#a86f56" strokeWidth="1.1" strokeLinecap="round" />

          {/* Side-parted hairline, a short strand on one side and a long one on the other. */}
          <path d="M22 60C20 34 36 18 58 18s38 16 36 42c-2-12-8-22-20-26-6-2-12-3-16-1-4-2-10-1-16 1-12 4-18 14-20 26Z" fill={`url(#${ids.hair})`} />
          <path d="M33 38c-11 14-13 42-3 62 0-20 2-40 9-56Z" fill={`url(#${ids.hair})`} />
          <path d="M88 42c6 14 4 34-3 46 3-12 3-28-1-40Z" fill={`url(#${ids.hair})`} />
          <path d="M36 26q12-8 24-7M31 46c-5 12-6 28-2 42" fill="none" stroke={HAIR_SHINE} strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />

          {/* Gold cuff at the base of the ponytail. */}
          <rect x="78" y="17.5" width="12" height="7" rx="3" transform="rotate(-40 84 21)" fill={GOLD} />
          <path d="M80.5 21.5l6-5" stroke={GOLD_LIGHT} strokeWidth="1.2" strokeLinecap="round" />

          {/* Gold hoops below the strands. */}
          <Mirrored>
            <circle cx="27" cy="84" r="5.5" fill="none" stroke={GOLD} strokeWidth="1.8" />
          </Mirrored>

          <Face mood={mood} ids={ids} />

          {/* Oversized thin gold frames with a slight cat-eye lift. */}
          <Mirrored>
            <g fill="none" stroke={GOLD} strokeWidth="1.2" strokeLinecap="round">
              <rect x="29" y="52" width="27.5" height="21" rx="9" fill="#fff" fillOpacity="0.06" />
              <path d="M29.6 56.5l-2.4-3.2M29 61l-5-2" />
            </g>
          </Mirrored>
          <path d="M56.5 60q1.5-2 3 0" fill="none" stroke={GOLD} strokeWidth="1.2" />
        </g>
      </svg>
    </div>
  );
}
