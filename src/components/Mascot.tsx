import { useId, type ReactNode } from 'react';
import type { Mood } from '../types';
import styles from './Mascot.module.css';

/** Palette for Shimekiri-chan. Kept here because nothing else in the app uses it. */
const LINE = '#3a3440';
const INNER_EAR = '#f6c1cc';
const TABBY = '#b9c3d6';
const NOSE = '#f19bb0';
const MOUTH = '#b8485f';
const WHISKER = '#8a8494';
const BLUSH = '#f6b3c3';
const BOW = 'var(--blue-700)';

/** The face is drawn for the viewer's left side, then mirrored across x = 60. */
const MIRROR = 'translate(120 0) scale(-1 1)';

/** Round head with tufts of cheek fluff on each side. */
const HEAD =
  'M60 30C88 30 104 48 104 66l5 5-6 4 5 6-7 3C93 99 79 106 60 106S27 99 20 84l-7-3 5-6-6-4 5-5C17 48 32 30 60 30Z';

function Mirrored({ children }: { children: ReactNode }) {
  return (
    <>
      <g>{children}</g>
      <g transform={MIRROR}>{children}</g>
    </>
  );
}

const line = { stroke: LINE, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

/** Big glossy eye with long lashes at the outer corner. */
function Eye({ iris, wide = false }: { iris: string; wide?: boolean }) {
  const pupil = wide ? { rx: 2.6, ry: 3.6 } : { rx: 4, ry: 5.8 };
  return (
    <>
      <ellipse cx="44" cy="66" rx="9" ry="10" fill={`url(#${iris})`} {...line} strokeWidth="2" />
      <ellipse cx="44" cy="67" {...pupil} fill="#1c1a24" />
      <circle cx="47" cy="62" r="3" fill="#fff" />
      <circle cx="41" cy="70.5" r="1.4" fill="#fff" />
      {/* A thicker upper lid, then three lashes sweeping outwards. */}
      <path d="M34.5 63Q38 54.5 47 55.5" fill="none" {...line} strokeWidth="3" />
      <path d="M35.5 61.5l-4.5-2.5M36.5 58.5l-3.6-4M39.5 56.2l-2-4.6" fill="none" {...line} strokeWidth="1.8" />
      <path d="M35.5 71.5l-3 1.6" fill="none" {...line} strokeWidth="1.4" />
    </>
  );
}

/** Closed, smiling eye: an upturned arc that keeps the lashes. */
function HappyEye() {
  return (
    <>
      <path d="M35 68Q44 57 53 68" fill="none" {...line} strokeWidth="3" />
      <path d="M36 66l-4.5-2M37.5 63l-3.6-3.6M40.5 60.6l-2-4.4" fill="none" {...line} strokeWidth="1.8" />
    </>
  );
}

/** Eyes, mouth and extras per mood; the head, ears and markings never change. */
function Face({ mood, iris }: { mood: Mood; iris: string }) {
  if (mood === 'happy') {
    return (
      <>
        <Mirrored>
          <HappyEye />
        </Mirrored>
        {/* Open little mouth under the "ω". */}
        <path d="M53 86.5q7 10 14 0Z" fill={MOUTH} {...line} strokeWidth="1.8" />
        <path d="M56 90.5q4 3 8 0q-4-1.2-8 0Z" fill="#f59bb0" />
        <path className={styles.sparkle} d="M10 24l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5Z" fill="#e9c46a" />
        <path className={styles.sparkle} d="M110 96l2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="var(--blue-300)" />
      </>
    );
  }

  if (mood === 'nervous') {
    return (
      <>
        <Mirrored>
          {/* Worried brows: little slanted dashes. */}
          <path d="M37 50l9-4" fill="none" {...line} strokeWidth="2.2" />
          <Eye iris={iris} wide />
        </Mirrored>
        {/* A wobbly mouth. */}
        <path d="M52 89q2-2.5 4 0t4 0 4 0 4 0" fill="none" {...line} strokeWidth="1.8" />
        <path className={styles.sweat} d="M101 40c4.5 6.5 6.5 9 6.5 12a6.5 6.5 0 0 1-13 0c0-3 2-5.5 6.5-12Z" fill="#d6e6f5" stroke="#8aa6c4" strokeWidth="1.5" />
      </>
    );
  }

  return (
    <g className={styles.blink}>
      <Mirrored>
        <Eye iris={iris} />
      </Mirrored>
    </g>
  );
}

/**
 * Shimekiri-chan, an original cat mascot: a cream-white round face, blue eyes with
 * long lashes and a satin bow. The speech bubble carries the meaning; the face sets
 * the mood.
 */
export function Mascot({ mood, message }: { mood: Mood; message: string }) {
  // Gradient ids must be unique on the page.
  const base = useId().replace(/:/g, '');
  const fur = `${base}-fur`;
  const iris = `${base}-iris`;

  return (
    <div className={styles.mascot} data-mood={mood}>
      <p className={styles.bubble} role="status">
        {message}
      </p>
      <svg className={styles.art} viewBox="-2 0 124 122" aria-hidden="true">
        <defs>
          {/* Soft fur: bright in the middle, a warm grey towards the edges. */}
          <radialGradient id={fur} cx="0.5" cy="0.55" r="0.65">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.7" stopColor="#f8f5f0" />
            <stop offset="1" stopColor="#e6e0d6" />
          </radialGradient>
          <radialGradient id={iris} cx="0.5" cy="0.65" r="0.65">
            <stop offset="0" stopColor="#a9cdf2" />
            <stop offset="0.55" stopColor="#5f8fd6" />
            <stop offset="1" stopColor="#2c5aa8" />
          </radialGradient>
        </defs>

        <g className={styles.body}>
          {/* Ears with pink insides and a few tufts of fur. */}
          <Mirrored>
            <path d="M25 54L21 17q0-6 6-4l26 20Z" fill={`url(#${fur})`} {...line} strokeWidth="2.2" />
            <path d="M29 46l-2-24 19 13Z" fill={INNER_EAR} />
            <path d="M29 44l4-8M32 46l5-6M27 40l3-7" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
          </Mirrored>

          {/* Head. */}
          <path d={HEAD} fill={`url(#${fur})`} {...line} strokeWidth="2.2" />

          {/* Faint tabby stripes on the forehead. */}
          <path d="M60 34v9M52.5 35.5l2 7M67.5 35.5l-2 7" fill="none" stroke={TABBY} strokeWidth="2.8" strokeLinecap="round" />

          {/* Pale muzzle, blush and whiskers. */}
          <ellipse cx="60" cy="86" rx="15" ry="10" fill="#fff" opacity="0.85" />
          <Mirrored>
            <ellipse cx="33" cy="82" rx="6.5" ry="3.6" fill={BLUSH} opacity="0.6" />
            <path d="M42 83l-24-4M42 87l-25 1M43 91l-22 5" fill="none" stroke={WHISKER} strokeWidth="1.2" strokeLinecap="round" />
          </Mirrored>

          {/* Heart-shaped nose and the little "ω" mouth. */}
          <path d="M60 83.5c-1.8-1.6-5-2.4-5-4.6 0-1.4 1.2-2.2 2.5-2.2 1 0 2 .6 2.5 1.4.5-.8 1.5-1.4 2.5-1.4 1.3 0 2.5.8 2.5 2.2 0 2.2-3.2 3-5 4.6Z" fill={NOSE} {...line} strokeWidth="1.3" />
          <path d="M60 83.5v2.3q-3 4-7 1M60 85.8q3 4 7 1" fill="none" {...line} strokeWidth="1.8" />

          {/* Satin bow at the base of one ear, in the app's blue. */}
          <g transform="rotate(18 84 34)">
            <path d="M84 34l-9-6q-2 6 0 12Z" fill={BOW} {...line} strokeWidth="1.6" />
            <path d="M84 34l9-6q2 6 0 12Z" fill={BOW} {...line} strokeWidth="1.6" />
            <circle cx="84" cy="34" r="2.6" fill={BOW} {...line} strokeWidth="1.6" />
            <path d="M77.5 31q2-1 3.5 1M90.5 31q-2-1-3.5 1" fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="1.1" strokeLinecap="round" />
          </g>

          <Face mood={mood} iris={iris} />
        </g>
      </svg>
    </div>
  );
}
