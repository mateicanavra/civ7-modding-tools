import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Combines cold-water and frozen-alpine signals into one bounded ice suitability field.
 * It changes only authored controls; the shared operation remains the sole input and output authority.
 */
export default defineStrategy({
  id: "thermal-elevation",
  config: Type.Object(
    {
      seaTempColdC: Type.Number({
        default: -10,
        minimum: -100,
        maximum: 100,
        description: "Sea temperature where ice suitability is strongest.",
      }),
      seaTempWarmC: Type.Number({
        default: -2,
        minimum: -100,
        maximum: 100,
        description: "Warm sea-temperature limit for ice suitability.",
      }),
      alpineElevationMinM: Type.Integer({
        default: 2200,
        minimum: 0,
        maximum: 12000,
        description: "Elevation where alpine ice suitability begins increasing.",
      }),
      alpineElevationMaxM: Type.Integer({
        default: 3400,
        minimum: 0,
        maximum: 12000,
        description: "Elevation where alpine ice suitability reaches its maximum.",
      }),
      alpineFreezeMin01: Type.Number({
        default: 0.55,
        minimum: 0,
        maximum: 1,
        description: "Minimum freeze index for alpine ice suitability.",
      }),
    },
    {
      description:
        "Temperature, elevation, and freeze-index breakpoints that combine sea-ice and alpine-ice suitability into one bounded score.",
    }
  ),
});
