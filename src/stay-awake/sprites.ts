// Sprite measurements from images/stay-awake/prep.py (sprites.json) plus hand-read anchors.
// All coordinates are pixels in the trimmed sprite PNG (public/stay-awake/sprites/<name>-hero.png).
import measured from './sprites.json';

export type Eye = {
  box: [number, number, number, number]; // x, y, w, h
  white: [number, number, number];
  poly: [number, number][]; // eye interior, 2 px inside the outline
  pupil?: [number, number, number, number, number]; // cx, cy, inscribed r, half width, half height
  skin?: [number, number, number]; // cheek colour, for eyelids
};

export type SpriteInfo = {
  w: number;
  h: number;
  head: [number, number, number]; // inscribed head disc: cx, cy, r
  feet: [number, number];
  eyes: Eye[];
  nose: [number, number]; // where a snot bubble starts
};

type Name = 'max' | 'lily' | 'bob' | 'host';

const NOSE: Record<Name, [number, number]> = {
  max: [742, 792],
  lily: [226, 738],
  bob: [578, 662],
  host: [408, 512],
};

export const SPRITES = Object.fromEntries(
  (Object.keys(NOSE) as Name[]).map((n) => [n, {...(measured as unknown as Record<Name, Omit<SpriteInfo, 'nose'>>)[n], nose: NOSE[n]}]),
) as Record<Name, SpriteInfo>;

// Extra anchors used by props
export const MAX_CAN: [number, number] = [1160, 1040];
export const HOST_CASH: [number, number] = [430, 1110];

export type CharName = Name;
