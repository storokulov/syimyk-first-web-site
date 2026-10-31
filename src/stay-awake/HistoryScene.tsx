// 1964, in sepia: a generic student silhouette (not a likeness), a calendar and an hours counter.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp, easeIn, easeOut, easeOutBack, kick, lerp, pop, seg, wave} from './anim';
import {Txt} from './props';
import {T} from './timing';

const PAPER = '#EADBB9';
const INK = '#3D2B1F';
const BROWN = '#9A6A44';
const DARK = '#5C4331';
export const FLIPS = Array.from({length: 10}, (_, i) => 44.45 + i * ((T.eleven - 0.03 - 44.45) / 9));

const Calendar: React.FC<{t: number}> = ({t}) => {
  const passed = FLIPS.filter((f) => t >= f + 0.09).length;
  const flipping = FLIPS.find((f) => t >= f && t < f + 0.09);
  const day = 1 + passed;
  const page = (n: number) => (
    <>
      <rect x={-150} y={-120} width={300} height={290} rx={16} fill="#F7F1E3" stroke={INK} strokeWidth={8} />
      <Txt y={110} size={170} fill={INK} sw={0}>
        {n}
      </Txt>
    </>
  );
  return (
    <g>
      <rect x={-160} y={-190} width={320} height={370} rx={20} fill="#D9C7A2" stroke={INK} strokeWidth={8} />
      {page(flipping !== undefined ? day + 1 : day)}
      {flipping !== undefined && <g transform={`translate(0 -120) scale(1 ${1 - easeIn((t - flipping) / 0.09)}) translate(0 120)`}>{page(day)}</g>}
      <rect x={-160} y={-190} width={320} height={84} rx={20} fill="#B4473A" stroke={INK} strokeWidth={8} />
      <Txt y={-125} size={56} fill="#F7F1E3" sw={0}>
        DAY
      </Txt>
      {[-110, -66, -22, 22, 66, 110].map((x) => (
        <rect key={x} x={x - 9} y={-214} width={18} height={44} rx={9} fill="#8C8C8C" stroke={INK} strokeWidth={6} />
      ))}
    </g>
  );
};

const Student: React.FC<{t: number}> = ({t}) => {
  const p = seg(t, T.stayed, T.eleven + 0.4);
  const droop = 0.12 + 0.48 * p;
  const blinkAt = [44.0, 45.3, 46.4, 47.3, 48.2];
  let lid = droop;
  for (const b of blinkAt) if (t >= b && t < b + 0.3) lid = Math.max(lid, 1 - Math.abs((t - b) / 0.15 - 1));
  const tremble = p > 0.5 ? 2.5 * wave(t, 9) : 0;
  return (
    <g transform={`translate(${tremble} 0)`}>
      <path d="M -210 290 Q -200 80 0 70 Q 200 80 210 290 Z" fill={DARK} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <circle cx={0} cy={-60} r={118} fill={DARK} stroke={INK} strokeWidth={8} />
      {[-44, 44].map((x) => (
        <g key={x}>
          <clipPath id={`st-eye${x}`}>
            <ellipse cx={x} cy={-66} rx={30} ry={36} />
          </clipPath>
          <ellipse cx={x} cy={-66} rx={30} ry={36} fill="#F7F1E3" />
          <g clipPath={`url(#st-eye${x})`}>
            <circle cx={x + 3} cy={-60} r={13} fill={INK} />
            <rect x={x - 40} y={-120} width={80} height={18 + lid * 72} fill={DARK} />
            <line x1={x - 40} y1={-102 + lid * 72} x2={x + 40} y2={-102 + lid * 72} stroke={INK} strokeWidth={6} />
          </g>
          <ellipse cx={x} cy={-66} rx={30} ry={36} fill="none" stroke={INK} strokeWidth={6} />
          {p > 0.3 && <path d={`M ${x - 22} -22 Q ${x} ${-10 + 4 * p} ${x + 22} -22`} fill="none" stroke="#2A1D14" strokeWidth={6} strokeLinecap="round" />}
        </g>
      ))}
    </g>
  );
};

export const HistoryScene: React.FC<{t: number}> = ({t}) => {
  const year = pop(t, T.y1964);
  const drop = easeOutBack(seg(t, 42.45, 42.82));
  const hours = Math.round(264 * Math.pow(seg(t, 44.45, T.hours), 1.15));
  const done = kick(t, T.hours, 0.08, 3, 5);
  const eleven = kick(t, T.eleven, 0.1, 3, 5);
  const burst = clamp(seg(t, T.eleven, T.eleven + 0.45));
  return (
    <AbsoluteFill style={{backgroundColor: PAPER, overflow: 'hidden'}}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
        <defs>
          <radialGradient id="vig" cx="50%" cy="48%" r="70%">
            <stop offset="60%" stopColor={PAPER} stopOpacity={0} />
            <stop offset="100%" stopColor="#B89B68" stopOpacity={0.85} />
          </radialGradient>
        </defs>
        <rect width={1080} height={1920} fill="url(#vig)" />
        {year > 0 && (
          <g transform={`translate(540 300) scale(${year})`}>
            <Txt y={80} size={230} fill={BROWN} sw={12} stroke={INK}>
              1964
            </Txt>
          </g>
        )}
        {t >= 42.45 && (
          <g transform={`translate(540 ${lerp(160, 870, drop)}) rotate(${lerp(-14, -4, drop)})`}>
            <rect x={-300} y={-330} width={600} height={660} fill="#F7F1E3" stroke={INK} strokeWidth={8} />
            <rect x={-258} y={-288} width={516} height={560} fill="#CDB48A" stroke={INK} strokeWidth={6} />
            <clipPath id="photo">
              <rect x={-258} y={-288} width={516} height={560} />
            </clipPath>
            <g clipPath="url(#photo)">
              <g transform="translate(0 30)">
                <Student t={t} />
              </g>
            </g>
          </g>
        )}
        {t >= 44.2 && (
          <g transform={`translate(300 1470) scale(${easeOutBack(seg(t, 44.2, 44.45)) * (1 + eleven)})`}>
            {burst > 0 && burst < 1 && (
              <g stroke="#B4473A" strokeWidth={10} strokeLinecap="round">
                {Array.from({length: 10}, (_, i) => {
                  const a = (i / 10) * 2 * Math.PI;
                  const r0 = 230 + 60 * easeOut(burst);
                  const r1 = r0 + 70 * (1 - burst);
                  return <line key={i} x1={Math.cos(a) * r0} y1={Math.sin(a) * r0} x2={Math.cos(a) * r1} y2={Math.sin(a) * r1} />;
                })}
              </g>
            )}
            <Calendar t={t} />
          </g>
        )}
        {t >= 44.2 && (
          <g transform={`translate(790 1470) scale(${easeOutBack(seg(t, 44.3, 44.55)) * (1 + done)})`}>
            <rect x={-190} y={-150} width={380} height={300} rx={28} fill={INK} stroke="#1E140D" strokeWidth={8} />
            <Txt y={40} size={150} fill="#F2C14E" sw={0}>
              {hours}
            </Txt>
            <Txt y={115} size={56} fill={PAPER} sw={0}>
              HOURS
            </Txt>
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};
