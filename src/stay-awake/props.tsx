// Props and set pieces drawn in code, in the same flat style as the pictures:
// thick even black outlines, flat fills, one simple shade. Local units = world px unless noted.
import React from 'react';
import {C, FONT} from './world';

export const Txt: React.FC<{
  x?: number;
  y?: number;
  size: number;
  fill: string;
  sw: number;
  stroke?: string;
  anchor?: 'start' | 'middle' | 'end';
  fit?: number; // squeeze the text to exactly this width
  children: React.ReactNode;
}> = ({x = 0, y = 0, size, fill, sw, stroke = C.ink, anchor = 'middle', fit, children}) => (
  <text
    x={x}
    y={y}
    textLength={fit}
    lengthAdjust={fit ? 'spacingAndGlyphs' : undefined}
    fontFamily={FONT}
    fontSize={size}
    fill={fill}
    stroke={stroke}
    strokeWidth={sw}
    strokeLinejoin="round"
    textAnchor={anchor}
    style={{paintOrder: 'stroke'}}
  >
    {children}
  </text>
);

// ---------------------------------------------------------------- studio

const SIGN_BULBS: [number, number][] = (() => {
  const b: [number, number][] = [];
  for (let x = -1160; x <= 1160; x += 145) b.push([x, -372], [x, 372]);
  for (let y = -225; y <= 225; y += 150) b.push([-1212, y], [1212, y]);
  return b;
})();

/** back wall with the prize sign; flip = sign plate scaleY, pulse = whole sign scale */
export const Wall: React.FC<{t: number; text: string; flip: number; pulse: number; allOn: boolean}> = ({t, text, flip, pulse, allOn}) => {
  const stripes: React.ReactNode[] = [];
  for (let x = -4860; x < 6000; x += 360) stripes.push(<rect key={x} x={x} y={-5000} width={120} height={8000} fill={C.wallStripe} />);
  const step = Math.floor(t * 4);
  return (
    <g>
      <rect x={-5000} y={-5000} width={11000} height={8000} fill={C.wall} />
      {stripes}
      <g transform={`translate(540 -1100) scale(${pulse})`}>
        <rect x={-1290} y={-450} width={2580} height={900} rx={96} fill="#B5222B" stroke={C.ink} strokeWidth={14} />
        {SIGN_BULBS.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={34} fill={allOn || (i + step) % 3 === 0 ? '#FFF1A8' : '#C98A2E'} stroke={C.ink} strokeWidth={8} />
        ))}
        <g transform={`scale(1 ${Math.max(0.001, flip)})`}>
          <rect x={-1120} y={-300} width={2240} height={600} rx={56} fill={C.yellow} stroke={C.ink} strokeWidth={12} />
          <Txt y={150} size={400} fill={C.green} sw={20} fit={text.length > 4 ? 1980 : undefined}>
            {text}
          </Txt>
        </g>
      </g>
    </g>
  );
};

export const Curtains: React.FC = () => {
  const one = (side: -1 | 1) => {
    const inner = side < 0 ? -330 : 1410;
    const outer = side < 0 ? -2600 : 3680;
    let d = `M ${outer} -3400 L ${inner} -3400`;
    for (let y = -3400, i = 0; y < 2800; y += 220, i++) d += ` Q ${inner + side * (i % 2 ? -46 : 46)} ${y + 110} ${inner} ${y + 220}`;
    d += ` L ${outer} 3000 Z`;
    return (
      <g key={side}>
        <path d={d} fill={C.curtain} />
        {[1, 2, 3, 4].map((i) => (
          <rect key={i} x={inner + side * i * 250 - 35} y={-3400} width={70} height={6400} fill={C.curtainDark} />
        ))}
        <path d={d} fill="none" stroke={C.ink} strokeWidth={12} />
      </g>
    );
  };
  return (
    <g>
      {one(-1)}
      {one(1)}
    </g>
  );
};

const Star: React.FC<{x: number; y: number; r: number; sw: number}> = ({x, y, r, sw}) => {
  const pts = Array.from({length: 10}, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    return `${x + Math.cos(a) * rr},${y + Math.sin(a) * rr}`;
  }).join(' ');
  return <polygon points={pts} fill={C.gold} stroke={C.ink} strokeWidth={sw} strokeLinejoin="round" />;
};

