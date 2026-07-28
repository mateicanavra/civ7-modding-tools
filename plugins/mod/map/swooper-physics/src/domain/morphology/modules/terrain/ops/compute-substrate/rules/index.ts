import { clampFinite } from "@swooper/mapgen-core/lib/math";

type SubstrateMaterialConfig = Readonly<{
  continentalBaseErodibility: number;
  oceanicBaseErodibility: number;
  convergentBoundaryErodibilityBoost: number;
  divergentBoundaryErodibilityBoost: number;
  transformBoundaryErodibilityBoost: number;
  upliftErodibilityBoost: number;
  ageErodibilityReduction: number;
  continentalBaseSediment: number;
  oceanicBaseSediment: number;
  convergentBoundarySedimentBoost: number;
  divergentBoundarySedimentBoost: number;
  transformBoundarySedimentBoost: number;
  riftSedimentBoost: number;
  ageSedimentBoost: number;
}>;

function boundaryErodibilityBoost(config: SubstrateMaterialConfig, boundaryType: number): number {
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

function boundarySedimentBoost(config: SubstrateMaterialConfig, boundaryType: number): number {
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
  config: SubstrateMaterialConfig,
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

  return clampFinite(aged + boundary + uplift, 0);
}

/**
 * Computes sediment depth from crust/material and tectonic drivers.
 */
export function sedimentDepthForTile(
  config: SubstrateMaterialConfig,
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

  return clampFinite(aged + boundary + rift, 0);
}
