// The studio: one continuous 2.5D world for every shot that happens in the room.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {bounce, clamp, during, easeIn, easeInOut, easeOut, easeOutBack, kick, lerp, pop, seg, spring, wave} from './anim';
import {Cam, Layer, scaleAt, shake, track, W} from './camera';
import {blink, breathe, Character, EyeState, Face} from './Character';
import {Bill, Bin, Brain, CamProp, Chips, Curtains, Mug, Phone, Pillow, Podium, QMark, SlideCard, Speech, StageFace, Wall} from './props';
import {HOST_CASH} from './sprites';
import {T} from './timing';
import {C, CAST, eyesWorld, headWorld, HOST, PODIUM_TOP, toWorld, Z} from './world';

type Who = 'max' | 'bob' | 'lily';
const WHO: Who[] = ['max', 'bob', 'lily'];

// ------------------------------------------------------------------ camera

const REST: Cam = {x: 540, y: 960, z: 0}; // frame 0 and the last frame
const PUSH0: Cam = {x: 540, y: 945, z: 70};
const CU_BRAIN: Cam = {x: -35, y: 335, z: 1144}; // Max's head, room above it for the brain
const STAGE: Cam = {x: 540, y: 558, z: 311}; // the three contestants
const STAGE_B: Cam = {x: 540, y: 547, z: 367};
const CU_STARE: Cam = {x: -4, y: 366, z: 1397}; // Max's face
const CU_STARE_B: Cam = {x: -4, y: 360, z: 1422};
const ROOM_B: Cam = {x: 540, y: 945, z: 60};
const CU_HOST: Cam = {x: 539, y: 1370, z: 474};

const camAt = track(
  REST,
  [
    {t0: 0, t1: 4.0, to: PUSH0},
    {t0: 5.55, t1: 6.45, to: CU_BRAIN},
    {t0: 8.3, t1: 9.15, to: STAGE},
    {t0: 12.3, t1: 13.4, to: STAGE_B},
    {t0: 21.3, t1: 22.35, to: CU_STARE},
    {t0: 24.4, t1: 25.5, to: CU_STARE_B},
    {t0: 54.18, t1: 54.18, to: ROOM_B},
    {t0: 58.3, t1: 60.4, to: CU_HOST, zRef: Z.host},
    {t0: 63.1, t1: 64.5, to: REST, zRef: Z.host},
  ],
  Z.cast,
);

const SHAKES: [number, number, number?][] = [
  [11.24, 3, 8], // phones land in the bin
  [11.33, 3, 8],
  [11.42, 3, 8],
  [34.75, 4, 8],
  [57.25, 16, 4.5],
  [62.96, 5, 7],
];

// ------------------------------------------------------------------ timeline data

const PHASE: Record<Who, number> = {max: 0, bob: 0.33, lily: 0.66};
const THREE_AT: Record<Who, number> = {max: 9.2, bob: 9.32, lily: 9.44};
const HA_AT: Record<Who, number> = {max: T.jokes, lily: T.jokes + 0.19, bob: T.jokes + 0.36};
const BAGS_AT: Record<Who, number> = {max: 20.26, lily: 20.4, bob: 20.55};
const BAGS_OFF: Record<Who, number> = {max: 63.3, lily: 63.38, bob: 63.46};
const NOBODY_SWEAT: Record<Who, number> = {max: 57.4, bob: 57.52, lily: 57.64};
const BLINKS: Record<Who | 'host', number[]> = {
  max: [2.3, 5.2, 9.9, 13.95, 16.2, 19.1],
  bob: [3.4, 10.9, 15.6, 24.0, 55.9, 60.0],
  lily: [3.1, 7.6, 12.2, 15.2, 18.2, 23.0, 55.5, 59.4],
  host: [1.6, 4.9, 6.9, 55.4, 58.6],
};
const LOOK_CAM: Record<Who, [number, number]> = {max: [-0.12, 0.2], bob: [-0.12, 0.2], lily: [-0.1, 0.2]};
const QMARK_AT: Record<Who, number> = {max: 54.55, bob: 54.7, lily: 54.85};