/** stage front with the challenge banner + floor; bulbs chase along the gold edge */
export const StageFace: React.FC<{t: number}> = ({t}) => {
  const bulbs: React.ReactNode[] = [];
  const step = Math.floor(t * 5);
  for (let x = -2400, i = 0; x <= 3500; x += 90, i++)
    bulbs.push(<circle key={x} cx={x} cy={830} r={12} fill={(i + step) % 3 === 0 ? '#FFF3B8' : '#B98A3A'} stroke={C.ink} strokeWidth={5} />);
  const panels: React.ReactNode[] = [];
  for (let x = -2400; x <= 3500; x += 240) panels.push(<line key={x} x1={x} y1={1130} x2={x} y2={1890} stroke={C.purpleDark} strokeWidth={9} />);
  const boards: React.ReactNode[] = [];
  for (let y = 1990, i = 0; y < 4000; y += 120 + i * 30, i++) boards.push(<line key={y} x1={-2600} y1={y} x2={3700} y2={y} stroke={C.floorDark} strokeWidth={8} />);
  return (
    <g>
      <rect x={-2600} y={820} width={6300} height={1070} fill={C.purple} />
      {panels}
      <rect x={-2600} y={1890} width={6300} height={3000} fill={C.floor} />
      {boards}
      <line x1={-2600} y1={1890} x2={3700} y2={1890} stroke={C.ink} strokeWidth={7} />
      <rect x={-2600} y={806} width={6300} height={48} fill={C.gold} stroke={C.ink} strokeWidth={6} />
      {bulbs}
      <rect x={-110} y={900} width={1300} height={190} rx={36} fill="#1E2766" stroke={C.ink} strokeWidth={7} />
      <rect x={-92} y={918} width={1264} height={154} rx={26} fill="none" stroke={C.gold} strokeWidth={6} />
      <Txt x={540} y={1036} size={112} fill={C.yellow} sw={12} fit={1150}>
        LAST ONE AWAKE WINS
      </Txt>
      <Star x={-40} y={1420} r={120} sw={7} />
      <Star x={1120} y={1420} r={120} sw={7} />
    </g>
  );
};

/** contestant podium; anchor = middle of the top surface */
export const Podium: React.FC<{x: number; y: number; name: string; w?: number; h?: number; sw?: number}> = ({x, y, name, w = 360, h = 210, sw = 5}) => {
  const body = `M ${-w / 2} 8 L ${w / 2} 8 L ${w / 2 - 16} ${h} L ${-w / 2 + 16} ${h} Z`;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={body} fill={C.blue} />
      <path d={`M ${w / 2 - 54} 8 L ${w / 2} 8 L ${w / 2 - 16} ${h} L ${w / 2 - 66} ${h} Z`} fill={C.blueShade} />
      <rect x={-w / 2 + 10} y={h - 52} width={w - 20} height={24} fill={C.gold} stroke={C.ink} strokeWidth={sw * 0.8} />
      <path d={body} fill="none" stroke={C.ink} strokeWidth={sw} strokeLinejoin="round" />
      <rect x={-w / 2 - 16} y={-13} width={w + 32} height={28} rx={11} fill={C.blueLip} stroke={C.ink} strokeWidth={sw} />
      <rect x={-112} y={40} width={224} height={76} rx={15} fill={C.cream} stroke={C.ink} strokeWidth={sw} />
      <Txt y={99} size={58} fill={C.blue} sw={0}>
        {name}
      </Txt>
    </g>
  );
};

// ---------------------------------------------------------------- props

/** metal bin; anchor = middle of the rim */
export const Bin: React.FC<{sw?: number}> = ({sw = 5.5}) => (
  <g>
    <path d="M -150 18 L 150 18 L 124 430 L -124 430 Z" fill={C.steel} stroke={C.ink} strokeWidth={sw} strokeLinejoin="round" />
    <path d="M 96 18 L 150 18 L 124 430 L 78 430 Z" fill={C.steelDark} />
    {[-90, -30, 30].map((x) => (
      <line key={x} x1={x} y1={50} x2={x * 0.84} y2={400} stroke={C.steelDark} strokeWidth={11} strokeLinecap="round" />
    ))}
    <path d="M -150 18 L 150 18 L 124 430 L -124 430 Z" fill="none" stroke={C.ink} strokeWidth={sw} strokeLinejoin="round" />
    <rect x={-166} y={-8} width={332} height={34} rx={14} fill={C.steelLight} stroke={C.ink} strokeWidth={sw} />
    <ellipse cx={0} cy={-6} rx={150} ry={15} fill="#3A4048" stroke={C.ink} strokeWidth={sw * 0.8} />
  </g>
);

