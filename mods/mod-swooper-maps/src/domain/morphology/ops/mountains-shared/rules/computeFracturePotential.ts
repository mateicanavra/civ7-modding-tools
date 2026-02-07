import type { MountainsConfig } from "./types.js";
import { clamp01 } from "./util.js";

export function computeFracturePotential(params: {
  boundaryStrength: number;
  stress: number;
  rift: number;
  config: MountainsConfig;
}): number {
  const { boundaryStrength, stress, rift, config } = params;
  return clamp01(
    config.fractureBoundaryWeight * boundaryStrength +
      config.fractureStressWeight * stress +
      config.fractureRiftWeight * rift
  );
}
