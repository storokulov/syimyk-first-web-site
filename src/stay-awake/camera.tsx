// 2.5D multiplane camera: every layer is a flat plane at depth z, scaled by k = F / (z - camera.z).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {easeInOut, lerp, seg} from './anim';
import {F} from './world';

export type Cam = {x: number; y: number; z: number};
export type Move = {t0: number; t1: number; to: Cam; ease?: (u: number) => number; zRef?: number};

/**
 * Camera track: hold the previous framing until t0, glide to `to`, arrive at t1 (t0 === t1 is a cut).
 * Zoom is interpolated in log scale at the reference depth so a dolly feels even.
 */
export const track =
  (start: Cam, moves: Move[], zRef: number) =>
  (t: number): Cam => {
    let cur = start;
    for (const m of moves) {
      if (t < m.t0) break;
      if (t >= m.t1) {
        cur = m.to;
        continue;
      }
      const u = (m.ease ?? easeInOut)(seg(t, m.t0, m.t1));
      const zr = m.zRef ?? zRef;
      const k = Math.exp(lerp(Math.log(F / (zr - cur.z)), Math.log(F / (zr - m.to.z)), u));
      return {x: lerp(cur.x, m.to.x, u), y: lerp(cur.y, m.to.y, u), z: zr - F / k};
    }
    return cur;
  };

export const scaleAt = (cam: Cam, z: number) => F / (z - cam.z);

/** A flat plane at depth z; children are placed in world coordinates. */
export const Layer: React.FC<{cam: Cam; z: number; blur?: number; minDepth?: number; children: React.ReactNode}> = ({
  cam,
  z,
  blur = 0,
  minDepth = 150,
  children,
}) => {
  const d = z - cam.z;
  if (d < minDepth) return null;
  const k = F / d;
  return (
    <AbsoluteFill style={{filter: blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : undefined}}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          transformOrigin: '0 0',
          transform: `translate(540px, 960px) scale(${k}) translate(${-cam.x}px, ${-cam.y}px)`,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

/** An SVG drawing surface whose user units are the parent's (world) pixels. */
export const W: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', ...style}}>
    {children}
  </svg>
);

/** Screen shake: sums of sines under decaying envelopes, never random jumps. hits = [t0, px, decay] */
export const shake = (t: number, hits: [number, number, number?][]) => {
  let x = 0;
  let y = 0;
  for (const [t0, amp, decay = 5] of hits) {
    if (t < t0) continue;
    const tau = t - t0;
    const e = amp * Math.exp(-decay * tau);
    if (e < 0.05) continue;
    x += e * (0.6 * Math.sin(2 * Math.PI * 13.3 * tau) + 0.4 * Math.sin(2 * Math.PI * 7.1 * tau + 1.3));
    y += e * (0.6 * Math.sin(2 * Math.PI * 11.7 * tau + 0.4) + 0.4 * Math.sin(2 * Math.PI * 5.3 * tau + 2.1));
  }
  return {x, y};
};
