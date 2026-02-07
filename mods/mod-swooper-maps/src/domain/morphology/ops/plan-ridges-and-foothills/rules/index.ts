import { clamp } from "@swooper/mapgen-core/lib/math";
import { normalizeFractal } from "@swooper/mapgen-core/lib/noise";

import { BOUNDARY_TYPE } from "@mapgen/domain/foundation/constants.js";

import type { PlanRidgesAndFoothillsTypes } from "../types.js";

const BOUNDARY_STRENGTH_EPS = 1e-6;

const OROGENY_CONVERGENT_STRESS_WEIGHT = 0.6;
const OROGENY_CONVERGENT_UPLIFT_WEIGHT = 0.4;
const OROGENY_TRANSFORM_STRESS_WEIGHT = 0.4;
const OROGENY_DIVERGENT_RIFT_WEIGHT = 0.55;
const OROGENY_DIVERGENT_STRESS_WEIGHT = 0.15;

const FRACTURE_BOUNDARY_WEIGHT = 0.7;
const FRACTURE_STRESS_WEIGHT = 0.2;
const FRACTURE_RIFT_WEIGHT = 0.1;

const MOUNTAIN_BOUNDARY_STRESS_WEIGHT = 0.5;
const MOUNTAIN_BOUNDARY_UPLIFT_WEIGHT = 0.5;
const MOUNTAIN_UPLIFT_WEIGHT_SCALE = 0.5;
const MOUNTAIN_FRACTAL_WEIGHT_SCALE = 0.3;
const MOUNTAIN_CONVERGENCE_BASE = 0.6;
const MOUNTAIN_CONVERGENCE_FRACTAL_GAIN = 0.4;

const HILL_FOOTHILL_BASE = 0.5;
const HILL_FOOTHILL_FRACTAL_GAIN = 0.5;
const HILL_FRACTAL_WEIGHT_SCALE = 0.8;
const HILL_UPLIFT_WEIGHT_SCALE = 0.3;
const HILL_RIFT_BONUS_SCALE = 0.5;
const HILL_RIFT_DEPTH_SCALE = 0.5;

function clampByte(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(255, Math.round(value))) | 0;
}

function resolveBoundaryRegime(params: { boundaryType: number; uplift: number; stress: number; rift: number }): number {
  const boundaryType = params.boundaryType | 0;
  if (
    boundaryType === BOUNDARY_TYPE.convergent ||
    boundaryType === BOUNDARY_TYPE.divergent ||
    boundaryType === BOUNDARY_TYPE.transform
  ) {
    return boundaryType;
  }

  const uplift = params.uplift;
  const rift = params.rift;
  const stress = params.stress;

  if (uplift > 0 && uplift >= rift) return BOUNDARY_TYPE.convergent;
  if (rift > 0 && rift > uplift) return BOUNDARY_TYPE.divergent;
  if (stress > 0) return BOUNDARY_TYPE.transform;
  return 0;
}

/**
 * Ensures ridge/foothill inputs match the expected map size.
 */
export function validateRidgesInputs(
  input: PlanRidgesAndFoothillsTypes["input"]
): {
  size: number;
  landMask: Uint8Array;
  boundaryCloseness: Uint8Array;
  boundaryType: Uint8Array;
  upliftPotential: Uint8Array;
  riftPotential: Uint8Array;
  tectonicStress: Uint8Array;
  fractalMountain: Int16Array;
  fractalHill: Int16Array;
} {
  const { width, height } = input;
  const size = Math.max(0, (width | 0) * (height | 0));
  const landMask = input.landMask as Uint8Array;
  const boundaryCloseness = input.boundaryCloseness as Uint8Array;
  const boundaryType = input.boundaryType as Uint8Array;
  const upliftPotential = input.upliftPotential as Uint8Array;
  const riftPotential = input.riftPotential as Uint8Array;
  const tectonicStress = input.tectonicStress as Uint8Array;
  const fractalMountain = input.fractalMountain as Int16Array;
  const fractalHill = input.fractalHill as Int16Array;

  if (
    landMask.length !== size ||
    boundaryCloseness.length !== size ||
    boundaryType.length !== size ||
    upliftPotential.length !== size ||
    riftPotential.length !== size ||
    tectonicStress.length !== size ||
    fractalMountain.length !== size ||
    fractalHill.length !== size
  ) {
    throw new Error("[RidgesFoothills] Input tensors must match width*height.");
  }

  return {
    size,
    landMask,
    boundaryCloseness,
    boundaryType,
    upliftPotential,
    riftPotential,
    tectonicStress,
    fractalMountain,
    fractalHill,
  };
}

/**
 * Converts boundary proximity into a normalized boundary strength.
 */
export function resolveBoundaryStrength(
  closenessNorm: number,
  boundaryGate: number,
  exponent: number
): number {
  const normalized =
    closenessNorm <= boundaryGate
      ? 0
      : (closenessNorm - boundaryGate) / Math.max(BOUNDARY_STRENGTH_EPS, 1 - boundaryGate);
  return Math.pow(normalized, exponent);
}

