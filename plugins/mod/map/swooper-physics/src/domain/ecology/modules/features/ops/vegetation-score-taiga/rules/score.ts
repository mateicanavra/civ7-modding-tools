import { clamp01 } from "@swooper/mapgen-core";

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / Math.max(1e-6, edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function bandpass(x: number, lo: number, hi: number, s: number): number {
  const inLo = smoothstep(clamp01(lo - s), clamp01(lo + s), x);
  const outHi = 1 - smoothstep(clamp01(hi - s), clamp01(hi + s), x);
  return clamp01(inLo * outHi);
}

/**
 * Scores annual cold-forest opportunity from energy, atmospheric water,
 * biomass, and plant-water stress. The admitted zero-energy endpoint yields
 * no opportunity.
 */
export function scoreTaigaSuitability(args: {
  readonly size: number;
  readonly landMask: ArrayLike<number>;
  readonly energy01: ArrayLike<number>;
  readonly atmosphericWater01: ArrayLike<number>;
  readonly plantWaterStress01: ArrayLike<number>;
  readonly biomass01: ArrayLike<number>;
}): Float32Array {
  const score01 = new Float32Array(args.size);

  for (let i = 0; i < args.size; i++) {
    if (args.landMask[i] === 0) {
      score01[i] = 0;
      continue;
    }

    const biomass = args.biomass01[i];
    const energy = args.energy01[i];
    const water = args.atmosphericWater01[i];
    const waterStress = args.plantWaterStress01[i];
    const biomassEvidence = 0.35 + 0.65 * biomass;

    // Biomass already attenuates cold growth. The annual energy envelope
    // selects cold-forest habitat without requiring frost as a second gate.
    const score =
      biomassEvidence *
      bandpass(energy, 0.08, 0.5, 0.12) *
      bandpass(water, 0.22, 0.78, 0.12) *
      (1 - 0.75 * waterStress);

    score01[i] = clamp01(score);
  }

  return score01;
}
