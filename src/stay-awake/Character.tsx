// A cut-out character: the AI picture plus everything drawn on its face in code
// (pupils, lids, veins, eye bags, sweat, snot bubble, Zzz), all in the sprite's own pixel space.
import React from 'react';
import {Img, staticFile} from 'remotion';
import {easeIn, easeOut, easeOutBack, seg, wave} from './anim';
import {CharName, SPRITES} from './sprites';
import {C, FONT, Placed} from './world';

export type EyeState = {
  ps?: number; // pupil scale (1 = as drawn)
  look?: [number, number]; // both pupils, in eye-box fractions
  dl?: [number, number]; // extra offset of the left eye in the image
  dr?: [number, number]; // extra offset of the right eye in the image
  veins?: number; // 0..1 how far the red veins have grown
  lid?: number; // 0 open .. 1 shut
  lidL?: number;
  lidR?: number;
  tremble?: number; // pupil tremble in sprite px
};

export type Face = {
  eyes?: EyeState;
  bags?: number; // pop scale of the tired eye bags
  sweat?: number; // 0..1 life of one sweat drop
  zzz?: {t0: number; t1?: number; o?: [number, number]; k?: number}; // Zs float out from t0, shrink away at t1; o = origin in head radii, k = size
  bubble?: {t0: number; t1?: number; size?: number}; // snot bubble grows from t0, bursts at t1
  twitch?: number; // 0..1 eye twitch on the right eye
};

const rgb = (c: [number, number, number]) => `rgb(${c[0]},${c[1]},${c[2]})`;
const BUBBLE_DIR: Record<CharName, [number, number]> = {max: [0.55, 0.8], lily: [-0.55, 0.8], bob: [0.1, 1], host: [-0.15, 1]};
const GLINT: Record<CharName, boolean> = {max: false, lily: false, bob: false, host: true};

// vein polylines in eye-box fractions
const VEINS: [number, number][][] = [
  [[0.02, 0.56], [0.12, 0.5], [0.2, 0.57], [0.3, 0.5]],
  [[0.98, 0.44], [0.88, 0.52], [0.8, 0.45], [0.7, 0.52]],
  [[0.45, 0.98], [0.51, 0.88], [0.44, 0.8], [0.5, 0.72]],
  [[0.12, 0.5], [0.15, 0.38], [0.22, 0.33]],
];

