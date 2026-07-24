import { clamp01 } from "@swooper/mapgen-core/lib/math";
import type { FracturePotentialPolicy } from "../../../model/policy/mountain-scoring-policy.js";

/**
 * Scores crustal fracture potential from boundary, shear-stress, and rift evidence.
 *
 * @param params - Normalized tectonic signals and their policy weights for one tile.
 * @returns The additive fracture signal clamped to the inclusive `0..1` domain.
 */
export function computeFracturePotential(params: {
  boundaryStrength: number;
  stress: number;
  rift: number;
  config: FracturePotentialPolicy;
}): number {
  const { boundaryStrength, stress, rift, config } = params;
  return clamp01(
    config.fractureBoundaryWeight * boundaryStrength +
      config.fractureStressWeight * stress +
      config.fractureRiftWeight * rift
  );
}
