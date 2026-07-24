import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Requires hydromorphic substrate, then favors frozen, waterlogged cold terrain.
 * It changes only authored controls; the shared operation remains the sole input and output authority.
 */
export default defineStrategy({
  id: "cold-hydromorphic",
  config: Type.Object({
    waterMin01: Type.Number({
      default: 0.55,
      minimum: 0,
      maximum: 1,
      description: "Minimum water availability for tundra-bog suitability.",
    }),
    fertilityMin01: Type.Number({
      default: 0.1,
      minimum: 0,
      maximum: 1,
      description: "Minimum soil fertility for tundra-bog suitability.",
    }),
    freezeMin01: Type.Number({
      default: 0.55,
      minimum: 0,
      maximum: 1,
      description: "Minimum freeze index for tundra-bog suitability.",
    }),
    tempColdMaxC: Type.Number({
      default: 4,
      minimum: -100,
      maximum: 100,
      description: "Upper temperature for peak cold tundra-bog suitability.",
    }),
    tempWarmMaxC: Type.Number({
      default: 14,
      minimum: -100,
      maximum: 100,
      description: "Warm temperature limit for tundra-bog suitability.",
    }),
  }),
});
