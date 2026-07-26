import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Favors cold shelf water while excluding unsuitable warmth, depth, and coast distance.
 * It changes only authored controls; the shared operation remains the sole input and output authority.
 */
export default defineStrategy({
  id: "cold-shelf",
  config: Type.Object(
    {
      tempColdMaxC: Type.Number({
        default: 10,
        minimum: -100,
        maximum: 100,
        description: "Upper temperature for peak cold-reef suitability.",
      }),
      tempWarmMaxC: Type.Number({
        default: 20,
        minimum: -100,
        maximum: 100,
        description: "Warm temperature limit for cold-reef suitability.",
      }),
      minDepthM: Type.Integer({
        default: 8,
        minimum: 0,
        maximum: 12000,
        description: "Minimum water depth for cold-reef suitability.",
      }),
      peakDepthM: Type.Integer({
        default: 24,
        minimum: 0,
        maximum: 12000,
        description: "Water depth of peak cold-reef suitability.",
      }),
      maxDepthM: Type.Integer({
        default: 48,
        minimum: 0,
        maximum: 12000,
        description: "Maximum water depth for cold-reef suitability.",
      }),
      minDistanceToCoast: Type.Integer({
        default: 1,
        minimum: 0,
        maximum: 512,
        description: "Minimum tile distance from coast for cold-reef suitability.",
      }),
      maxDistanceToCoast: Type.Integer({
        default: 8,
        minimum: 0,
        maximum: 512,
        description: "Maximum tile distance from coast for cold-reef suitability.",
      }),
    },
    {
      description:
        "Temperature, shelf-depth, and coast-distance bounds used to score cold-reef habitat.",
    }
  ),
});
