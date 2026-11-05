import { useId } from 'react';
import type { Mood } from '../types';
import styles from './Mascot.module.css';

/** Near-black for the face, like the nori. */
const INK = '#1f1f1f';
const NORI = '#1c211f';
const MOUTH = '#3a2a2a';

/** The rice ball's outline: a rounded triangle. Shared by the fill, the nori clip and the edge. */
const BODY = 'M60 10c10 0 16 6 22 16l24 42c10 18 0 40-22 40H36C14 108 4 86 14 68l24-42c6-10 12-16 22-16Z';

/**
 * Rice grains scattered over the body: [x, y, angle]. Fixed rather than random so the
 * drawing is identical on every render. The face area is left mostly clear.
 */
const GRAINS: readonly (readonly [number, number, number])[] = [
  [58, 20, 20], [50, 30, -30], [66, 28, 45], [44, 40, 10], [74, 38, -20], [59, 38, 70],
  [36, 52, -45], [84, 50, 30], [28, 64, 60], [92, 62, -60], [22, 78, 15], [98, 78, -10],
  [20, 92, -35], [100, 92, 40], [30, 100, 70], [90, 100, -70], [52, 48, -15], [68, 47, 25],
  [33, 86, 5], [87, 86, -5], [26, 72, -20],
];

/** Big glossy eyes: a dark circle with two white highlights. */
function Eyes({ blink = false }: { blink?: boolean }) {
  return (
    <g className={blink ? styles.blink : undefined}>
      {[42, 78].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="63" r="8.5" fill={INK} />
          <circle cx={cx + 2.6} cy="59" r="3.2" fill="#fff" />
          <circle cx={cx - 3} cy="67.5" r="1.5" fill="#fff" />
        </g>
      ))}
    </g>
  );
}

/** Each mood only swaps the face and small extras, so the body stays one shared shape. */
function Face({ mood }: { mood: Mood }) {
  const stroke = { fill: 'none', stroke: INK, strokeWidth: 3, strokeLinecap: 'round' } as const;

  if (mood === 'happy') {
    return (
      <>
        <path d="M33 66q9-14 18 0M69 66q9-14 18 0" {...stroke} strokeWidth="3.5" />
        <path d="M53 72h14q-1 10-7 10t-7-10Z" fill={MOUTH} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        <path className={styles.sparkle} d="M10 22l3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" fill="#c9c4b8" />
        <path className={styles.sparkle} d="M108 8l2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" fill="#c9c4b8" />
      </>
    );
  }

  if (mood === 'nervous') {
    return (
      <>
        {/* Inner ends raised: worried, not cross. */}
        <path d="M33 50l10-4M87 50l-10-4" {...stroke} strokeWidth="2.5" />
        <Eyes />
        {/* A round "gasp" mouth. */}
        <circle cx="60" cy="78" r="4.5" fill={MOUTH} stroke={INK} strokeWidth="2.5" />
        <path className={styles.sweat} d="M101 28c5 7 7 10 7 13a7 7 0 0 1-14 0c0-3 2-6 7-13Z" fill="#d6e6f5" stroke="#8aa6c4" strokeWidth="1.5" />
      </>
    );
  }

  return (
    <>
      <Eyes blink />
      {/* A small round "o" mouth. */}
      <circle cx="60" cy="77" r="2.8" fill={MOUTH} stroke={INK} strokeWidth="2" />
    </>
  );
}

/** Shimekiri-chan, an original onigiri mascot. The speech bubble carries the meaning. */
export function Mascot({ mood, message }: { mood: Mood; message: string }) {
  // Gradient and clip ids must be unique on the page.
  const id = useId().replace(/:/g, '');
  const rice = `${id}-rice`;
  const sheen = `${id}-sheen`;
  const clip = `${id}-clip`;

  return (
    <div className={styles.mascot} data-mood={mood}>
      <p className={styles.bubble} role="status">
        {message}
      </p>
      <svg className={styles.art} viewBox="-2 0 124 122" aria-hidden="true">
        <defs>
          {/* Lit from the top left: bright white fading to a warm grey at the edges. */}
          <radialGradient id={rice} cx="0.42" cy="0.35" r="0.75">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.6" stopColor="#f6f4ef" />
            <stop offset="1" stopColor="#dedad0" />
          </radialGradient>
          {/* A faint highlight across the seaweed. */}
          <linearGradient id={sheen} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="0.35" stopColor="#ffffff" stopOpacity="0.14" />
            <stop offset="0.55" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <clipPath id={clip}>
            <path d={BODY} />
          </clipPath>
        </defs>

        {/* Soft contact shadow in place of feet. */}
        <ellipse cx="60" cy="112" rx="38" ry="5" fill="#18223a" opacity="0.12" />

        <g className={styles.body}>
          <path d={BODY} fill={`url(#${rice})`} />

          <g clipPath={`url(#${clip})`}>
            {GRAINS.map(([x, y, angle]) => (
              <ellipse
                key={`${x}-${y}`}
                cx={x}
                cy={y}
                rx="3.2"
                ry="1.6"
                transform={`rotate(${angle} ${x} ${y})`}
                fill="#e7e3d9"
                stroke="#d8d3c7"
                strokeWidth="0.5"
              />
            ))}

            {/* Nori: a dark sheet wrapped around the base, with fine fibre lines. */}
            <path d="M40 120V93q0-6 6-6h28q6 0 6 6v27Z" fill={NORI} />
            <path d="M42 96h36M42 102h36" stroke="#262c29" strokeWidth="0.7" />
            <rect x="40" y="87" width="40" height="40" fill={`url(#${sheen})`} />
          </g>

          {/* Faint cheeks, and a soft edge instead of a hard cartoon outline. */}
          <circle cx="28" cy="75" r="6.5" fill="#f2c9c4" opacity="0.45" />
          <circle cx="92" cy="75" r="6.5" fill="#f2c9c4" opacity="0.45" />
          <path d={BODY} fill="none" stroke="#c9c3b6" strokeWidth="1.5" />

          <Face mood={mood} />
        </g>
      </svg>
    </div>
  );
}