const Eyes: React.FC<{name: CharName; uid: string; st: EyeState; ink: number; t: number}> = ({name, uid, st, ink, t}) => {
  const info = SPRITES[name];
  return (
    <>
      {info.eyes.map((e, i) => {
        const [bx, by, bw, bh] = e.box;
        const p = e.pupil ?? [bx + bw / 2, by + bh / 2, bw / 5, bw / 5, bw / 5];
        const look = st.look ?? [0, 0];
        const off = (i === 0 ? st.dl : st.dr) ?? [0, 0];
        const tr = st.tremble ?? 0;
        const ps = st.ps ?? 1;
        let cx = p[0] + (look[0] + off[0]) * bw + tr * (0.6 * wave(t, 11, i * 0.3) + 0.4 * wave(t, 7.3, 0.5));
        let cy = p[1] + (look[1] + off[1]) * bh + tr * (0.6 * wave(t, 9.1, 0.2 + i * 0.4) + 0.4 * wave(t, 6.1, 0.9));
        let rx = p[3] * ps;
        let ry = p[4] * ps;
        if (name === 'bob') {
          // Bob's pupils are discs half hidden under his heavy lids
          rx = ry = p[3] * ps;
          cy = p[1] - p[4] + 0.15 * p[3] + (look[1] + off[1]) * bh;
        }
        const lid = (i === 0 ? st.lidL : st.lidR) ?? st.lid ?? 0;
        const yl = by - 0.06 * bh + lid * 1.12 * bh;
        const veins = st.veins ?? 0;
        const id = `${uid}-e${i}`;
        return (
          <g key={i}>
            <clipPath id={id}>
              <polygon points={e.poly.map((q) => q.join(',')).join(' ')} />
            </clipPath>
            <g clipPath={`url(#${id})`}>
              <rect x={bx - 30} y={by - 30} width={bw + 60} height={bh + 60} fill={rgb(e.white)} />
              {veins > 0.01 &&
                VEINS.map((v, j) => {
                  const pts = v.map(([u, w]) => [bx + u * bw, by + w * bh]);
                  let len = 0;
                  for (let k = 1; k < pts.length; k++) len += Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]);
                  return (
                    <polyline
                      key={j}
                      points={pts.map((q) => q.join(',')).join(' ')}
                      fill="none"
                      stroke="#D8434A"
                      strokeWidth={Math.max(3, bw * 0.03)}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray={`${len * veins} ${len + 1}`}
                    />
                  );
                })}
              <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#121214" />
              {GLINT[name] && (
                <ellipse
                  cx={cx - 0.4 * rx}
                  cy={cy - 0.42 * ry}
                  rx={0.27 * rx}
                  ry={0.19 * ry}
                  fill="#FFFFFF"
                  transform={`rotate(-35 ${cx - 0.4 * rx} ${cy - 0.42 * ry})`}
                />
              )}
              {lid > 0.01 && (
                <>
                  <path
                    d={`M ${bx - 40} ${by - 80} H ${bx + bw + 40} V ${yl - 0.08 * bh} Q ${bx + bw / 2} ${yl + 0.16 * bh} ${bx - 40} ${yl - 0.08 * bh} Z`}
                    fill={rgb(e.skin ?? [235, 190, 160])}
                  />
                  <path
                    d={`M ${bx - 40} ${yl - 0.08 * bh} Q ${bx + bw / 2} ${yl + 0.16 * bh} ${bx + bw + 40} ${yl - 0.08 * bh}`}
                    fill="none"
                    stroke={C.ink}
                    strokeWidth={ink}
                  />
                </>
              )}
            </g>
          </g>
        );
      })}
    </>
  );
};

const Bags: React.FC<{name: CharName; s: number; ink: number}> = ({name, s, ink}) => (
  <>
    {SPRITES[name].eyes.map((e, i) => {
      const [bx, by, bw, bh] = e.box;
      const cx = bx + bw / 2;
      const cy = by + bh * 1.1;
      return (
        <g key={i} transform={`translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`}>
          <path
            d={`M ${bx + 0.14 * bw} ${by + bh * 1.02} Q ${cx} ${by + bh * 1.24} ${bx + 0.86 * bw} ${by + bh * 1.02}`}
            fill="none"
            stroke="#7B5A86"
            strokeWidth={ink * 0.8}
            strokeLinecap="round"
          />
          <path
            d={`M ${bx + 0.3 * bw} ${by + bh * 1.17} Q ${cx} ${by + bh * 1.3} ${bx + 0.7 * bw} ${by + bh * 1.17}`}
            fill="none"
            stroke="#A083AC"
            strokeWidth={ink * 0.6}
            strokeLinecap="round"
          />
        </g>
      );
    })}
  </>
);

