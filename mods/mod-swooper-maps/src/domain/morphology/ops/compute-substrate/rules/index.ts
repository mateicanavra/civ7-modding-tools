import type { ComputeSubstrateTypes } from "../types.js";

function clampNonNegative(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, value);
}

function boundaryErodibilityBoost(
  config: ComputeSubstrateTypes["config"]["default"],
  boundaryType: number
): number {
  switch (boundaryType | 0) {
    case 1:
      return config.convergentBoundaryErodibilityBoost;
    case 2:
      return config.divergentBoundaryErodibilityBoost;
    case 3:
      return config.transformBoundaryErodibilityBoost;
    default:
      return 0;
  }
}

function boundarySedimentBoost(
  config: ComputeSubstrateTypes["config"]["default"],
  boundaryType: number
): number {
  switch (boundaryType | 0) {
    case 1:
      return config.convergentBoundarySedimentBoost;
    case 2:
      return config.divergentBoundarySedimentBoost;
    case 3:
      return config.transformBoundarySedimentBoost;
    default:
      return 0;
  }
}

/**
 * Computes erodibility from crust/material and tectonic drivers.
 */
export function erodibilityForTile(
  config: ComputeSubstrateTypes["config"]["default"],
  upliftValue: number,
  boundaryClosenessValue: number,
  boundaryTypeValue: number,
  crustTypeValue: number,
  crustAgeValue: number
): number {
  const upliftUnit = (upliftValue ?? 0) / 255;
  const closenessUnit = (boundaryClosenessValue ?? 0) / 255;
  const ageUnit = (crustAgeValue ?? 0) / 255;
  const isContinental = (crustTypeValue | 0) === 1;

  const base = isContinental ? config.continentalBaseErodibility : config.oceanicBaseErodibility;
  const aged = base * (1 - ageUnit * config.ageErodibilityReduction);
  const boundary = closenessUnit * boundaryErodibilityBoost(config, boundaryTypeValue ?? 0);
  const uplift = upliftUnit * config.upliftErodibilityBoost;

  return clampNonNegative(aged + boundary + uplift);
}

/**
 * Computes sediment depth from crust/material and tectonic drivers.
 */
export function sedimentDepthForTile(
  config: ComputeSubstrateTypes["config"]["default"],
  riftValue: number,
  boundaryClosenessValue: number,
  boundaryTypeValue: number,
  crustTypeValue: number,
  crustAgeValue: number
): number {
  const riftUnit = (riftValue ?? 0) / 255;
  const closenessUnit = (boundaryClosenessValue ?? 0) / 255;
  const ageUnit = (crustAgeValue ?? 0) / 255;
  const isContinental = (crustTypeValue | 0) === 1;

  const base = isContinental ? config.continentalBaseSediment : config.oceanicBaseSediment;
  const aged = base + ageUnit * config.ageSedimentBoost;
  const boundary = closenessUnit * boundarySedimentBoost(config, boundaryTypeValue ?? 0);
  const rift = riftUnit * config.riftSedimentBoost;

  return clampNonNegative(aged + boundary + rift);
}
