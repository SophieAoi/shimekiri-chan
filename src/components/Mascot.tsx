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
const IRIS = '#3f8fd8';
const IRIS_DEEP = '#1f5fae';
const GOLD_SPARKLE = '#f7c948';
const BLUE_SPARKLE = '#a9cdf2';

/** The face is drawn for the viewer's left side, then mirrored across x = 60. */
const MIRROR = 'translate(120 0) scale(-1 1)';

/** A wide face, broader than it is tall, with tufts of cheek fluff low on each side. */
const HEAD =
  'M60 34C92 34 110 50 111 66l7 4-6 4 7 5-8 2 4 6-8 1C98 98 82 104 60 104S22 98 15 88l-8-1 4-6-8-2 7-5-6-4 7-4C10 50 28 34 60 34Z';

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

/** Big, wide-set jewel eye: a flat two-tone iris, a crescent shine and curled lashes. */
function Eye({ wide = false }: { wide?: boolean }) {
  const pupil = wide ? { rx: 3, ry: 4 } : { rx: 4.6, ry: 6.4 };
  return (
    <>
      {/* Flat two-tone iris: bright gem colour, a deeper band across the top. */}
      <ellipse cx="38" cy="66" rx="12" ry="13" fill={IRIS} />
      <path d="M26 64a12 13 0 0 1 24 0q-12-5-24 0Z" fill={IRIS_DEEP} />
      <ellipse cx="39.5" cy="68" {...pupil} fill="#16305c" />
      {/* Big crescent shine on one side, a dot and a twinkle on the other. */}
      <path d="M32.5 57q-5 9.5 0 19q.6-10.5 7.5-15.5q-3.5-4.4-7.5-3.5Z" fill="#fff" />
      <circle cx="44.5" cy="73" r="1.9" fill="#fff" />
      <Twinkle x={44} y={59} size={3.2} />
      <ellipse cx="38" cy="66" rx="12" ry="13" fill="none" {...line} strokeWidth="2.8" />
      {/* Three curled lashes at the outer corner. */}
      <path d="M27.2 60q-5.5-.6-8-4.3M28.8 56.2q-5-1.8-6.2-6.8M32.3 53.4q-3.8-3-3.8-8" fill="none" {...line} strokeWidth="2.2" />
    </>
  );
}

/** Closed, smiling eye with the same curled lashes. */
function ClosedEye() {
  return (
    <>
      <path d="M26.5 68Q38 55 49.5 68" fill="none" {...line} strokeWidth="3" />
      <path d="M27.2 65.5q-5.5-.6-8-4.3M29 61.8q-5-1.8-6.2-6.8M32.6 59q-3.8-3-3.8-8" fill="none" {...line} strokeWidth="2.2" />
    </>
  );
}

/** Eyes, mouth and extras per mood; the head and ears never change. */
function Face({ mood }: { mood: Mood }) {
  if (mood === 'happy') {
    // Celebrating: a wink, a wide open mouth and sparkles.
    return (
      <>
        <Eye />
        <g transform={MIRROR}>
          <ClosedEye />
        </g>
        <path d="M51 84.5q4.5 2.5 9 0q4.5 2.5 9 0q-1 13-9 13t-9-13Z" fill={MOUTH} {...line} strokeWidth="2.2" />
        <path d="M54.5 93q5.5-3.5 11 0q-5.5 3.5-11 0Z" fill={TONGUE} />
        <Twinkle className={styles.sparkle} x={6} y={28} size={6} fill={GOLD_SPARKLE} />
        <Twinkle className={styles.sparkle} x={113} y={102} size={5.5} fill={BLUE_SPARKLE} />
      </>
    );
  }

  if (mood === 'nervous') {
    return (
      <>
        <Mirrored>
          {/* Worried brows: little slanted dashes. */}
          <path d="M30 47l11-4.5" fill="none" {...line} strokeWidth="2.4" />
          <Eye wide />
        </Mirrored>
        {/* A round "o" of surprise. */}
        <ellipse cx="60" cy="89" rx="4" ry="4.8" fill={MOUTH} {...line} strokeWidth="2.2" />
        <path className={styles.sweat} d="M112 34c4.5 6.5 6.5 9 6.5 12a6.5 6.5 0 0 1-13 0c0-3 2-5.5 6.5-12Z" fill="#d6e6f5" {...line} strokeWidth="1.8" />
      </>
    );
  }

  // Relaxed: both eyes open (with a blink now and then) and a small open "ω" smile.
  return (
    <>
      <g className={styles.blink}>
        <Mirrored>
          <Eye />
        </Mirrored>
      </g>
      <path d="M51.5 84q4.25 2.5 8.5 0q4.25 2.5 8.5 0q-1.5 10-8.5 10t-8.5-10Z" fill={MOUTH} {...line} strokeWidth="2.2" />
      <path d="M55 90.5q5-3 10 0q-5 3-10 0Z" fill={TONGUE} />
    </>
  );
}

/**
 * Shimekiri-chan, an original cat mascot in a jewel-kawaii style: a wide white face
 * with pink shading, bold navy outlines and big wide-set gem eyes. The speech bubble
 * carries the meaning; the face sets the mood.
 */
export function Mascot({ mood, message }: { mood: Mood; message: string }) {
  // The clip id must be unique on the page.
  const headClip = `${useId().replace(/:/g, '')}-head`;

  return (
    <div className={styles.mascot} data-mood={mood}>
      <p className={styles.bubble} role="status">
        {message}
      </p>
      <svg className={styles.art} viewBox="-2 0 124 122" aria-hidden="true">
        <defs>
          <clipPath id={headClip}>
            <path d={HEAD} />
          </clipPath>
        </defs>

        <g className={styles.body}>
          {/* Ears: white with pink insides and pink shading along the back edge. */}
          <Mirrored>
            <path d="M18 58L14 18q0-6 6-4l28 22Z" fill={FUR} {...line} strokeWidth="2.6" />
            <path d="M22.5 50.5l-2.5-28 22 14.5Z" fill={INNER_EAR} />
            <path d="M15.5 32l2 24 4-2Z" fill={SHADE} />
          </Mirrored>

          {/* Head, with soft pink shading on the lower edge and down one side. */}
          <path d={HEAD} fill={FUR} />
          <g clipPath={`url(#${headClip})`}>
            <ellipse cx="60" cy="120" rx="60" ry="20" fill={SHADE} />
            <ellipse cx="120" cy="78" rx="16" ry="34" fill={SHADE} />
          </g>
          <path d={HEAD} fill="none" {...line} strokeWidth="2.6" />

          {/* Blush, a tiny nose and two short whiskers each side. */}
          <Mirrored>
            <ellipse cx="27" cy="85" rx="7" ry="4" fill={BLUSH} opacity="0.75" />
            <path d="M16 88l-9-2M16 92l-9 1" fill="none" {...line} strokeWidth="1.6" />
          </Mirrored>
          <path d="M56.5 78.5q3.5-2 7 0q-1 3-3.5 3.5q-2.5-.5-3.5-3.5Z" fill={NOSE} {...line} strokeWidth="1.4" />

          <Face mood={mood} />
        </g>
      </svg>
    </div>
  );
}
