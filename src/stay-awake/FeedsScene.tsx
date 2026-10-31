// The three camera feeds: each contestant drifts off with the eyes open, again and again.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {bounce, easeOut, seg, wave} from './anim';
import {Character, Face} from './Character';
import {Txt} from './props';
import {SPRITES} from './sprites';
import {CUT, T} from './timing';
import {C, Placed} from './world';

type Who = 'max' | 'lily' | 'bob';
const PANELS: {who: Who; y: number; cam: string; asleep: number}[] = [
  {who: 'max', y: 360, cam: 'CAM 1', asleep: T.catch},
  {who: 'lily', y: 960, cam: 'CAM 2', asleep: T.three2},
  {who: 'bob', y: 1560, cam: 'CAM 3', asleep: T.it},
];
const JOLTS = [T.again, T.again2];
const PW = 980;
const PH = 540;
const INK: Record<Who, number> = {max: 11, lily: 9, bob: 10};

const headShot = (who: Who): Placed => {
  const sp = SPRITES[who];
  const s = 215 / sp.head[2];
  return {name: who, x: PW / 2 + (sp.feet[0] - sp.head[0]) * s, y: 300 + (sp.feet[1] - sp.head[1]) * s, s, ink: INK[who]};
};

/** 0 awake .. 1 asleep; every jolt wakes them for 0.3 s, then they drift off again */
const sleepAt = (t: number, start: number) => {
  if (t < start) return 0;
  let a = easeOut(seg(t, start, start + 0.35));
  for (const j of JOLTS) if (t >= j) a = t < j + 0.3 ? a * (1 - easeOut(seg(t, j, j + 0.06))) : easeOut(seg(t, j + 0.3, j + 0.65));
  return a;
};

/** the current stretch of sleep, for the Zs and the snot bubble */
const sleepSpan = (t: number, start: number): {t0: number; t1?: number} | undefined => {
  const spans: [number, number?][] = [[start, JOLTS[0]], [JOLTS[0] + 0.3, JOLTS[1]], [JOLTS[1] + 0.3]];
  for (const [a, b] of spans) if (t >= a && (b === undefined || t < b + 0.25)) return {t0: a, t1: b};
  return undefined;
};

export const FeedsScene: React.FC<{t: number}> = ({t}) => {
  return (
    <AbsoluteFill style={{backgroundColor: '#101233', overflow: 'hidden'}}>
      {PANELS.map((p, i) => {
        const slide = 1 - easeOut(seg(t, CUT.feeds + i * 0.1, CUT.feeds + i * 0.1 + 0.32));
        const a = sleepAt(t, p.asleep);
        const span = t >= p.asleep ? sleepSpan(t, p.asleep) : undefined;
        const face: Face = {
          bags: 1,
          eyes: {
            ps: 1 - 0.38 * a,
            dl: [(-0.16 + 0.03 * wave(t, 0.7, i)) * a, (-0.12 + 0.03 * wave(t, 0.5, i)) * a],
            dr: [(0.14 + 0.03 * wave(t, 0.6, i)) * a, (0.13 + 0.03 * wave(t, 0.8, i)) * a],
          },
        };
        if (span) {
          face.zzz = span;
          face.bubble = {...span, size: 0.16};
        }
        let j = {sx: 1, sy: 1};
        for (const jt of [p.asleep, ...JOLTS]) {
          const b = bounce(t, jt, 0.03);
          j = {sx: j.sx * b.sx, sy: j.sy * b.sy};
        }
        const flash = [p.asleep, ...JOLTS].some((e) => t >= e && t < e + 0.3);
        const tc = `DAY 2  03:14:${String(Math.floor(t * 1.0) % 60).padStart(2, '0')}`;
        return (
          <div key={p.who} style={{position: 'absolute', left: 540 - PW / 2 + slide * 1150, top: p.y - PH / 2, width: PW, height: PH}}>
            <div style={{position: 'absolute', inset: 0, borderRadius: 30, overflow: 'hidden', background: C.wall}}>
              <div style={{position: 'absolute', inset: 0, background: `repeating-linear-gradient(90deg, ${C.wall} 0 90px, ${C.wallStripe} 90px 130px)`}} />
              <Character p={headShot(p.who)} t={t} uid={`feed-${p.who}`} sx={j.sx} sy={j.sy} face={face} />
              <div style={{position: 'absolute', inset: 0, background: 'rgba(14, 12, 48, 0.18)'}} />
            </div>
            <svg width={PW} height={PH} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
              <rect x={0} y={0} width={PW} height={PH} rx={30} fill="none" stroke={flash ? C.red : C.ink} strokeWidth={flash ? 16 : 10} />
              {[
                [34, 34, 1, 1],
                [PW - 34, 34, -1, 1],
                [34, PH - 34, 1, -1],
                [PW - 34, PH - 34, -1, -1],
              ].map(([x, y, dx, dy], k) => (
                <path key={k} d={`M ${x} ${y + dy * 56} L ${x} ${y} L ${x + dx * 56} ${y}`} fill="none" stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
              ))}
              <circle cx={78} cy={84} r={14} fill={Math.floor(t * 2) % 2 === 0 ? '#FF3B3B' : '#7A2A2A'} stroke={C.ink} strokeWidth={4} />
              <Txt x={102} y={100} size={46} fill="#FFFFFF" sw={6} anchor="start">
                REC
              </Txt>
              <Txt x={PW - 64} y={100} size={46} fill="#FFFFFF" sw={6} anchor="end">
                {p.cam}
              </Txt>
              <Txt x={64} y={PH - 54} size={38} fill="#FFFFFF" sw={6} anchor="start">
                {tc}
              </Txt>
            </svg>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
