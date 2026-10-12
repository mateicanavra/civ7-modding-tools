import type { VegetationFeatureIntentKey } from "../../../model/atoms/index.js";

/** Rejects invalid annual support observations before availability or habitat can hide them. */
export function assertSagebrushAnnualSupportInputs(
  fields: Readonly<{
    precipitation: ArrayLike<number>;
    pet: ArrayLike<number>;
    localSurfaceWaterOpportunity: ArrayLike<number>;
    vegetationDensity: ArrayLike<number>;
  }>,
  size: number,
  minAnnualWaterOpportunityRatio: number
): void {
  if (!Number.isFinite(minAnnualWaterOpportunityRatio) || minAnnualWaterOpportunityRatio <= 0) {
    throw new RangeError("Expected finite positive sagebrush minimum annual water-opportunity ratio.");
  }
  for (const key of ["precipitation", "pet", "localSurfaceWaterOpportunity", "vegetationDensity"] as const) {
    for (let i = 0; i < size; i++) {
      const value = fields[key][i]!;
      if (!Number.isFinite(value) || value < 0) {
        throw new RangeError(`Expected finite nonnegative ${key} at ${i}.`);
      }
    }
  }
  for (let i = 0; i < size; i++) {
    if (
      !Number.isFinite(fields.precipitation[i]! + fields.localSurfaceWaterOpportunity[i]!) ||
      !Number.isFinite(minAnnualWaterOpportunityRatio * fields.pet[i]!)
    ) {
      throw new RangeError(`Expected finite derived sagebrush annual support quantities at ${i}.`);
    }
  }
}

/** Annual community support only; atmospheric habitat and confidence remain separate gates. */
export function admitSagebrushAnnualSupport(
  support: Readonly<{
    precipitation: number;
    pet: number;
    localSurfaceWaterOpportunity: number;
    genericGrowth: number;
  }>,
  minAnnualWaterOpportunityRatio: number
): boolean {
  const annualWaterOpportunity = support.precipitation + support.localSurfaceWaterOpportunity;
  return (
    annualWaterOpportunity > 0 &&
    annualWaterOpportunity > minAnnualWaterOpportunityRatio * support.pet &&
    support.genericGrowth > 0
  );
}

/**
 * Vegetation features use different signal amplitudes because closed canopy,
 * cold conifer forest, warm seasonal woodland, and semiarid shrubland are
 * different habitats. Admission is therefore feature-local policy, not one
 * family-wide threshold that lets rainforest erase lower-amplitude ecotypes.
 * A zero floor admits every positively supported candidate, not unsupported ones.
 */
export function admitVegetationIntent(
  candidate: Readonly<{ feature: VegetationFeatureIntentKey; confidence01: number }>,
  policy: Readonly<{
    forestMinConfidence01: number;
    rainforestMinConfidence01: number;
    taigaMinConfidence01: number;
    savannaWoodlandMinConfidence01: number;
    sagebrushSteppeMinConfidence01: number;
  }>
): boolean {
  const threshold = minConfidenceForFeature(candidate.feature, policy);
  return candidate.confidence01 > 0 && candidate.confidence01 >= threshold;
}

function clampThreshold(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 1;
}

/** Resolves the authored confidence floor for one vegetation feature identity. */
function minConfidenceForFeature(
  feature: VegetationFeatureIntentKey,
  policy: Readonly<{
    forestMinConfidence01: number;
    rainforestMinConfidence01: number;
    taigaMinConfidence01: number;
    savannaWoodlandMinConfidence01: number;
    sagebrushSteppeMinConfidence01: number;
  }>
): number {
  switch (feature) {
    case "forest":
      return clampThreshold(policy.forestMinConfidence01);
    case "rainforest":
      return clampThreshold(policy.rainforestMinConfidence01);
    case "taiga":
      return clampThreshold(policy.taigaMinConfidence01);
    case "savanna-woodland":
      return clampThreshold(policy.savannaWoodlandMinConfidence01);
    case "sagebrush-steppe":
      return clampThreshold(policy.sagebrushSteppeMinConfidence01);
    default:
      return 1;
  }
}
