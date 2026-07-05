import { clamp01 } from "@swooper/mapgen-core/lib/math";
import type { FracturePotentialPolicy } from "../../../model/policy/mountain-scoring-policy.js";

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
