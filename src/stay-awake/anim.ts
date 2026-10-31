// Small, pure animation helpers: everything on screen is a function of the time t (seconds).

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
/** 0 before t0, 1 after t1, linear in between */
export const seg = (t: number, t0: number, t1: number) => clamp((t - t0) / (t1 - t0));

export const easeInOut = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
export const easeOut = (u: number) => 1 - Math.pow(1 - u, 3);
export const easeIn = (u: number) => u * u * u;
export const easeOutBack = (u: number, s = 1.7) => 1 + (s + 1) * Math.pow(u - 1, 3) + s * Math.pow(u - 1, 2);

/** damped spring from 0 to 1 starting at t0 (overshoots ~20 % with the defaults) */
export const spring = (t: number, t0: number, freq = 2.2, damp = 7) => {
  const x = t - t0;
  if (x <= 0) return 0;
  return 1 - Math.exp(-damp * x) * Math.cos(2 * Math.PI * freq * x);
};

/** pop-in scale with overshoot at tIn, shrink away over dOut seconds from tOut */
export const pop = (t: number, tIn: number, tOut = Infinity, dOut = 0.16) => {
  if (t < tIn || t >= tOut + dOut) return 0;
  const s = spring(t, tIn, 2.4, 8);
  return t >= tOut ? s * (1 - easeIn(seg(t, tOut, tOut + dOut))) : s;
};

/** decaying sine kick (impacts, jolts) */
export const kick = (t: number, t0: number, amp: number, freq = 5, decay = 6) =>
  t < t0 ? 0 : amp * Math.exp(-decay * (t - t0)) * Math.sin(2 * Math.PI * freq * (t - t0));

export const wave = (t: number, freq: number, phase = 0) => Math.sin(2 * Math.PI * (freq * t + phase));

/** squash-and-stretch about the feet for an action at t0: anticipation dip, stretch, settle */
export const bounce = (t: number, t0: number, amp = 0.08) => {
  if (t < t0 - 0.08) return {sx: 1, sy: 1};
  const pre = seg(t, t0 - 0.08, t0);
  const dip = t < t0 ? -amp * 0.6 * Math.sin((Math.PI / 2) * pre) : 0;
  const s = t >= t0 ? kick(t, t0, amp, 3.2, 5.5) : 0;
  const sy = 1 + dip + s;
  return {sx: 1 - (sy - 1) * 0.6, sy};
};

/** piecewise value: hold v[i] until the next key, ease between keys over d seconds */
export const steps = (t: number, keys: [number, number][], d = 0.25, ease = easeInOut) => {
  let v = keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [ti, vi] = keys[i];
    if (t < ti) break;
    v = lerp(v, vi, ease(seg(t, ti, ti + d)));
  }
  return v;
};

/** active between [t0, t1) */
export const during = (t: number, t0: number, t1: number) => t >= t0 && t < t1;
