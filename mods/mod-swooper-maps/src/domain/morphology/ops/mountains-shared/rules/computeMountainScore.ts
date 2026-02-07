import { BOUNDARY_TYPE } from "@mapgen/domain/foundation/constants.js";

import { clamp } from "@swooper/mapgen-core/lib/math";

import type { MountainsConfig } from "./types.js";
import { resolveBoundaryRegime } from "./resolveBoundaryRegime.js";
import { computeOrogenyPotential } from "./computeOrogenyPotential.js";

/**
 * Computes mountain score from tectonic signals and fractal noise.
 *
 * Prefer passing `collisionUplift` + `subductionUplift` when available. Those two values
 * are derived from Foundation's convergent event typing and let us model collision vs.
 * subduction arcs differently while keeping the algorithm deterministic.
 */
export function computeMountainScore(params: {
  boundaryStrength: number;
  boundaryType: number;
  uplift: number;
  /** Collision-driven uplift component (0..1). If omitted, falls back to `uplift`. */
  collisionUplift?: number;
  /** Subduction-driven uplift component (0..1). If omitted, treated as 0. */
  subductionUplift?: number;
  stress: number;
  rift: number;
  fractal: number;
  driverStrength: number;
  config: MountainsConfig;
}): number {
  const {
    boundaryStrength,
    boundaryType,
    uplift,
    collisionUplift,
    subductionUplift,
    stress,
    rift,
    fractal,
    driverStrength,
    config,
  } = params;

  const resolvedCollisionUplift = collisionUplift ?? uplift;
  const resolvedSubductionUplift = subductionUplift ?? 0;
  const convergentUplift = Math.max(uplift, resolvedCollisionUplift, resolvedSubductionUplift);

  const regime = resolveBoundaryRegime({ boundaryType, uplift: convergentUplift, stress, rift });

  const scaledConvergenceBonus = config.convergenceBonus * config.tectonicIntensity;
  const scaledBoundaryWeight = config.boundaryWeight * config.tectonicIntensity;
  const scaledUpliftWeight = config.upliftWeight * config.tectonicIntensity;

  const collision = regime === BOUNDARY_TYPE.convergent ? boundaryStrength : 0;
  const transform = regime === BOUNDARY_TYPE.transform ? boundaryStrength : 0;
  const divergence = regime === BOUNDARY_TYPE.divergent ? boundaryStrength : 0;

  const orogenyPotential = computeOrogenyPotential({
    boundaryStrength,
    boundaryType: regime,
    uplift: convergentUplift,
    stress,
    rift,
    config,
  });

  let mountainScore =
    // Collision orogeny is the dominant source of large continuous ranges.
    collision *
      scaledBoundaryWeight *
      (config.mountainCollisionStressWeight * stress +
        config.mountainCollisionUpliftWeight * resolvedCollisionUplift +
        config.mountainSubductionUpliftWeight * resolvedSubductionUplift) +
    // Interior uplift is allowed, but it should still be coupled to proximity and driver gating.
    convergentUplift * scaledUpliftWeight * config.mountainInteriorUpliftScale * driverStrength * boundaryStrength +
    // Fractal modulation is visual roughness; the physics signal is carried by orogenyPotential.
    fractal * config.fractalWeight * config.mountainFractalScale * orogenyPotential;

  if (collision > 0) {
    mountainScore +=
      collision *
      scaledConvergenceBonus *
      (config.mountainConvergenceFractalBase + fractal * config.mountainConvergenceFractalSpan) *
      orogenyPotential;
  }

  if (config.interiorPenaltyWeight > 0) {
    const penalty = clamp((1 - boundaryStrength) * config.interiorPenaltyWeight, 0, 1);
    mountainScore *= Math.max(0, 1 - penalty);
  }

  if (divergence > 0) {
    mountainScore *= Math.max(0, 1 - divergence * config.riftPenalty);
  }
  if (transform > 0) {
    mountainScore *= Math.max(0, 1 - transform * config.transformPenalty);
  }

  if (config.riftDepth > 0 && regime === BOUNDARY_TYPE.divergent) {
    mountainScore = Math.max(0, mountainScore - rift * config.riftDepth);
  }

  // Ensure mountains cannot appear without a meaningful tectonic driver signal.
  // driverStrength is already derived from the driver byte magnitude; using it as a *multiplier*
  // collapses the score dynamic range and suppresses mountains in moderate-but-real corridors.
  // We treat it as a gate: below the configured minimum, no mountains; above it, the score is
  // controlled by the physical terms (stress/uplift/regime/proximity).
  const driverGate = driverStrength > 0 ? 1 : 0;
  return Math.max(0, mountainScore) * driverGate;
}
