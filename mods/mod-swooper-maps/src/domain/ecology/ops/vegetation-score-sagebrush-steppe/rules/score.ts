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

export function scoreSagebrushSteppeSuitability(args: {
  size: number;
  landMask: Uint8Array;
  energy01: Float32Array;
  water01: Float32Array;
  waterStress01: Float32Array;
  biomass01: Float32Array;
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

    const score =
      biomass *
      bandpass(energy, 0.35, 0.8, 0.12) *
      bandpass(water, 0.05, 0.35, 0.1) *
      bandpass(waterStress, 0.45, 0.95, 0.1);

    score01[i] = clamp01(score);
  }

  return score01;
}