export const Phone: React.FC<{sw?: number}> = ({sw = 4.5}) => (
  <g>
    <rect x={-35} y={-64} width={70} height={128} rx={15} fill="#26262B" stroke={C.ink} strokeWidth={sw} />
    <rect x={-26} y={-51} width={52} height={96} rx={6} fill="#5BB6F2" />
    <path d="M -18 -40 L 4 -40 L -18 -14 Z" fill="#9AD6FF" />
    <circle cx={0} cy={54} r={4.5} fill="#55555C" />
  </g>
);

export const Pillow: React.FC<{sw?: number}> = ({sw = 5}) => (
  <g>
    <path d="M -150 -92 Q -60 -70 0 -82 Q 60 -70 150 -92 Q 128 0 150 92 Q 60 70 0 82 Q -60 70 -150 92 Q -128 0 -150 -92 Z" fill="#EAF1FF" stroke={C.ink} strokeWidth={sw} strokeLinejoin="round" />
    <path d="M 100 -64 Q 124 0 100 64 Q 40 58 -20 66" fill="none" stroke="#C3D2EE" strokeWidth={20} strokeLinecap="round" />
    <path d="M -96 -46 Q -70 -30 -88 -6 M 96 50 Q 72 34 88 12" fill="none" stroke="#9FB2D6" strokeWidth={6} strokeLinecap="round" />
  </g>
);

/**
 * Studio camera on a short pole. Anchor = pole base. angle = degrees the lens points to
 * (0 = right, negative = up). eye = 0 shut .. 1 open; look = pupil offset (-1..1).
 */
export const CamProp: React.FC<{angle: number; eye: number; look?: [number, number]; rec: boolean; sw?: number}> = ({angle, eye, look = [0.5, -0.1], rec, sw = 5}) => (
  <g>
    <line x1={0} y1={-4} x2={0} y2={-78} stroke={C.ink} strokeWidth={sw * 2 + 10} strokeLinecap="round" />
    <line x1={0} y1={-4} x2={0} y2={-78} stroke="#5B616B" strokeWidth={10} strokeLinecap="round" />
    <g transform={`translate(0 -100) rotate(${angle})`}>
      <rect x={-64} y={-42} width={112} height={84} rx={17} fill="#4A505A" stroke={C.ink} strokeWidth={sw} />
      <rect x={42} y={-27} width={44} height={54} rx={8} fill="#363B43" stroke={C.ink} strokeWidth={sw} />
      <rect x={82} y={-33} width={15} height={66} rx={5} fill="#262A30" stroke={C.ink} strokeWidth={sw} />
      <rect x={-44} y={-60} width={52} height={20} rx={6} fill="#363B43" stroke={C.ink} strokeWidth={sw} />
      <circle cx={-50} cy={-26} r={9} fill={rec ? '#FF3B3B' : '#6E2A2A'} stroke={C.ink} strokeWidth={sw * 0.7} />
      <g transform="translate(-12 6)">
        {eye > 0.12 ? (
          <>
            <ellipse rx={25} ry={25 * eye} fill="#FFFFFF" stroke={C.ink} strokeWidth={sw * 0.8} />
            <circle cx={look[0] * 9} cy={look[1] * 9 * eye} r={11 * Math.min(1, eye * 1.3)} fill={C.ink} />
          </>
        ) : (
          <path d="M -22 -2 Q 0 9 22 -2" fill="none" stroke={C.ink} strokeWidth={sw} strokeLinecap="round" />
        )}
      </g>
    </g>
  </g>
);

