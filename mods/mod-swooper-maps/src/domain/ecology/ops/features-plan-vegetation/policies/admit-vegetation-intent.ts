/**
 * Vegetation features use different signal amplitudes because closed canopy,
 * cold conifer forest, warm seasonal woodland, and semiarid shrubland are
 * different habitats. Admission is therefore feature-local policy, not one
 * family-wide threshold that lets rainforest erase lower-amplitude ecotypes.
 */
export function admitVegetationIntent(
  candidate: Readonly<{ feature: string; confidence01: number }>,
  policy: Readonly<{
    forestMinConfidence01: number;
    rainforestMinConfidence01: number;
    taigaMinConfidence01: number;
    savannaWoodlandMinConfidence01: number;
    sagebrushSteppeMinConfidence01: number;
  }>
): boolean {
  const threshold = minConfidenceForFeature(candidate.feature, policy);
  return candidate.confidence01 >= threshold;
}

function clampThreshold(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 1;
}

export function minConfidenceForFeature(
  feature: string,
  policy: Readonly<{
    forestMinConfidence01: number;
    rainforestMinConfidence01: number;
    taigaMinConfidence01: number;
    savannaWoodlandMinConfidence01: number;
    sagebrushSteppeMinConfidence01: number;
  }>
): number {
  switch (feature) {
    case "FEATURE_FOREST":
      return clampThreshold(policy.forestMinConfidence01);
    case "FEATURE_RAINFOREST":
      return clampThreshold(policy.rainforestMinConfidence01);
    case "FEATURE_TAIGA":
      return clampThreshold(policy.taigaMinConfidence01);
    case "FEATURE_SAVANNA_WOODLAND":
      return clampThreshold(policy.savannaWoodlandMinConfidence01);
    case "FEATURE_SAGEBRUSH_STEPPE":
      return clampThreshold(policy.sagebrushSteppeMinConfidence01);
    default:
      return 1;
  }
}
