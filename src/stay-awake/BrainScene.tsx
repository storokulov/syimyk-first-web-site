// Inside Max's head: the brain flips its own switch off while a monitor shows the eyes still open.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {during, easeIn, easeInOut, easeOut, lerp, pop, seg, wave} from './anim';
import {shake} from './camera';
import {Character, zLetters} from './Character';
import {Brain, Txt, WallSwitch} from './props';
import {SPRITES} from './sprites';
import {T} from './timing';
import {C, Placed} from './world';

const BG = '#7A2346';
const BLOBS: [number, number, number][] = [
  [130, 260, 90],
  [960, 330, 120],
  [880, 1560, 150],
  [160, 1640, 110],
  [560, 1800, 80],
  [980, 900, 60],
  [90, 900, 70],
];

const BRAIN_X = 350;
const BRAIN_Y = 1180;
const BRAIN_S = 2.6;
const SW_X = 850;
const SW_Y = 1060;
const SW_S = 1.2;
const HANDLE_UP: [number, number] = [SW_X, SW_Y - 96 * SW_S];
const HANDLE_DOWN: [number, number] = [SW_X, SW_Y + 96 * SW_S];
const SHOULDER: [number, number] = [BRAIN_X + 118 * BRAIN_S, BRAIN_Y + 10 * BRAIN_S];

/** hand position for a reach -> push/pull -> retract gesture */
const hand = (t: number, t0: number, from: [number, number], to: [number, number], flip: number): [number, number] | null => {
  if (t < t0 || t > t0 + 0.75) return null;
  const reach = easeOut(seg(t, t0, t0 + 0.25));
  const move = easeIn(seg(t, flip, flip + 0.08));
  const back = easeInOut(seg(t, t0 + 0.5, t0 + 0.75));
  const tx = lerp(from[0], to[0], move);
  const ty = lerp(from[1], to[1], move);
  const x = lerp(SHOULDER[0], tx, reach * (1 - back));
  const y = lerp(SHOULDER[1], ty, reach * (1 - back));
  return Math.hypot(x - SHOULDER[0], y - SHOULDER[1]) < 8 ? null : [x, y];
};

// Max's face on the monitor, eyes centred
const MON_W = 600;
const MON_H = 350;
const maxOnMonitor = (): Placed => {
  const s = 1.15;
  const f = SPRITES.max.feet;
  return {name: 'max', x: MON_W / 2 + (f[0] - 688) * s, y: MON_H / 2 + (f[1] - 650) * s, s, ink: 11};
};

export const BrainScene: React.FC<{t: number}> = ({t}) => {
  const dark = t >= T.shuts + 0.04 && t < T.notice + 0.03;
  let lever = 1;
  if (t >= T.shuts) lever = lerp(1, -1, easeIn(seg(t, T.shuts, T.shuts + 0.08)));
  if (t >= T.notice) lever = lerp(-1, 1, easeIn(seg(t, T.notice, T.notice + 0.08)));
  const h1 = hand(t, T.shuts - 0.32, HANDLE_UP, HANDLE_DOWN, T.shuts);
  const h2 = hand(t, T.notice - 0.31, HANDLE_DOWN, HANDLE_UP, T.notice);
  const hp = h1 ?? h2;
  const eyes = t < T.shuts + 0.04 ? 'open' : t < T.notice ? 'shut' : 'shock';
  const sh = shake(t, [
    [T.shuts, 5, 8],
    [T.notice, 6, 8],
  ]);
  const bob = 8 * wave(t, 0.8) * (dark ? 0.3 : 1);
  const title = pop(t, T.microsleep, 30.35);
  const mon = pop(t, T.eyes2, T.notice + 0.02);
  const bang = pop(t, T.notice + 0.04, 34.68);

  let arm: React.ReactNode = null;
  if (hp) {
    const [x, y] = hp;
    const mx = (SHOULDER[0] + x) / 2;
    const my = Math.min(SHOULDER[1], y) - 90;
    const d = `M ${SHOULDER[0]} ${SHOULDER[1]} Q ${mx} ${my} ${x} ${y}`;
    arm = (
      <g>
        <path d={d} fill="none" stroke={C.ink} strokeWidth={34} strokeLinecap="round" />
        <path d={d} fill="none" stroke="#FF9EBB" strokeWidth={20} strokeLinecap="round" />
        <circle cx={x} cy={y} r={26} fill="#FF9EBB" stroke={C.ink} strokeWidth={7} />
      </g>
    );
  }

  return (
    <AbsoluteFill style={{backgroundColor: BG, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translate(${sh.x.toFixed(2)}px, ${sh.y.toFixed(2)}px)`}}>
        <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
          {BLOBS.map(([x, y, r], i) => (
            <circle key={i} cx={x + 10 * wave(t, 0.2, i * 0.3)} cy={y} r={r} fill="#8B2C55" />
          ))}
          <path d="M 0 1320 Q 300 1260 560 1330 T 1080 1300 L 1080 1920 L 0 1920 Z" fill="#6A1D3D" />
          <g transform={`translate(${SW_X} ${SW_Y}) scale(${SW_S})`}>
            <WallSwitch on={lever} />
          </g>
          <g transform={`translate(${BRAIN_X} ${BRAIN_Y + bob}) scale(${BRAIN_S})`}>
            <Brain eyes={eyes} look={hp ? [0.7, -0.3] : [0.2, 0]} sw={6} />
          </g>
          {arm}
          {eyes === 'shut' && zLetters(t, T.shuts + 0.35, T.notice, BRAIN_X + 140, BRAIN_Y - 250, 190, 1, 10, 'bz')}
          {title > 0 && (
            <g transform={`translate(540 420) rotate(-3) scale(${title})`}>
              <Txt y={42} size={124} fill={C.yellow} sw={14}>
                MICROSLEEP
              </Txt>
            </g>
          )}
          {bang > 0 && (
            <g transform={`translate(${BRAIN_X + 10} ${BRAIN_Y - 330}) scale(${bang})`}>
              <Txt size={230} fill={C.yellow} sw={16}>
                !
              </Txt>
            </g>
          )}
        </svg>
      </AbsoluteFill>
      {dark && <AbsoluteFill style={{backgroundColor: 'rgba(8, 3, 14, 0.84)'}} />}
      {mon > 0 && (
        <AbsoluteFill style={{transform: `translate(540px, 560px) scale(${mon})`, transformOrigin: '0 0'}}>
          <div style={{position: 'absolute', left: -MON_W / 2 - 34, top: -MON_H / 2 - 34, width: MON_W + 68, height: MON_H + 68, borderRadius: 40, background: '#3A3F47', border: `8px solid ${C.ink}`, boxSizing: 'border-box'}} />
          <div style={{position: 'absolute', left: -MON_W / 2, top: -MON_H / 2, width: MON_W, height: MON_H, borderRadius: 18, overflow: 'hidden', background: '#EAC9A0', outline: `6px solid ${C.ink}`}}>
            <Character p={maxOnMonitor()} t={t} uid="monitor-max" face={{eyes: {ps: 0.8, look: [0.12 * wave(t, 0.35), 0.06 * wave(t, 0.5)]}}} />
            <div style={{position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.07) 0 3px, transparent 3px 7px)'}} />
          </div>
          <div style={{position: 'absolute', left: MON_W / 2 - 4, top: -MON_H / 2 - 22, width: 26, height: 26, borderRadius: 13, background: during(t, T.eyes2, 40) && Math.floor(t * 2) % 2 === 0 ? '#FF3B3B' : '#6E2A2A', border: `5px solid ${C.ink}`}} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
