import { BOUNDARY_TYPE } from "@mapgen/domain/foundation/constants.js";

import { clamp } from "@swooper/mapgen-core/lib/math";

import type { MountainsConfig } from "./types.js";
import { clamp01 } from "./util.js";
import { resolveBoundaryRegime } from "./resolveBoundaryRegime.js";
import { computeOrogenyPotential } from "./computeOrogenyPotential.js";

/**
 * Computes hill score from tectonic signals and fractal noise.
 */
export function computeHillScore(params: {
  boundaryStrength: number;
  boundaryType: number;
  uplift: number;
  stress: number;
  rift: number;
  fractal: number;
  driverStrength: number;
  config: MountainsConfig;
}): number {
  const { boundaryStrength, boundaryType, uplift, stress, rift, fractal, driverStrength, config } = params;
  const regime = resolveBoundaryRegime({ boundaryType, uplift, stress, rift });

  const scaledHillBoundaryWeight = config.hillBoundaryWeight * config.tectonicIntensity;
  const scaledHillConvergentFoothill = config.hillConvergentFoothill * config.tectonicIntensity;

  const collision = regime === BOUNDARY_TYPE.convergent ? boundaryStrength : 0;
  const divergence = regime === BOUNDARY_TYPE.divergent ? boundaryStrength : 0;

  const orogenyPotential = computeOrogenyPotential({
    boundaryStrength,
    boundaryType: regime,
    uplift,
    stress,
    rift,
    config,
  });

  const hillIntensity = Math.sqrt(boundaryStrength);
  const foothillExtent = config.hillFoothillBase + fractal * config.hillFoothillFractalGain;
  let hillScore =
    fractal * config.fractalWeight * config.hillFractalScale * orogenyPotential +
    uplift * config.hillUpliftWeight * config.hillUpliftScale * driverStrength;

  if (collision > 0 && config.hillBoundaryWeight > 0) {
    // Boundary proximity alone does not create hills; deformation (uplift/stress) does.
    // Multiply by orogenyPotential to prevent broad, low-signal boundary "halos" from
    // turning entire continents into hills when boundaryCloseness is pure proximity.
    hillScore += hillIntensity * scaledHillBoundaryWeight * foothillExtent * orogenyPotential;
    hillScore += hillIntensity * scaledHillConvergentFoothill * foothillExtent * orogenyPotential;
  }

  if (divergence > 0) {
    hillScore += hillIntensity * rift * config.hillRiftBonus * foothillExtent * config.hillRiftBonusScale;
  }

  if (config.hillInteriorFalloff > 0) {
    const penalty = clamp((1 - hillIntensity) * config.hillInteriorFalloff, 0, 1);
    hillScore *= Math.max(0, 1 - penalty);
  }

  if (config.riftDepth > 0 && regime === BOUNDARY_TYPE.divergent) {
    hillScore = Math.max(0, hillScore - rift * config.riftDepth * config.hillRiftDepthScale);
  }

  // As with mountains, treat driverStrength as a gate (not a multiplier) to preserve score range.
  const driverGate = driverStrength > 0 ? 1 : 0;
  return Math.max(0, hillScore) * driverGate;
}