/** anchor = bottom middle */
export const Chips: React.FC<{color?: string; sw?: number}> = ({color = '#FF4D4D', sw = 4.5}) => {
  let zig = 'M -44 -112';
  for (let i = 1; i <= 8; i++) zig += ` L ${-44 + i * 11} ${i % 2 ? -122 : -112}`;
  return (
    <g>
      <path d="M -42 -112 L 42 -112 Q 54 -60 46 -6 L -46 -6 Q -54 -60 -42 -112 Z" fill={color} stroke={C.ink} strokeWidth={sw} strokeLinejoin="round" />
      <path d={`${zig} L 44 -106 L -44 -106 Z`} fill="#FFFFFF" stroke={C.ink} strokeWidth={sw * 0.8} strokeLinejoin="round" />
      <circle cx={0} cy={-58} r={22} fill={C.yellow} stroke={C.ink} strokeWidth={sw * 0.7} />
      <ellipse cx={0} cy={-58} rx={11} ry={8} fill="#F29A2E" />
    </g>
  );
};

/** anchor = bottom middle */
export const Mug: React.FC<{sw?: number}> = ({sw = 4.5}) => (
  <g>
    <path d="M 28 -60 C 58 -60 58 -22 26 -22" fill="none" stroke={C.ink} strokeWidth={sw * 2 + 10} strokeLinecap="round" />
    <path d="M 28 -60 C 58 -60 58 -22 26 -22" fill="none" stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" />
    <path d="M -32 -78 L 32 -78 L 28 -8 Q 0 2 -28 -8 Z" fill="#FFFFFF" stroke={C.ink} strokeWidth={sw} strokeLinejoin="round" />
    <path d="M 14 -76 L 30 -76 L 27 -10 Q 20 -6 12 -5 Z" fill="#E3E7EE" />
    <ellipse cx={0} cy={-78} rx={32} ry={8} fill="#6B3E26" stroke={C.ink} strokeWidth={sw * 0.9} />
  </g>
);

/** speech bubble whose tail tip is at (0, 0); flip mirrors the tail side */
export const Speech: React.FC<{text: string; sw?: number; flip?: boolean}> = ({text, sw = 5, flip = false}) => (
  <g>
    <path
      d="M 16 -58 A 112 72 0 1 0 -60 -58 L 0 0 Z"
      fill="#FFFFFF"
      stroke={C.ink}
      strokeWidth={sw}
      strokeLinejoin="round"
      transform={flip ? 'scale(-1 1)' : undefined}
    />
    <Txt x={flip ? 22 : -22} y={-102} size={74} fill={C.ink} sw={0}>
      {text}
    </Txt>
  </g>
);

/** anchor = bottom middle */
export const QMark: React.FC<{size?: number; sw?: number}> = ({size = 150, sw = 9}) => (
  <Txt size={size} fill={C.yellow} sw={sw}>
    ?
  </Txt>
);

export const Bill: React.FC<{sw?: number}> = ({sw = 3.5}) => (
  <g>
    <rect x={-48} y={-24} width={96} height={48} rx={5} fill="#9BDDB1" stroke={C.ink} strokeWidth={sw} />
    <rect x={-38} y={-15} width={76} height={30} rx={3} fill="none" stroke="#4E9E6B" strokeWidth={3} />
    <circle r={10} fill="#6CC08A" stroke="#4E9E6B" strokeWidth={3} />
  </g>
);

// ---------------------------------------------------------------- brain

const BRAIN_BLOBS: [number, number, number][] = [
  [-82, 8, 58],
  [-48, -40, 60],
  [6, -56, 64],
  [62, -38, 60],
  [94, 14, 54],
  [56, 50, 56],
  [-4, 58, 58],
  [-66, 50, 50],
  [0, 0, 80],
];

/**
 * Brain character, anchor = centre, about 300 x 230 local units.
 * eyes: 'open' | 'shut' (sleeping arcs) | 'shock'; yawn 0..1.
 */
