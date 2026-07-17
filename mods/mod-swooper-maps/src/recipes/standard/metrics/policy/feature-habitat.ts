import { biomeSymbolFromIndex } from "@mapgen/domain/ecology";

import type { StandardMapCapture } from "../capture.js";

/**
 * Detects broad product-level habitat inversions for measured vegetation features.
 * Detailed scoring remains owned by the feature operations; this policy catches only categorical
 * outcomes such as rainforest on cold/dry terrain or taiga outside cold biome families.
 */
export function isStandardFeatureHabitatMismatch(
  feature: string,
  index: number,
  model: StandardMapCapture["model"]
): boolean {
  const temperature = model.surfaceTemperature[index]!;
  const moisture = model.effectiveMoisture[index]!;
  const aridity = model.aridityIndex[index]!;
  const vegetation = model.vegetationDensity[index]!;
  const biome = biomeSymbolFromIndex(model.biomeIndex[index]!);

  switch (feature) {
    case "FEATURE_FOREST":
      return biome !== "temperateHumid" || vegetation < 0.08;
    case "FEATURE_RAINFOREST":
      return (
        biome !== "tropicalRainforest" || temperature < 16 || moisture < 85 || vegetation < 0.18
      );
    case "FEATURE_TAIGA":
      return biome !== "snow" && biome !== "tundra" && biome !== "boreal";
    case "FEATURE_SAVANNA_WOODLAND":
      return biome !== "tropicalSeasonal" || temperature < 12 || aridity > 0.9 || vegetation > 0.78;
    case "FEATURE_SAGEBRUSH_STEPPE":
      return biome !== "desert" || temperature < -12 || temperature > 32 || vegetation > 0.72;
    default:
      return false;
  }
}
