import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Terrain and wind neighborhoods derive bounded explanatory climate indices. */
export default defineStrategy({
  id: "terrain-wind-indices",
  config: Type.Object(
    {
      barrierSteps: Type.Integer({
        default: 4,
        minimum: 1,
        maximum: 16,
        description: "Maximum upwind tiles inspected for an orographic barrier.",
      }),
      barrierElevationM: Type.Integer({
        default: 500,
        minimum: 0,
        maximum: 9000,
        description: "Minimum elevation in meters considered an upwind terrain barrier.",
      }),
      continentalityMaxDist: Type.Integer({
        default: 12,
        minimum: 1,
        maximum: 80,
        description: "Distance from water in tiles mapped to full continental influence.",
      }),
      convergenceNormalization: Type.Number({
        default: 64,
        minimum: 1,
        maximum: 512,
        description: "Wind-divergence magnitude mapped to full convergence intensity.",
      }),
    },
    {
      additionalProperties: false,
      description: "Internal posture for terrain-and-wind climate observations.",
    }
  ),
});
