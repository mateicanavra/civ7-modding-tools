import { clamp01 } from "@swooper/mapgen-core";
import { rampUp01 } from "./feature-score-selection.js";

/** Bounded annual source/demand support in a dry climate, not liquid-water permanence or patch vegetation. */
export function scoreDrylandWaterpoint(args: {
  readonly size: number;
  readonly landMask: ArrayLike<number>;
  readonly localSurfaceWaterOpportunity: ArrayLike<number>;
  readonly pet: ArrayLike<number>;
  readonly aridityIndex: ArrayLike<number>;
  readonly dryMin01: number;
  readonly dryMax01: number;
}): Float32Array {
  const score01 = new Float32Array(args.size);
  for (let i = 0; i < args.size; i++) {
    const supply = args.localSurfaceWaterOpportunity[i]!;
    if (args.landMask[i] !== 1 || supply <= 0) continue;
    const sourceSupport = supply / (supply + args.pet[i]!);
    const drySuit = rampUp01(args.aridityIndex[i]!, args.dryMin01, args.dryMax01);
    score01[i] = clamp01(drySuit * sourceSupport);
  }
  return score01;
}
