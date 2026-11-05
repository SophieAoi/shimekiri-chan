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
const GOLD_SPARKLE = '#f7c948';
const BLUE_SPARKLE = '#a9cdf2';

/** The face is drawn for the viewer's left side, then mirrored across x = 60. */
const MIRROR = 'translate(120 0) scale(-1 1)';

/** A wide face with a slightly longer chin, and tufts of cheek fluff low on each side. */
const HEAD =
  'M60 29C92 29 110 46 111 64l7 4-6 4 7 5-8 2 4 6-8 1C99 100 82 109 60 109S21 100 15 86l-8-1 4-6-8-2 7-5-6-4 7-4C10 46 28 29 60 29Z';

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

/**
 * Big, nearly round gem eye: the app's blue gradient with no separate pupil, a thick outline,
 * a white rim of light along the lower edge, two shine dots and two curled lashes.
 */
function Eye({ iris, wide = false }: { iris: string; wide?: boolean }) {
  // Startled eyes open a little taller.
  const ry = wide ? 14 : 13;
  return (
    <g>
      <ellipse cx="38" cy="66" rx="11.5" ry={ry} fill={`url(#${iris})`} />
      {/* Rim of light along the lower edge. */}
      <path d={`M27.6 ${66 + ry * 0.2}Q29.4 ${66 + ry * 0.85} 38.5 ${66 + ry - 1.4}Q31.8 ${66 + ry * 0.7} 30.6 ${66 + ry * 0.2}Z`} fill="#fff" />
      <circle cx="43" cy={66 - ry * 0.5} r="3.6" fill="#fff" />
      <circle cx="45.4" cy={66 - ry * 0.08} r="1.9" fill="#fff" />
      <ellipse cx="38" cy="66" rx="11.5" ry={ry} fill="none" {...line} strokeWidth="3" />
      {/* Two curled lashes off the top outer edge. */}
      <path d="M28.5 57.5q-6-1.5-7.5-8M32 54.5q-4.5-3-4.5-9.5" fill="none" {...line} strokeWidth="2.4" />
    </g>
  );
}

/** Closed, smiling eye with the same curled lashes. */
function ClosedEye() {
  return (
    <>
      <path d="M26.5 68Q38 55 49.5 68" fill="none" {...line} strokeWidth="3" />
      <path d="M28.5 63.5q-6-1.5-7.5-8M32 60.5q-4.5-3-4.5-9.5" fill="none" {...line} strokeWidth="2.4" />
    </>
  );
}

/** Eyes, mouth and extras per mood; the head and ears never change. */
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
          <path d="M36 42l11-4.5" fill="none" {...line} strokeWidth="2.4" />
          <Eye iris={iris} wide />
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
          <Eye iris={iris} />
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
  // Clip and gradient ids must be unique on the page.
  const base = useId().replace(/:/g, '');
  const headClip = `${base}-head`;
  const iris = `${base}-iris`;

  return (
    <div className={styles.mascot} data-mood={mood}>
      <p className={styles.bubble} role="status">
        {message}
      </p>
      <svg className={styles.art} viewBox="-2 0 124 122" aria-hidden="true">
        <defs>
          {/* The app's own blues: button navy and royal blue at the top, fading into
              the periwinkle and lavender of the card's accent strip. */}
          <linearGradient id={iris} x1="0" y1="0" x2="0.35" y2="1">
            <stop offset="0" stopColor="#1b3f86" />
            <stop offset="0.4" stopColor="#2f63c0" />
            <stop offset="0.78" stopColor="#6a7fd6" />
            <stop offset="1" stopColor="#9b8be0" />
          </linearGradient>
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
            <ellipse cx="60" cy="124" rx="60" ry="20" fill={SHADE} />
            <ellipse cx="120" cy="78" rx="16" ry="34" fill={SHADE} />
          </g>
          <path d={HEAD} fill="none" {...line} strokeWidth="2.6" />

          {/* Blush, a tiny nose and two short whiskers each side. */}
          <Mirrored>
            <ellipse cx="27" cy="85" rx="7" ry="4" fill={BLUSH} opacity="0.75" />
            <path d="M16 88l-9-2M16 92l-9 1" fill="none" {...line} strokeWidth="1.6" />
          </Mirrored>
          <path d="M56.5 78.5q3.5-2 7 0q-1 3-3.5 3.5q-2.5-.5-3.5-3.5Z" fill={NOSE} {...line} strokeWidth="1.4" />

          <Face mood={mood} iris={iris} />
        </g>
      </svg>
    </div>
  );
}
