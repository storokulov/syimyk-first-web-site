// A plain book of records (no real logo): warning sign, the book slams shut, a 1996 stamp lands.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {easeIn, easeOut, kick, pop, seg} from './anim';
import {shake} from './camera';
import {Txt} from './props';
import {T} from './timing';
import {C} from './world';

const CLOSE0 = T.stopped + 0.05;
const CLOSE1 = CLOSE0 + 0.15;
const STAMP = T.y1996;

const Trophy: React.FC = () => (
  <g>
    <path d="M -46 -60 L 46 -60 Q 46 6 0 18 Q -46 6 -46 -60 Z" fill={C.gold} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
    <path d="M -46 -46 Q -84 -46 -70 -14 Q -60 4 -36 0" fill="none" stroke={C.ink} strokeWidth={7} />
    <path d="M 46 -46 Q 84 -46 70 -14 Q 60 4 36 0" fill="none" stroke={C.ink} strokeWidth={7} />
    <rect x={-10} y={16} width={20} height={26} fill={C.gold} stroke={C.ink} strokeWidth={6} />
    <rect x={-38} y={40} width={76} height={20} rx={6} fill="#B8862A" stroke={C.ink} strokeWidth={6} />
  </g>
);

const Lines: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g fill="#DCCFB6">
    {[0, 44, 88, 132, 176].map((dy, i) => (
      <rect key={dy} x={x - 150} y={y + dy} width={i === 4 ? 180 : 300} height={16} rx={8} />
    ))}
  </g>
);

export const BookScene: React.FC<{t: number}> = ({t}) => {
  const sh = shake(t, [
    [CLOSE1, 14, 5],
    [STAMP, 10, 6],
  ]);
  const warn = pop(t, T.harmful, 51.25);
  const closing = seg(t, CLOSE0, CLOSE1);
  const closed = t >= CLOSE1;
  const slam = kick(t, CLOSE1, 0.05, 3, 6);
  const stampIn = t >= STAMP - 0.12 ? 1 + 1.2 * (1 - easeIn(seg(t, STAMP - 0.12, STAMP))) + kick(t, STAMP, 0.05, 3, 7) : 0;
  const dust = seg(t, CLOSE1, CLOSE1 + 0.45);
  return (
    <AbsoluteFill style={{backgroundColor: '#2C3E73', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translate(${sh.x.toFixed(2)}px, ${sh.y.toFixed(2)}px)`}}>
        <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
          <defs>
            <radialGradient id="booklight" cx="50%" cy="52%" r="55%">
              <stop offset="0%" stopColor="#4A62A8" />
              <stop offset="100%" stopColor="#2C3E73" />
            </radialGradient>
          </defs>
          <rect width={1080} height={1920} fill="url(#booklight)" />
          <g transform={`translate(540 1040) scale(${1 + slam})`}>
            {!closed ? (
              <g>
                <rect x={-470} y={-330} width={940} height={660} rx={22} fill="#B03A2E" stroke={C.ink} strokeWidth={10} />
                <path d="M 0 -300 Q -220 -330 -440 -300 L -440 300 Q -220 270 0 300 Z" fill="#FFF7E6" stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
                <Txt x={-220} y={-200} size={66} fill="#B03A2E" sw={0}>
                  RECORDS
                </Txt>
                <g transform="translate(-220 -60)">
                  <Trophy />
                </g>
                <Lines x={-220} y={60} />
                <g transform={`scale(${1 - easeIn(closing)} 1)`}>
                  <path d="M 0 -300 Q 220 -330 440 -300 L 440 300 Q 220 270 0 300 Z" fill="#FFF7E6" stroke={C.ink} strokeWidth={8} strokeLinejoin="round" />
                  <Txt x={220} y={-206} size={54} fill={C.ink} sw={0}>
                    LONGEST
                  </Txt>
                  <Txt x={220} y={-146} size={54} fill={C.ink} sw={0}>
                    TIME AWAKE
                  </Txt>
                  <g transform="translate(220 -30)">
                    <path d="M -90 0 Q 0 -70 90 0 Q 0 70 -90 0 Z" fill="#FFFFFF" stroke={C.ink} strokeWidth={7} />
                    <path d="M -70 4 L -44 -4 M 66 -6 L 44 2" stroke="#D8434A" strokeWidth={5} strokeLinecap="round" />
                    <circle r={24} fill={C.ink} />
                  </g>
                  <Lines x={220} y={70} />
                </g>
                <line x1={0} y1={-300} x2={0} y2={300} stroke={C.ink} strokeWidth={8} />
              </g>
            ) : (
              <g>
                <rect x={-280} y={-340} width={560} height={680} rx={24} fill="#B03A2E" stroke={C.ink} strokeWidth={10} />
                <rect x={-280} y={-340} width={56} height={680} rx={20} fill="#8E2C22" stroke={C.ink} strokeWidth={8} />
                <rect x={-200} y={-280} width={430} height={560} rx={16} fill="none" stroke={C.gold} strokeWidth={10} />
                <g transform="translate(15 -40) scale(1.6)">
                  <Trophy />
                </g>
                <Txt x={15} y={150} size={74} fill={C.gold} sw={0}>
                  RECORDS
                </Txt>
              </g>
            )}
            {dust > 0 && dust < 1 && (
              <g fill="#C9CED8" stroke={C.ink} strokeWidth={5}>
                {[
                  [-300, 330],
                  [-240, 360],
                  [300, 330],
                  [240, 360],
                  [0, 370],
                ].map(([x, y], i) => (
                  <circle key={i} cx={x + Math.sign(x) * 110 * easeOut(dust)} cy={y + 14 * easeOut(dust)} r={62 * Math.sin(Math.PI * dust)} />
                ))}
              </g>
            )}
          </g>
          {warn > 0 && (
            <g transform={`translate(540 520) rotate(${kick(t, T.harmful, 9, 3, 4)}) scale(${warn})`}>
              <path d="M 0 -130 L 142 112 L -142 112 Z" fill={C.yellow} stroke={C.ink} strokeWidth={14} strokeLinejoin="round" />
              <Txt y={92} size={170} fill={C.ink} sw={0}>
                !
              </Txt>
            </g>
          )}
          {stampIn > 0 && (
            <g transform={`translate(560 1110) rotate(-12) scale(${stampIn})`}>
              <rect x={-250} y={-110} width={500} height={220} rx={26} fill="rgba(255, 246, 228, 0.92)" stroke="#D63A2F" strokeWidth={16} />
              <Txt y={60} size={170} fill="#D63A2F" sw={0}>
                1996
              </Txt>
            </g>
          )}
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
