import { useId, type ReactNode } from 'react';
import type { Mood } from '../types';
import styles from './Mascot.module.css';

/**
 * Palette for Shimekiri-chan: white fur, bold navy outlines and soft pink shading,
 * in the style of a jewel-themed kawaii mascot. Kept here because nothing else in
 * the app uses it.
 */
const LINE = '#1f4a8f';
const FUR = '#ffffff';
const SHADE = '#fbe1e8';
const INNER_EAR = '#f7bfd0';
const MOUTH = '#f4a9bf';
const TONGUE = '#ee7f9e';
const NOSE = '#f59ab3';
const BLUSH = '#f9b8c9';
const PETAL = '#a9cdf2';
const GEM = '#ef6f97';

/** The face is drawn for the viewer's left side, then mirrored across x = 60. */
const MIRROR = 'translate(120 0) scale(-1 1)';

/** Round head with tufts of cheek fluff on each side. */
const HEAD =
  'M60 30C88 30 104 48 104 66l6 4-6 4 5 6-7 3C94 99 80 106 60 106S26 99 19 83l-7-3 5-6-6-4 6-4C16 48 32 30 60 30Z';

function Mirrored({ children }: { children: ReactNode }) {
  return (
    <>
      <g>{children}</g>
      <g transform={MIRROR}>{children}</g>
    </>
  );
}

