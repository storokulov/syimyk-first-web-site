// World layout for the room: depths, heights, palette and where each character stands.
// Units: at camera (540, 960, 0) a layer at depth 1000 shows 1 world px as 1 screen px.
import {CharName, SPRITES} from './sprites';

export const F = 1000;
export const Z = {wall: 3000, curtain: 2400, cast: 1700, cams: 1660, podium: 1650, bin: 1150, host: 1000};

export const STAGE_Y = 820; // contestants' feet (hidden behind the podiums)
export const PODIUM_TOP = 623;
export const FLOOR_Y = 1890; // host's feet
export const HEAD_R = 161; // head radius every contestant is scaled to

export const C = {
  ink: '#1B1B1F',
  yellow: '#FFD447',
  gold: '#F4B83A',
  green: '#2DB34A',
  blue: '#2B3A8C',
  blueLip: '#3C4FB3',
  blueShade: '#23307A',
  purple: '#4B2E83',
  purpleDark: '#3F2670',
  wall: '#1F2A6B',
  wallStripe: '#26347E',
  curtain: '#C8323C',
  curtainDark: '#A0252F',
  floor: '#B0784E',
  floorDark: '#94603B',
  red: '#E2423B',
  cream: '#FFF6DC',
  steel: '#9AA6B2',
  steelDark: '#7D8995',
  steelLight: '#B8C2CC',
};

export const FONT = '"Luckiest Guy", sans-serif';

export type Placed = {name: CharName; x: number; y: number; s: number; ink: number};

export const CAST = {
  max: {name: 'max', x: 0, y: STAGE_Y, s: HEAD_R / SPRITES.max.head[2], ink: 11},
  bob: {name: 'bob', x: 540, y: STAGE_Y, s: HEAD_R / SPRITES.bob.head[2], ink: 10},
  lily: {name: 'lily', x: 1080, y: STAGE_Y, s: (0.95 * HEAD_R) / SPRITES.lily.head[2], ink: 9},
} satisfies Record<string, Placed>;

export const HOST: Placed = {name: 'host', x: 540, y: FLOOR_Y, s: (1.05 * HEAD_R) / SPRITES.host.head[2], ink: 12};

/** world position of a point given in sprite pixels (ignores squash and lean) */
export const toWorld = (p: Placed, sx: number, sy: number): [number, number] => {
  const f = SPRITES[p.name].feet;
  return [p.x + (sx - f[0]) * p.s, p.y + (sy - f[1]) * p.s];
};

/** world position of the middle of the eyes and of the head disc */
export const eyesWorld = (p: Placed): [number, number] => {
  const e = SPRITES[p.name].eyes;
  return toWorld(p, (e[0].box[0] + e[1].box[0] + e[1].box[2]) / 2, (e[0].box[1] + e[0].box[3] / 2 + e[1].box[1] + e[1].box[3] / 2) / 2);
};
export const headWorld = (p: Placed): [number, number, number] => {
  const h = SPRITES[p.name].head;
  const [x, y] = toWorld(p, h[0], h[1]);
  return [x, y, h[2] * p.s];
};
