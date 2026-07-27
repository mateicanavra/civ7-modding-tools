import { clamp01 } from "@swooper/mapgen-core";

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / Math.max(1e-6, edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function bandpass(x: number, lo: number, hi: number, s: number): number {
  const inLo = smoothstep(lo - s, lo + s, x);
  const outHi = 1 - smoothstep(hi - s, hi + s, x);
  return clamp01(inLo * outHi);
}

/**
 * Scores temperate forest suitability from water, energy, biomass, and fertility.
 */
export function scoreForestSuitability(args: {
  readonly size: number;
  readonly landMask: ArrayLike<number>;
  readonly energy01: ArrayLike<number>;
  readonly water01: ArrayLike<number>;
  readonly waterStress01: ArrayLike<number>;
  readonly coldStress01: ArrayLike<number>;
  readonly biomass01: ArrayLike<number>;
  readonly fertility01: ArrayLike<number>;
}): Float32Array {
  const score01 = new Float32Array(args.size);

  for (let i = 0; i < args.size; i++) {
    if (args.landMask[i] === 0) {
      score01[i] = 0;
      continue;
    }

    const biomass = args.biomass01[i];
    const energy = args.energy01[i];
    const water = args.water01[i];
    const waterStress = args.waterStress01[i];
    const coldStress = args.coldStress01[i];
    const fertility = args.fertility01[i];

    const score =
      biomass *
      bandpass(energy, 0.35, 0.8, 0.1) *
      bandpass(water, 0.35, 0.8, 0.1) *
      (1 - waterStress) *
      (1 - coldStress) *
      (0.6 + 0.4 * fertility);

    score01[i] = clamp01(score);
  }

  return score01;
}