const CAMS: {who: Who; x: number; rise: number; eye: number}[] = [
  {who: 'max', x: -130, rise: T.camera, eye: 12.98},
  {who: 'bob', x: 400, rise: T.camera + 0.1, eye: 13.12},
  {who: 'lily', x: 940, rise: T.camera + 0.2, eye: 13.26},
];

const BIN_RIM = 1150;
const PHONES = [
  {from: 0, t0: 10.62},
  {from: 540, t0: 10.71},
  {from: 1080, t0: 10.8},
];
const PHONE_FLIGHT = 0.62;
const PHONE_START_Y = 560;

const sign = (t: number) => {
  // flips: to $0 at 57.2, back at 63.5; each flip edge-on at +0.12 s
  const flips = [57.2, 63.5];
  let text = '$100,000';
  let flip = 1;
  for (const [i, tf] of flips.entries()) {
    if (t < tf) break;
    const half = tf + 0.12;
    if (t < half) flip = 1 - easeIn(seg(t, tf, half));
    else {
      text = i % 2 === 0 ? '$0' : '$100,000';
      flip = t < half + 0.3 ? easeOutBack(seg(t, half, half + 0.3)) : 1;
    }
  }
  return {text, flip};
};

const dimAt = (t: number) => {
  if (t < T.day2) return 0;
  const flicker = t < 20.45 && Math.floor(t * 24) % 3 === 0 ? 0.16 : 0;
  return 0.2 * easeOut(seg(t, T.day2, 20.3)) * (1 - easeOut(seg(t, 63.3, 63.55))) + flicker;
};

/** pupils drift apart while asleep with the eyes open */
const derpy = (t: number, amount: number, ps: number): EyeState => ({
  ps: lerp(1, ps, amount),
  dl: [(-0.16 + 0.03 * wave(t, 0.7)) * amount, (-0.12 + 0.03 * wave(t, 0.5, 0.3)) * amount],
  dr: [(0.14 + 0.03 * wave(t, 0.6, 0.5)) * amount, (0.13 + 0.03 * wave(t, 0.8, 0.1)) * amount],
});

// ------------------------------------------------------------------ cast