export function computeOrogenyPotential01(params: {
  boundaryStrength: number;
  boundaryType: number;
  uplift: number;
  stress: number;
  rift: number;
}): number {
  const { boundaryStrength, boundaryType, uplift, stress, rift } = params;
  const regime = resolveBoundaryRegime({ boundaryType, uplift, stress, rift });

  const collision = regime === BOUNDARY_TYPE.convergent ? boundaryStrength : 0;
  const transform = regime === BOUNDARY_TYPE.transform ? boundaryStrength : 0;
  const divergence = regime === BOUNDARY_TYPE.divergent ? boundaryStrength : 0;

  const collisionSignal = collision * (OROGENY_CONVERGENT_STRESS_WEIGHT * stress + OROGENY_CONVERGENT_UPLIFT_WEIGHT * uplift);
  const transformSignal = transform * (OROGENY_TRANSFORM_STRESS_WEIGHT * stress);
  const divergenceSignal = divergence * (OROGENY_DIVERGENT_RIFT_WEIGHT * rift + OROGENY_DIVERGENT_STRESS_WEIGHT * stress);

  return clamp(collisionSignal + transformSignal + divergenceSignal, 0, 1);
}

export function computeFracture01(params: { boundaryStrength: number; stress: number; rift: number }): number {
  const { boundaryStrength, stress, rift } = params;
  return clamp(
    FRACTURE_BOUNDARY_WEIGHT * boundaryStrength + FRACTURE_STRESS_WEIGHT * stress + FRACTURE_RIFT_WEIGHT * rift,
    0,
    1
  );
}

/**
 * Computes mountain score from tectonic signals and fractal noise.
 */
export function computeMountainScore(params: {
  boundaryStrength: number;
  boundaryType: number;
  uplift: number;
  stress: number;
  rift: number;
  fractal: number;
  config: PlanRidgesAndFoothillsTypes["config"]["default"];
}): number {
  const { boundaryStrength, boundaryType, uplift, stress, rift, fractal, config } = params;
  const regime = resolveBoundaryRegime({ boundaryType, uplift, stress, rift });

  const scaledConvergenceBonus = config.convergenceBonus * config.tectonicIntensity;
  const scaledBoundaryWeight = config.boundaryWeight * config.tectonicIntensity;
  const scaledUpliftWeight = config.upliftWeight * config.tectonicIntensity;

  const collision = regime === BOUNDARY_TYPE.convergent ? boundaryStrength : 0;
  const transform = regime === BOUNDARY_TYPE.transform ? boundaryStrength : 0;
  const divergence = regime === BOUNDARY_TYPE.divergent ? boundaryStrength : 0;

  const orogenyPotential01 = computeOrogenyPotential01({
    boundaryStrength,
    boundaryType: regime,
    uplift,
    stress,
    rift,
  });

  let mountainScore =
    collision * scaledBoundaryWeight * (MOUNTAIN_BOUNDARY_STRESS_WEIGHT * stress + MOUNTAIN_BOUNDARY_UPLIFT_WEIGHT * uplift) +
    uplift * scaledUpliftWeight * MOUNTAIN_UPLIFT_WEIGHT_SCALE +
    fractal * config.fractalWeight * MOUNTAIN_FRACTAL_WEIGHT_SCALE * orogenyPotential01;

  if (collision > 0) {
    mountainScore +=
      collision *
      scaledConvergenceBonus *
      (MOUNTAIN_CONVERGENCE_BASE + fractal * MOUNTAIN_CONVERGENCE_FRACTAL_GAIN) *
      orogenyPotential01;
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

  return Math.max(0, mountainScore);
}

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
  config: PlanRidgesAndFoothillsTypes["config"]["default"];
}): number {
  const { boundaryStrength, boundaryType, uplift, stress, rift, fractal, config } = params;
  const regime = resolveBoundaryRegime({ boundaryType, uplift, stress, rift });

  const scaledHillBoundaryWeight = config.hillBoundaryWeight * config.tectonicIntensity;
  const scaledHillConvergentFoothill = config.hillConvergentFoothill * config.tectonicIntensity;

  const collision = regime === BOUNDARY_TYPE.convergent ? boundaryStrength : 0;
  const divergence = regime === BOUNDARY_TYPE.divergent ? boundaryStrength : 0;

  const orogenyPotential01 = computeOrogenyPotential01({
    boundaryStrength,
    boundaryType: regime,
    uplift,
    stress,
    rift,
  });

  const hillIntensity = Math.sqrt(boundaryStrength);
  const foothillExtent = HILL_FOOTHILL_BASE + fractal * HILL_FOOTHILL_FRACTAL_GAIN;
  let hillScore =
    fractal * config.fractalWeight * HILL_FRACTAL_WEIGHT_SCALE * orogenyPotential01 +
    uplift * config.hillUpliftWeight * HILL_UPLIFT_WEIGHT_SCALE;

  if (collision > 0 && config.hillBoundaryWeight > 0) {
    hillScore += hillIntensity * scaledHillBoundaryWeight * foothillExtent;
    hillScore += hillIntensity * scaledHillConvergentFoothill * foothillExtent;
  }

  if (divergence > 0) {
    hillScore += hillIntensity * rift * config.hillRiftBonus * foothillExtent * HILL_RIFT_BONUS_SCALE;
  }

  if (config.hillInteriorFalloff > 0) {
    const penalty = clamp((1 - hillIntensity) * config.hillInteriorFalloff, 0, 1);
    hillScore *= Math.max(0, 1 - penalty);
  }

  if (config.riftDepth > 0 && regime === BOUNDARY_TYPE.divergent) {
    hillScore = Math.max(0, hillScore - rift * config.riftDepth * HILL_RIFT_DEPTH_SCALE);
  }

  return Math.max(0, hillScore);
}

/**
 * Normalizes fractal values to a 0..1 range.
 */
export function normalizeRidgeFractal(value: number): number {
  return normalizeFractal(value);
}

export function encode01Byte(value01: number): number {
  return clampByte(clamp(value01, 0, 1) * 255);
}