/** light-blue teardrop with an outline and a glint; s = 0..1 life */
export const SweatDrop: React.FC<{x: number; y: number; size: number; ink: number; scale?: number}> = ({x, y, size, ink, scale = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${size * scale})`}>
    <path
      d="M 0 -1 C 0.5 -0.3 0.75 0.1 0.75 0.42 A 0.75 0.75 0 1 1 -0.75 0.42 C -0.75 0.1 -0.5 -0.3 0 -1 Z"
      fill="#8FD3FF"
      stroke={C.ink}
      strokeWidth={ink / size}
      strokeLinejoin="round"
    />
    <ellipse cx={-0.28} cy={0.3} rx={0.13} ry={0.24} fill="#FFFFFF" transform="rotate(20 -0.28 0.3)" />
  </g>
);

/** a Z that floats up, grows, then shrinks away */
export const zLetters = (t: number, t0: number, t1: number | undefined, ox: number, oy: number, hr: number, side: number, ink: number, key: string, k = 1) => {
  const out: React.ReactNode[] = [];
  const life = 1.8;
  const gap = 0.6;
  const shrink = t1 !== undefined ? 1 - easeIn(seg(t, t1, t1 + 0.2)) : 1;
  if (shrink <= 0) return out;
  for (let i = 0; ; i++) {
    const born = t0 + i * gap;
    if (born > t || (t1 !== undefined && born >= t1)) break;
    const age = t - born;
    if (age > life) continue;
    const p = age / life;
    const grow = age < 0.25 ? easeOutBack(age / 0.25) : 1;
    const fade = p > 0.8 ? 1 - easeIn((p - 0.8) / 0.2) : 1;
    const size = k * hr * (0.16 + 0.3 * easeOut(Math.min(1, p * 1.6))) * grow * fade * shrink;
    const x = ox + k * (side * (0.2 + 0.55 * p) * hr + 0.1 * hr * Math.sin(2 * Math.PI * 0.9 * age));
    const y = oy - k * 1.25 * hr * p;
    out.push(
      <text
        key={`${key}${i}`}
        x={x}
        y={y}
        fontFamily={FONT}
        fontSize={size}
        fill="#FFFFFF"
        stroke={C.ink}
        strokeWidth={ink * 0.9}
        strokeLinejoin="round"
        textAnchor="middle"
        transform={`rotate(-12 ${x} ${y})`}
        style={{paintOrder: 'stroke'}}
      >
        Z
      </text>,
    );
  }
  return out;
};

const FaceFx: React.FC<{name: CharName; uid: string; face: Face; ink: number; t: number}> = ({name, uid, face, ink, t}) => {
  const info = SPRITES[name];
  const [hx, hy, hr] = info.head;
  const parts: React.ReactNode[] = [];
  if (face.bags && face.bags > 0.01) parts.push(<Bags key="bags" name={name} s={face.bags} ink={ink} />);
  if (face.eyes) parts.push(<Eyes key="eyes" name={name} uid={uid} st={face.eyes} ink={ink} t={t} />);
  if (face.twitch && face.twitch > 0.01 && Math.floor(t * 12) % 2 === 0) {
    const [bx, by, bw, bh] = info.eyes[1].box;
    const ox = bx + bw * 1.06;
    const oy = by + 0.12 * bh;
    parts.push(
      <g key="tw" stroke={C.ink} strokeWidth={ink * 0.7} strokeLinecap="round">
        {[-40, -10, 20].map((a) => {
          const r = (a * Math.PI) / 180;
          return <line key={a} x1={ox + Math.cos(r) * 0.1 * bw} y1={oy + Math.sin(r) * 0.1 * bw} x2={ox + Math.cos(r) * 0.38 * bw} y2={oy + Math.sin(r) * 0.38 * bw} />;
        })}
      </g>,
    );
  }
  if (face.sweat !== undefined && face.sweat >= 0 && face.sweat <= 1) {
    const s = face.sweat;
    const slide = easeIn(seg(s, 0.15, 0.85));
    const sc = s < 0.15 ? easeOutBack(s / 0.15) : s > 0.85 ? 1 - easeIn((s - 0.85) / 0.15) : 1;
    parts.push(<SweatDrop key="sw" x={hx + (0.78 + 0.08 * slide) * hr} y={hy + (-0.42 + 0.47 * slide) * hr} size={0.15 * hr} ink={ink} scale={sc} />);
  }
  if (face.bubble && t >= face.bubble.t0) {
    const {t0, t1, size = 0.17} = face.bubble;
    const [nx, ny] = info.nose;
    const [dx0, dy0] = BUBBLE_DIR[name];
    const dl = Math.hypot(dx0, dy0);
    const dx = dx0 / dl;
    const dy = dy0 / dl;
    if (t1 === undefined || t < t1) {
      const grow = easeOut(seg(t, t0, t0 + 0.8));
      const R = size * hr * Math.max(0.05, grow) * (1 + 0.14 * Math.sin(2 * Math.PI * 0.55 * (t - t0)));
      const cx = nx + dx * R * 0.9;
      const cy = ny + dy * R * 0.9;
      parts.push(
        <g key="bub">
          <circle cx={cx} cy={cy} r={R} fill="rgba(150, 212, 255, 0.55)" stroke={C.ink} strokeWidth={ink * 0.6} />
          <path
            d={`M ${cx - R * 0.62} ${cy - R * 0.1} A ${R * 0.64} ${R * 0.64} 0 0 1 ${cx - R * 0.15} ${cy - R * 0.6}`}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={ink * 0.7}
            strokeLinecap="round"
          />
        </g>,
      );
    } else if (t < t1 + 0.16) {
      const u = (t - t1) / 0.16;
      const R = size * hr;
      const cx = nx + dx * R * 0.9;
      const cy = ny + dy * R * 0.9;
      parts.push(
        <g key="burst" fill="rgba(150, 212, 255, 0.9)" stroke={C.ink} strokeWidth={ink * 0.4}>
          {Array.from({length: 7}, (_, k) => {
            const a = (k / 7) * 2 * Math.PI + 0.4;
            return <circle key={k} cx={cx + Math.cos(a) * R * (0.9 + 1.1 * u)} cy={cy + Math.sin(a) * R * (0.9 + 1.1 * u)} r={R * 0.13 * (1 - u)} />;
          })}
        </g>,
      );
    }
  }
  if (face.zzz) {
    const [ox, oy] = face.zzz.o ?? [0.8, -0.45];
    parts.push(...zLetters(t, face.zzz.t0, face.zzz.t1, hx + ox * hr, hy + oy * hr, hr, 1, ink, `${uid}z`, face.zzz.k ?? 1));
  }
  return <>{parts}</>;
};

export const Character: React.FC<{
  p: Placed;
  t: number;
  uid: string;
  sx?: number;
  sy?: number;
  rot?: number;
  dx?: number;
  dy?: number;
  face?: Face;
}> = ({p, t, uid, sx = 1, sy = 1, rot = 0, dx = 0, dy = 0, face = {}}) => {
  const info = SPRITES[p.name];
  const w = info.w * p.s;
  const h = info.h * p.s;
  return (
    <div style={{position: 'absolute', left: p.x + dx, top: p.y + dy, transformOrigin: '0 0', transform: `rotate(${rot}deg) scale(${sx}, ${sy})`}}>
      <div style={{position: 'absolute', left: -info.feet[0] * p.s, top: -info.feet[1] * p.s, width: w, height: h}}>
        <Img src={staticFile(`stay-awake/sprites/${p.name}-hero.png`)} style={{width: '100%', height: '100%', display: 'block'}} />
        <svg viewBox={`0 0 ${info.w} ${info.h}`} width={w} height={h} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          <FaceFx name={p.name} uid={uid} face={face} ink={p.ink} t={t} />
        </svg>
      </div>
    </div>
  );
};

/** blink lid amount for a list of blink times (0.16 s each) */
export const blink = (t: number, times: number[], d = 0.16) => {
  for (const b of times) {
    if (t >= b && t < b + d) {
      const u = (t - b) / d;
      return u < 0.4 ? u / 0.4 : u < 0.55 ? 1 : 1 - (u - 0.55) / 0.45;
    }
  }
  return 0;
};

/** breathing about the feet; returns [sx, sy] */
export const breathe = (t: number, phase: number, amp = 0.009): [number, number] => {
  const b = Math.sin(2 * Math.PI * (0.6 * t + phase));
  return [1 - amp * 0.35 * b, 1 + amp * b];
};