const castPose = (who: Who, t: number) => {
  let [sx, sy] = breathe(t, PHASE[who]);
  let dx = 0;
  const b = bounce(t, THREE_AT[who], 0.07);
  sx *= b.sx;
  sy *= b.sy;
  const ha = HA_AT[who];
  if (t > ha && t < ha + 0.9) sy *= 1 + 0.03 * Math.abs(Math.sin(2 * Math.PI * 4.2 * (t - ha))) * (1 - (t - ha) / 0.9);
  const tired = easeInOut(seg(t, T.day2, 20.6)) * (1 - easeOut(seg(t, 63.3, 63.7)));
  sy *= 1 - 0.015 * tired;
  dx += tired * (1.2 * wave(t, 9.3, PHASE[who]) + 0.8 * wave(t, 5.1, PHASE[who] + 0.2));
  const deflate = easeOut(seg(t, T.nobody, 57.6)) * (1 - easeOutBack(seg(t, 63.3, 63.65)));
  sy *= 1 - 0.045 * deflate;
  sx *= 1 + 0.02 * deflate;
  if (who === 'max') {
    const j = bounce(t, 34.75, 0.03);
    sx *= j.sx;
    sy *= j.sy;
  }

  const face: Face = {};
  const bags = pop(t, BAGS_AT[who], BAGS_OFF[who]);
  if (bags > 0) face.bags = bags;
  const eyes: EyeState = {};
  let on = false;
  const lid = blink(t, BLINKS[who], who === 'bob' ? 0.3 : 0.16);
  if (lid > 0) {
    eyes.lid = lid;
    on = true;
  }
  const lk = easeInOut(seg(t, 12.85, 13.1)) * (1 - easeInOut(seg(t, 13.8, 14.05)));
  if (lk > 0) {
    eyes.look = [LOOK_CAM[who][0] * lk, LOOK_CAM[who][1] * lk];
    on = true;
  }
  if (t >= T.nobody && t < 63.3) {
    eyes.look = [0, 0.18 * easeOut(seg(t, T.nobody, 57.6)) * (1 - easeOut(seg(t, 63.0, 63.3)))];
    on = true;
  }
  if (who === 'bob' && during(t, T.coffee, T.coffee + 0.9)) {
    face.twitch = 1;
    eyes.lidR = Math.sin(2 * Math.PI * 7 * (t - T.coffee)) > 0.2 ? 0.5 : 0.1;
    on = true;
  }
  if (who === 'lily' && during(t, T.weird, T.weird + 1.3)) face.sweat = (t - T.weird) / 1.3;
  if (during(t, NOBODY_SWEAT[who], NOBODY_SWEAT[who] + 1.4)) face.sweat = (t - NOBODY_SWEAT[who]) / 1.4;

  if (who === 'max' && t >= 21.2 && t < 36.3) {
    // the stare, the microsleep and the snap back
    on = true;
    const derp = easeOut(seg(t, T.asleep, 27.5)) * (1 - easeOut(seg(t, 34.75, 34.85)));
    let ps = 1 - 0.45 * easeOut(seg(t, 22.5, 22.9)) - 0.13 * spring(t, T.eyesOpen, 2.5, 7);
    ps = lerp(ps, 0.62, derp);
    ps = lerp(ps, 1, easeOut(seg(t, 34.75, 34.87)));
    const d = derpy(t, derp, 1);
    eyes.ps = ps;
    eyes.dl = d.dl;
    eyes.dr = d.dr;
    eyes.veins = easeOut(seg(t, 22.9, 23.7));
    eyes.tremble = t > 22.9 && t < 34.75 ? 2.5 * (1 - derp) : 0;
    const gl =
      t < 35.0
        ? 0
        : t < 35.4
          ? -0.2 * easeInOut(seg(t, 35.0, 35.2))
          : t < 35.8
            ? lerp(-0.2, 0.2, easeInOut(seg(t, 35.4, 35.6)))
            : lerp(0.2, 0, easeInOut(seg(t, 35.8, 36.0)));
    eyes.look = [gl, 0];
    face.zzz = {t0: T.asleep + 0.04, t1: 34.75, o: [0.42, -0.08], k: 0.55};
    face.bubble = {t0: T.asleep + 0.1, t1: 34.75, size: 0.17};
  }
  if (on) face.eyes = eyes;
  return {sx, sy, dx, face};
};

const hostPose = (t: number) => {
  let [sx, sy] = breathe(t, 0.15);
  const b = bounce(t, T.win, 0.05);
  sx *= b.sx;
  sy *= b.sy;
  const j = bounce(t, T.would, 0.06);
  sx *= j.sx;
  sy *= j.sy;
  const asleep = easeInOut(seg(t, T.including, 61.6)) * (1 - easeOut(seg(t, T.would, T.would + 0.2)));
  const rot = 3.5 * asleep + 1.2 * asleep * Math.sin(2 * Math.PI * 0.5 * (t - T.including));
  const face: Face = {};
  const derp = easeOut(seg(t, T.including, T.including + 0.4)) * (1 - easeOut(seg(t, T.would, T.would + 0.1)));
  const lid = blink(t, BLINKS.host);
  if (derp > 0) face.eyes = derpy(t, derp, 0.7);
  else if (lid > 0) face.eyes = {lid};
  if (t >= T.including) {
    face.zzz = {t0: T.including + 0.1, t1: T.would};
    face.bubble = {t0: T.including + 0.15, t1: T.would, size: 0.16};
  }
  return {sx, sy, rot, face};
};

// ------------------------------------------------------------------ scene

