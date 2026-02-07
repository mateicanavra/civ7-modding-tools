import { clamp } from "@swooper/mapgen-core/lib/math";
import { normalizeFractal } from "@swooper/mapgen-core/lib/noise";

import { BOUNDARY_TYPE } from "@mapgen/domain/foundation/constants.js";

import type { PlanRidgesAndFoothillsTypes } from "../types.js";

const BOUNDARY_STRENGTH_EPS = 1e-6;

function clampByte(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(255, Math.round(value))) | 0;
}

function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

export function resolveDriverStrength(params: {
  driverByte: number;
  driverSignalByteMin: number;
  driverExponent: number;
}): number {
  const driverByte = params.driverByte | 0;
  const driverMin = Math.max(0, Math.min(255, Math.round(params.driverSignalByteMin))) | 0;
  if (driverByte <= driverMin) return 0;
  const denom = Math.max(1, 255 - driverMin);
  const normalized = (driverByte - driverMin) / denom;
  const exponent = Math.max(0.01, params.driverExponent);
  return Math.pow(clamp01(normalized), exponent);
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

export function computeOrogenyPotential(params: {
  boundaryStrength: number;
  boundaryType: number;
  uplift: number;
  stress: number;
  rift: number;
  config: PlanRidgesAndFoothillsTypes["config"]["default"];
}): number {
  const { boundaryStrength, boundaryType, uplift, stress, rift, config } = params;
  const regime = resolveBoundaryRegime({ boundaryType, uplift, stress, rift });

  const collision = regime === BOUNDARY_TYPE.convergent ? boundaryStrength : 0;
  const transform = regime === BOUNDARY_TYPE.transform ? boundaryStrength : 0;
  const divergence = regime === BOUNDARY_TYPE.divergent ? boundaryStrength : 0;

  const collisionSignal =
    collision * (config.orogenyCollisionStressWeight * stress + config.orogenyCollisionUpliftWeight * uplift);
  const transformSignal = transform * (config.orogenyTransformStressWeight * stress);
  const divergenceSignal =
    divergence * (config.orogenyDivergentRiftWeight * rift + config.orogenyDivergentStressWeight * stress);

  return clamp01(collisionSignal + transformSignal + divergenceSignal);
}

export function computeFracturePotential(params: {
  boundaryStrength: number;
  stress: number;
  rift: number;
  config: PlanRidgesAndFoothillsTypes["config"]["default"];
}): number {
  const { boundaryStrength, stress, rift, config } = params;
  return clamp01(
    config.fractureBoundaryWeight * boundaryStrength + config.fractureStressWeight * stress + config.fractureRiftWeight * rift
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
  driverStrength: number;
  config: PlanRidgesAndFoothillsTypes["config"]["default"];
}): number {
  const { boundaryStrength, boundaryType, uplift, stress, rift, fractal, driverStrength, config } = params;
  const regime = resolveBoundaryRegime({ boundaryType, uplift, stress, rift });

  const scaledConvergenceBonus = config.convergenceBonus * config.tectonicIntensity;
  const scaledBoundaryWeight = config.boundaryWeight * config.tectonicIntensity;
  const scaledUpliftWeight = config.upliftWeight * config.tectonicIntensity;

  const collision = regime === BOUNDARY_TYPE.convergent ? boundaryStrength : 0;
  const transform = regime === BOUNDARY_TYPE.transform ? boundaryStrength : 0;
  const divergence = regime === BOUNDARY_TYPE.divergent ? boundaryStrength : 0;

  const orogenyPotential = computeOrogenyPotential({
    boundaryStrength,
    boundaryType: regime,
    uplift,
    stress,
    rift,
    config,
  });

  let mountainScore =
    collision *
      scaledBoundaryWeight *
      (config.mountainCollisionStressWeight * stress + config.mountainCollisionUpliftWeight * uplift) +
    uplift * scaledUpliftWeight * config.mountainInteriorUpliftScale * driverStrength +
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
  const driverGate = driverStrength > 0 ? 1 : 0;
  return Math.max(0, mountainScore) * driverGate;
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
  driverStrength: number;
  config: PlanRidgesAndFoothillsTypes["config"]["default"];
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
    hillScore += hillIntensity * scaledHillBoundaryWeight * foothillExtent;
    hillScore += hillIntensity * scaledHillConvergentFoothill * foothillExtent;
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

  const driverGate = driverStrength > 0 ? 1 : 0;
  return Math.max(0, hillScore) * driverGate;
}

/**
 * Normalizes fractal values to a 0..1 range.
 */
export function normalizeRidgeFractal(value: number): number {
  return normalizeFractal(value);
}

export function encodeNormalizedToU8(valueUnit: number): number {
  return clampByte(clamp(valueUnit, 0, 1) * 255);
}
