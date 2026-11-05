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
const IRIS = '#3f8fd8';
const IRIS_DEEP = '#1f5fae';
const GEM = '#ef6f97';

/** The face is drawn for the viewer's left side, then mirrored across x = 60. */
const MIRROR = 'translate(120 0) scale(-1 1)';

/** Round head with tufts of cheek fluff on each side. */
const HEAD =
  'M60 30C88 30 104 46 105 62l7 3-6 4 8 5-8 3 5 6-8 2C94 99 80 106 60 106S26 99 21 85l-8-2 5-6-8-3 8-5-6-4 7-3C16 46 32 30 60 30Z';

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

/** Big jewel-like eye: a flat two-tone iris, a crescent shine and curled lashes. */
function Eye({ wide = false }: { wide?: boolean }) {
  const pupil = wide ? { rx: 2.4, ry: 3.2 } : { rx: 3.6, ry: 5 };
  return (
    <>
      {/* Flat two-tone iris: bright gem colour, a deeper band across the top. */}
      <ellipse cx="44" cy="66" rx="9.5" ry="10.5" fill={IRIS} />
      <path d="M34.5 64a9.5 10.5 0 0 1 19 0q-9.5-4-19 0Z" fill={IRIS_DEEP} />
      <ellipse cx="45" cy="67.5" {...pupil} fill="#16305c" />
      {/* Big crescent shine on one side, a dot and a twinkle on the other. */}
      <path d="M39.5 58.5q-4 7.5 0 15q.5-8.5 6-12.5q-2.8-3.5-6-2.5Z" fill="#fff" />
      <circle cx="49" cy="71.5" r="1.5" fill="#fff" />
      <Twinkle x={48.5} y={61} size={2.6} />
      <ellipse cx="44" cy="66" rx="9.5" ry="10.5" fill="none" {...line} strokeWidth="2.6" />
      {/* Three curled lashes at the outer corner. */}
      <path d="M35 61q-4.5-.5-6.5-3.5M36.2 58q-4-1.5-5-5.5M39 55.8q-3-2.5-3-6.5" fill="none" {...line} strokeWidth="2" />
    </>
  );
}

/** Closed, smiling eye with the same curled lashes. */
function ClosedEye() {
  return (
    <>
      <path d="M35 68Q44 58 53 68" fill="none" {...line} strokeWidth="2.8" />
      <path d="M35.5 66q-4.5-.5-6.5-3.5M37 63q-4-1.5-5-5.5M40 60.6q-3-2.5-3-6.5" fill="none" {...line} strokeWidth="2" />
    </>
  );
}

/** Eyes, mouth and extras per mood; the head, ears and flower never change. */
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
          <Eye wide />
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
          <Eye />
        </Mirrored>
      </g>
      <path d="M51.5 84q4.25 2.5 8.5 0q4.25 2.5 8.5 0q-1.5 10-8.5 10t-8.5-10Z" fill={MOUTH} {...line} strokeWidth="2.2" />
      <path d="M55 90.5q5-3 10 0q-5 3-10 0Z" fill={TONGUE} />
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
  const headClip = `${base}-head`;

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
            <path d="M24 54L20 16q0-6 6-4l27 21Z" fill={FUR} {...line} strokeWidth="2.6" />
            <path d="M28.5 46.5l-2.5-26 19 14Z" fill={INNER_EAR} />
            <path d="M21.5 30l2 22 4-2Z" fill={SHADE} />
          </Mirrored>

          {/* Head, with soft pink shading on the lower edge. */}
          <path d={HEAD} fill={FUR} />
          <g clipPath={`url(#${headClip})`}>
            <ellipse cx="60" cy="122" rx="56" ry="22" fill={SHADE} />
            <ellipse cx="114" cy="78" rx="16" ry="34" fill={SHADE} />
          </g>
          <path d={HEAD} fill="none" {...line} strokeWidth="2.6" />

          {/* Blush, a tiny nose and two short whiskers each side. */}
          <Mirrored>
            <ellipse cx="33" cy="80" rx="6.5" ry="3.8" fill={BLUSH} opacity="0.75" />
            <path d="M24 84l-9-2M24 88l-9 1" fill="none" {...line} strokeWidth="1.6" />
          </Mirrored>
          <path d="M56.5 78.5q3.5-2 7 0q-1 3-3.5 3.5q-2.5-.5-3.5-3.5Z" fill={NOSE} {...line} strokeWidth="1.4" />

          <Face mood={mood} />

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