export const RoomScene: React.FC<{t: number}> = ({t}) => {
  const cam = camAt(t);
  const sh = shake(t, SHAKES);
  const kc = scaleAt(cam, Z.cast);
  const kh = scaleAt(cam, Z.host);
  const close = clamp((kc - 0.8) / 0.8);
  const hostClose = t > 54 ? clamp((kh - 1.15) / 0.65) : 0;
  const farBlur = 3.2 * Math.max(close, hostClose);
  const stageBlur = 4 * hostClose;
  const nearBlur = Math.max(stageBlur, 2.6 * clamp((kc - 1.6) / 1.2)); // podium + cameras in front of a close-up
  const hostOn = t < 8.0 || t >= 54.18;
  const {text, flip} = sign(t);
  const dim = dimAt(t);

  // --- brain peeking out of Max's head
  let brainEl: React.ReactNode = null;
  if (during(t, 6.55, 8.6)) {
    const [hx, hy] = headWorld(CAST.max);
    const rise = easeOutBack(seg(t, T.brain, T.brain + 0.3)) * (1 - easeIn(seg(t, 8.25, 8.5)));
    const yawn = t < 7.1 ? 0 : t < 7.45 ? easeOut(seg(t, 7.1, 7.45)) : t < 7.95 ? 1 : 1 - easeIn(seg(t, 7.95, 8.15));
    const st = 1 + 0.06 * yawn;
    brainEl = (
      <W>
        <g transform={`translate(${hx + 10} ${lerp(hy + 40, 10, rise)}) scale(${0.75 / Math.sqrt(st)} ${0.75 * st})`}>
          <Brain yawn={yawn} look={[0.3, 0.2]} />
        </g>
      </W>
    );
  }

  // --- contestants
  const castEls = WHO.map((who) => {
    const st = castPose(who, t);
    return <Character key={who} p={CAST[who]} t={t} uid={`room-${who}`} sx={st.sx} sy={st.sy} dx={st.dx} face={st.face} />;
  });

  // --- things in front of the contestants, behind the podiums
  const castFx: React.ReactNode[] = [];
  const haPos: Record<Who, [number, number, boolean]> = {max: [35, 114, false], bob: [600, 100, false], lily: [1040, 70, true]};
  for (const who of WHO) {
    const s = pop(t, HA_AT[who], HA_AT[who] + 0.85);
    if (s > 0) {
      const [x, y, flipTail] = haPos[who];
      castFx.push(
        <g key={`ha-${who}`} transform={`translate(${x} ${y}) scale(${s})`}>
          <Speech text="HA!" sw={5} flip={flipTail} />
        </g>,
      );
    }
    const q = pop(t, QMARK_AT[who], 56.6);
    if (q > 0) {
      const [hx, hy, hr] = headWorld(CAST[who]);
      castFx.push(
        <g key={`q-${who}`} transform={`translate(${hx + 20} ${hy - hr - 40}) scale(${q})`}>
          <QMark size={150} sw={9} />
        </g>,
      );
    }
  }
  const qMax = pop(t, 35.25, 36.1);
  if (qMax > 0) {
    castFx.push(
      <g key="q-max-cu" transform={`translate(98 175) scale(${qMax})`}>
        <QMark size={62} sw={4} />
      </g>,
    );
  }
  if (during(t, T.no2 - 0.05, T.naps + 0.45)) {
    const up = easeOutBack(seg(t, T.no2, T.no2 + 0.25));
    const u = easeIn(seg(t, T.naps, T.naps + 0.4));
    castFx.push(
      <g key="pillow" transform={`translate(${720 + 1800 * u} ${lerp(760, 440, up) - 260 * Math.sin(Math.PI * u * 0.8)}) rotate(${430 * u})`}>
        <Pillow sw={5} />
      </g>,
    );
  }

  // --- cameras, snacks and mugs on the podium tops
  const topFx: React.ReactNode[] = [];
  for (const c of CAMS) {
    if (t < c.rise - 0.05 || t > 63.75) continue;
    const [ax, ay] = eyesWorld(CAST[c.who]);
    const baseY = PODIUM_TOP - 4;
    const angle = (Math.atan2(ay - (baseY - 100), ax - c.x) * 180) / Math.PI;
    const y = baseY + 230 * (1 - spring(t, c.rise, 2.2, 7)) + 280 * easeIn(seg(t, 63.4, 63.7));
    const eye = clamp(spring(t, c.eye, 2.6, 9), 0, 1.15);
    topFx.push(
      <g key={`cam-${c.who}`} transform={`translate(${c.x} ${y})`}>
        <CamProp angle={angle} eye={t < c.eye ? 0 : eye} rec={Math.floor(t * 2) % 2 === 0} />
      </g>,
    );
  }
  const chips: [number, number, number, string][] = [
    [70, T.snacks, 19.95, '#FF4D4D'],
    [1180, T.snacks + 0.12, 20.05, '#4DA6FF'],
  ];
  for (const [x, tin, tout, color] of chips) {
    const s = pop(t, tin, tout);
    if (s > 0)
      topFx.push(
        <g key={`chips-${x}`} transform={`translate(${x} ${PODIUM_TOP + 6}) scale(${s})`}>
          <Chips color={color} />
        </g>,
      );
  }
  const mugs: [number, number][] = [
    [534, 0],
    [600, 0],
    [666, 0],
    [567, -76],
    [633, -76],
  ];
  mugs.forEach(([x, dy], i) => {
    const s = pop(t, 18.0 + i * 0.12, 63.35 + i * 0.05);
    if (s > 0)
      topFx.push(
        <g key={`mug-${i}`} transform={`translate(${x} ${PODIUM_TOP + 6 + dy}) scale(${s})`}>
          <Mug />
        </g>,
      );
  });

  // --- the bin and the phones that land in it
  const binOn = during(t, 10.2, 12.2);
  const binY = BIN_RIM + 520 * (1 - easeOutBack(seg(t, 10.2, 10.45))) + 640 * easeIn(seg(t, 11.85, 12.15));
  const sinking: React.ReactNode[] = [];
  const flying: React.ReactNode[] = [];
  PHONES.forEach((ph, i) => {
    const tl = ph.t0 + PHONE_FLIGHT;
    const x1 = 540 + (i - 1) * 46;
    const y1 = BIN_RIM - 30;
    if (t >= tl && t < tl + 0.2) {
      const dy = 260 * easeIn(seg(t, tl, tl + 0.18));
      sinking.push(
        <g key={`sink-${i}`} clipPath="url(#bin-mouth)">
          <g transform={`translate(${x1} ${y1 + dy}) rotate(${i === 2 ? -360 : 360})`}>
            <Phone />
          </g>
        </g>,
      );
    }
    if (t >= ph.t0 - 0.12 && t < tl) {
      const tau = Math.max(0, t - ph.t0);
      const u = tau / PHONE_FLIGHT;
      const ta = 0.3 * PHONE_FLIGHT;
      const y0 = PHONE_START_Y;
      const g = (2 * (y0 - y1)) / (ta * ta - (PHONE_FLIGHT - ta) * (PHONE_FLIGHT - ta));
      const ya = y0 - 0.5 * g * ta * ta;
      const y = ya + 0.5 * g * (tau - ta) * (tau - ta);
      const z = lerp(Z.cast, Z.bin, u);
      const x = lerp(ph.from, x1, u);
      const s = t < ph.t0 ? easeOutBack(seg(t, ph.t0 - 0.12, ph.t0)) : 1;
      flying.push(
        <Layer key={`ph-${i}`} cam={cam} z={z}>
          <W>
            <g transform={`translate(${x} ${y}) rotate(${(i === 2 ? -360 : 360) * easeInOut(u)}) scale(${s})`}>
              <Phone />
            </g>
          </W>
        </Layer>,
      );
    }
  });

  // --- the host and his money
  let hostEl: React.ReactNode = null;
  if (hostOn) {
    const hp = hostPose(t);
    const [cx, cy] = toWorld(HOST, HOST_CASH[0], HOST_CASH[1]);
    const bills: React.ReactNode[] = [];
    for (let i = 0; i < 9; i++) {
      const tau = t - T.win;
      if (tau < 0 || tau > 1.7) break;
      const vx = (-1 + (2 * i) / 8) * 330 + 40 * Math.sin(i * 2.3);
      const vy = -(1150 + 200 * Math.sin(i * 1.7));
      const x = cx + vx * tau;
      const y = cy - 40 + vy * tau + 0.5 * 2600 * tau * tau;
      bills.push(
        <g key={`b${i}`} transform={`translate(${x} ${y}) rotate(${(i % 2 ? 1 : -1) * (300 + 40 * i) * tau}) scale(${Math.min(1, tau * 8)})`}>
          <Bill />
        </g>,
      );
    }
    [61.1, 61.45, 61.8, 62.15, 62.5].forEach((t0, i) => {
      const tau = t - t0;
      if (tau < 0) return;
      const y = cy - 30 + 260 * tau + 90 * tau * tau;
      const land = 0.9;
      const s = tau < 0.12 ? easeOut(tau / 0.12) : tau > land ? 1 - easeIn(seg(tau, land, land + 0.15)) : 1;
      if (s <= 0) return;
      const x = cx + (i - 2) * 50 + 60 * Math.sin(2 * Math.PI * 1.2 * tau + i);
      bills.push(
        <g key={`f${i}`} transform={`translate(${x} ${y}) rotate(${25 * Math.sin(2 * Math.PI * 1.2 * tau + i)}) scale(${s})`}>
          <Bill />
        </g>,
      );
    });
    hostEl = (
      <Layer cam={cam} z={Z.host}>
        <W>
          <ellipse cx={HOST.x} cy={HOST.y - 4} rx={215} ry={24} fill="rgba(40, 18, 40, 0.3)" />
        </W>
        <Character p={HOST} t={t} uid="room-host" sx={hp.sx} sy={hp.sy} rot={hp.rot} face={hp.face} />
        <W>{bills}</W>
      </Layer>
    );
  }

  // --- screen-space cards
  const card = (label: string, tin: number, tout: number) => {
    if (t < tin || t > tout + 0.3) return null;
    const x = t < tout ? lerp(-500, 540, easeOutBack(seg(t, tin, tin + 0.3))) : lerp(540, 1700, easeIn(seg(t, tout, tout + 0.25)));
    return <SlideCard key={label} text={label} x={x} y={1610} />;
  };
  const cards = [card('DAY 1', 14.8, 16.0), card('DAY 2', 19.8, 21.0)].filter(Boolean);

  return (
    <AbsoluteFill style={{backgroundColor: C.wall, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translate(${sh.x.toFixed(2)}px, ${sh.y.toFixed(2)}px)`}}>
        <Layer cam={cam} z={Z.wall} blur={farBlur}>
          <W>
            <Wall t={t} text={text} flip={flip} pulse={1 + kick(t, T.money, 0.06, 3, 5)} allOn={during(t, T.money, 5.4) || during(t, 63.62, 64.3)} />
          </W>
        </Layer>
        <Layer cam={cam} z={Z.curtain} blur={farBlur * 0.85}>
          <W>
            <Curtains />
          </W>
        </Layer>
        <Layer cam={cam} z={Z.cast} blur={stageBlur}>
          {brainEl}
          {castEls}
          <W>{castFx}</W>
        </Layer>
        <Layer cam={cam} z={Z.cams} blur={nearBlur}>
          <W>{topFx}</W>
        </Layer>
        <Layer cam={cam} z={Z.podium} blur={nearBlur}>
          <W>
            <StageFace t={t} />
            <Podium x={CAST.max.x} y={PODIUM_TOP} name="MAX" />
            <Podium x={CAST.bob.x} y={PODIUM_TOP} name="BOB" />
            <Podium x={CAST.lily.x} y={PODIUM_TOP} name="LILY" />
          </W>
        </Layer>
        {binOn && (
          <Layer cam={cam} z={Z.bin}>
            <W>
              <defs>
                <clipPath id="bin-mouth">
                  <rect x={-1000} y={-3000} width={3000} height={3000 + binY + 6} />
                </clipPath>
              </defs>
              <g transform={`translate(540 ${binY})`}>
                <Bin />
              </g>
              {sinking}
            </W>
          </Layer>
        )}
        {hostEl}
        {flying}
      </AbsoluteFill>
      {dim > 0.002 && <AbsoluteFill style={{backgroundColor: `rgba(14, 12, 48, ${dim.toFixed(3)})`}} />}
      {cards.length > 0 && (
        <AbsoluteFill>
          <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
            {cards}
          </svg>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