const line = { stroke: LINE, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

/** Four-point twinkle, used inside the eyes and as celebration sparkles. */
function Twinkle({ x, y, size, fill = '#fff', className }: { x: number; y: number; size: number; fill?: string; className?: string }) {
  const t = size * 0.3;
  return (
    <path
      className={className}
      d={`M${x} ${y - size}L${x + t} ${y - t}L${x + size} ${y}L${x + t} ${y + t}L${x} ${y + size}L${x - t} ${y + t}L${x - size} ${y}L${x - t} ${y - t}Z`}
      fill={fill}
    />
  );
}

/** Big jewel-like eye: a glossy gradient iris, a twinkle highlight and curled lashes. */
function Eye({ iris, wide = false }: { iris: string; wide?: boolean }) {
  const pupil = wide ? { rx: 2.4, ry: 3.2 } : { rx: 3.6, ry: 5 };
  return (
    <>
      <ellipse cx="44" cy="66" rx="9.5" ry="10.5" fill={`url(#${iris})`} {...line} strokeWidth="2.6" />
      <ellipse cx="44" cy="67.5" {...pupil} fill="#16305c" />
      {/* A lighter lower half makes the iris read as a cut gem. */}
      <path d="M36 70q8 7 16 0q-1 5-8 6.5q-7-1.5-8-6.5Z" fill="#fff" opacity="0.28" />
      <Twinkle x={47.5} y={61.5} size={3.6} />
      <circle cx="40.5" cy="71" r="1.5" fill="#fff" />
      {/* Curled lashes at the outer corner. */}
      <path d="M35 60.5q-4-1-5.5-4.5M37 57.5q-3-2-3.5-6" fill="none" {...line} strokeWidth="2" />
    </>
  );
}

/** Closed, smiling eye with the same curled lashes. */
function ClosedEye() {
  return (
    <>
      <path d="M35 68Q44 58 53 68" fill="none" {...line} strokeWidth="2.8" />
      <path d="M35.5 65.5q-4-1-5.5-4.5M38 62.5q-3-2-3.5-6" fill="none" {...line} strokeWidth="2" />
    </>
  );
}

/** Eyes, mouth and extras per mood; the head, ears and flower never change. */
function Face({ mood, iris }: { mood: Mood; iris: string }) {
  if (mood === 'happy') {
    // Celebrating: a wink, a wide open mouth and sparkles.
    return (
      <>
        <Eye iris={iris} />
        <g transform={MIRROR}>
          <ClosedEye />
        </g>
        <path d="M51 84.5q4.5 2.5 9 0q4.5 2.5 9 0q-1 13-9 13t-9-13Z" fill={MOUTH} {...line} strokeWidth="2.2" />
        <path d="M54.5 93q5.5-3.5 11 0q-5.5 3.5-11 0Z" fill={TONGUE} />
        <Twinkle className={styles.sparkle} x={10} y={26} size={7} fill="#f7c948" />
        <Twinkle className={styles.sparkle} x={110} y={98} size={5.5} fill={PETAL} />
      </>
    );
  }

  if (mood === 'nervous') {
    return (
      <>
        <Mirrored>
          {/* Worried brows: little slanted dashes. */}
          <path d="M37 50.5l9-4" fill="none" {...line} strokeWidth="2.4" />
          <Eye iris={iris} wide />
        </Mirrored>
        {/* A wobbly mouth. */}
        <path d="M52 88.5q2-2.5 4 0t4 0 4 0 4 0" fill="none" {...line} strokeWidth="2" />
        <path className={styles.sweat} d="M101 40c4.5 6.5 6.5 9 6.5 12a6.5 6.5 0 0 1-13 0c0-3 2-5.5 6.5-12Z" fill="#d6e6f5" {...line} strokeWidth="1.8" />
      </>
    );
  }

  // Relaxed: both eyes open (with a blink now and then) and a small open "ω" smile.
  return (
    <>
      <g className={styles.blink}>
        <Mirrored>
          <Eye iris={iris} />
        </Mirrored>
      </g>
      <path d="M53 84.5q3.5 2 7 0q3.5 2 7 0q-1 7.5-7 7.5t-7-7.5Z" fill={MOUTH} {...line} strokeWidth="2.2" />
    </>
  );
}

/**
 * Shimekiri-chan, an original cat mascot in a jewel-kawaii style: white fur with pink
 * shading, bold navy outlines, gem-like eyes and a flower behind one ear. The speech
 * bubble carries the meaning; the face sets the mood.
 */
export function Mascot({ mood, message }: { mood: Mood; message: string }) {
  // Gradient and clip ids must be unique on the page.
  const base = useId().replace(/:/g, '');
  const iris = `${base}-iris`;
  const headClip = `${base}-head`;

  return (
    <div className={styles.mascot} data-mood={mood}>
      <p className={styles.bubble} role="status">
        {message}
      </p>
      <svg className={styles.art} viewBox="-2 0 124 122" aria-hidden="true">
        <defs>
          <radialGradient id={iris} cx="0.5" cy="0.7" r="0.75">
            <stop offset="0" stopColor="#8fd0f5" />
            <stop offset="0.5" stopColor="#3f8fd8" />
            <stop offset="1" stopColor="#1f4a8f" />
          </radialGradient>
          <clipPath id={headClip}>
            <path d={HEAD} />
          </clipPath>
        </defs>

        <g className={styles.body}>
          {/* Ears: white with pink insides and pink shading along the back edge. */}
          <Mirrored>
            <path d="M24 54L20 16q0-6 6-4l27 21Z" fill={FUR} {...line} strokeWidth="2.6" />
            <path d="M28.5 46.5l-2.5-26 19 14Z" fill={INNER_EAR} />
            <path d="M21.5 30l2 22 4-2Z" fill={SHADE} />
          </Mirrored>

          {/* Head, with soft pink shading on the lower edge. */}
          <path d={HEAD} fill={FUR} />
          <g clipPath={`url(#${headClip})`}>
            <ellipse cx="60" cy="120" rx="56" ry="22" fill={SHADE} />
            <ellipse cx="112" cy="80" rx="12" ry="26" fill={SHADE} />
          </g>
          <path d={HEAD} fill="none" {...line} strokeWidth="2.6" />

          {/* Blush, a tiny nose and two short whiskers each side. */}
          <Mirrored>
            <ellipse cx="33" cy="80" rx="6.5" ry="3.8" fill={BLUSH} opacity="0.75" />
            <path d="M24 84l-9-2M24 88l-9 1" fill="none" {...line} strokeWidth="1.6" />
          </Mirrored>
          <path d="M56.5 78.5q3.5-2 7 0q-1 3-3.5 3.5q-2.5-.5-3.5-3.5Z" fill={NOSE} {...line} strokeWidth="1.4" />

          <Face mood={mood} iris={iris} />

          {/* Flower behind one ear: blue petals around a pink gem. */}
          <g transform="translate(86 36) rotate(12)">
            {[0, 72, 144, 216, 288].map((angle) => (
              <ellipse
                key={angle}
                cx="0"
                cy="-6.5"
                rx="4.6"
                ry="6.2"
                transform={`rotate(${angle})`}
                fill={PETAL}
                {...line}
                strokeWidth="1.8"
              />
            ))}
            <circle r="3.6" fill={GEM} {...line} strokeWidth="1.6" />
            <circle cx="-1.1" cy="-1.1" r="1.1" fill="#fff" />
            <Twinkle x={-6} y={-8} size={1.8} />
          </g>
        </g>
      </svg>
    </div>
  );
}
