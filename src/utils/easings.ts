export type Ease =
  | "linear"
  | "quadIn"
  | "quadOut"
  | "quadInOut"
  | "cubicIn"
  | "cubicOut"
  | "cubicInOut"
  | "expoIn"
  | "expoOut"
  | "expoInOut"
  | "sineIn"
  | "sineOut"
  | "sineInOut";

export const easings: Record<Ease, (t: number) => number> = {
  linear: (t) => t,

  quadIn: (t) => t * t,
  quadOut: (t) => t * (2 - t),
  quadInOut: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),

  cubicIn: (t) => t * t * t,
  cubicOut: (t) => --t * t * t + 1,
  cubicInOut: (t) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,

  expoIn: (t) => (t === 0 ? 0 : Math.pow(2, 10 * (t - 1))),
  expoOut: (t) => (t === 1 ? 1 : -Math.pow(2, -10 * t) + 1),
  expoInOut: (t) => {
    if (t === 0 || t === 1) return t;
    if ((t *= 2) < 1) return 0.5 * Math.pow(2, 10 * (t - 1));
    return 0.5 * (-Math.pow(2, -10 * --t) + 2);
  },

  sineIn: (t) => 1 - Math.cos((t * Math.PI) / 2),
  sineOut: (t) => Math.sin((t * Math.PI) / 2),
  sineInOut: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
};