export const Brain: React.FC<{eyes?: 'open' | 'shut' | 'shock'; yawn?: number; look?: [number, number]; sw?: number}> = ({
  eyes = 'open',
  yawn = 0,
  look = [0, 0],
  sw = 6,
}) => {
  const squint = yawn > 0.5 ? (yawn - 0.5) * 2 : 0;
  return (
    <g>
      {BRAIN_BLOBS.map(([x, y, r], i) => (
        <circle key={`o${i}`} cx={x} cy={y} r={r + sw / 2} fill={C.ink} />
      ))}
      {BRAIN_BLOBS.map(([x, y, r], i) => (
        <circle key={`f${i}`} cx={x} cy={y} r={r - sw / 2} fill="#FF9EBB" />
      ))}
      <path d="M 40 -70 Q 90 -60 110 -10 Q 116 40 70 80" fill="none" stroke="#F07CA0" strokeWidth={26} strokeLinecap="round" opacity={0.9} />
      <g fill="none" stroke="#D45C84" strokeWidth={sw * 0.9} strokeLinecap="round">
        <path d="M -96 -10 Q -80 -40 -52 -30" />
        <path d="M -30 -70 Q -6 -88 18 -72" />
        <path d="M 48 -66 Q 80 -60 84 -30" />
        <path d="M 92 30 Q 80 56 56 60" />
        <path d="M -88 46 Q -66 70 -40 62" />
      </g>
      {eyes === 'shut' ? (
        <g fill="none" stroke={C.ink} strokeWidth={sw} strokeLinecap="round">
          <path d="M -46 2 Q -30 14 -14 2" />
          <path d="M 14 2 Q 30 14 46 2" />
        </g>
      ) : (
        [-30, 30].map((x) => {
          const big = eyes === 'shock';
          const ry = (big ? 28 : 23) * (1 - 0.85 * squint);
          return (
            <g key={x}>
              <ellipse cx={x} cy={0} rx={big ? 24 : 19} ry={ry} fill="#FFFFFF" stroke={C.ink} strokeWidth={sw * 0.8} />
              {ry > 6 && <circle cx={x + look[0] * 7} cy={look[1] * 7} r={big ? 6 : 9} fill={C.ink} />}
            </g>
          );
        })
      )}
      {yawn > 0.05 ? (
        <g>
          <ellipse cx={0} cy={46} rx={14 + 8 * yawn} ry={5 + 22 * yawn} fill="#7A1F3D" stroke={C.ink} strokeWidth={sw * 0.8} />
          <ellipse cx={0} cy={46 + 14 * yawn} rx={8 + 4 * yawn} ry={4 + 5 * yawn} fill="#FF6F91" />
        </g>
      ) : (
        <path d="M -16 40 Q 0 52 16 40" fill="none" stroke={C.ink} strokeWidth={sw * 0.8} strokeLinecap="round" />
      )}
    </g>
  );
};

/** big wall switch, anchor = centre; on = 1 lever up, -1 lever down (passes through 0 while flipping) */
export const WallSwitch: React.FC<{on: number; sw?: number}> = ({on, sw = 7}) => (
  <g>
    <rect x={-120} y={-210} width={240} height={420} rx={30} fill="#F2F2F2" stroke={C.ink} strokeWidth={sw} />
    <rect x={-30} y={-112} width={60} height={224} rx={24} fill="#2E2E33" stroke={C.ink} strokeWidth={sw * 0.8} />
    <g transform={`scale(1 ${-on || 0.001})`}>
      <rect x={-26} y={0} width={52} height={118} rx={20} fill="#E2423B" stroke={C.ink} strokeWidth={sw} />
      <rect x={-16} y={84} width={32} height={22} rx={8} fill="#FF8A80" />
    </g>
    <Txt y={-140} size={56} fill={C.green} sw={0}>
      ON
    </Txt>
    <Txt y={186} size={56} fill={C.red} sw={0}>
      OFF
    </Txt>
  </g>
);

/** full-screen title card that slides in from the left and out to the right (screen units) */
export const SlideCard: React.FC<{text: string; x: number; y: number; w?: number; h?: number; size?: number; color?: string}> = ({
  text,
  x,
  y,
  w = 640,
  h = 230,
  size = 156,
  color = C.yellow,
}) => (
  <g transform={`translate(${x} ${y}) rotate(-3)`}>
    <rect x={-w / 2 + 14} y={-h / 2 + 16} width={w} height={h} rx={34} fill={C.ink} />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={34} fill={color} stroke={C.ink} strokeWidth={10} />
    <Txt y={size * 0.36} size={size} fill={C.blue} sw={0}>
      {text}
    </Txt>
  </g>
);
