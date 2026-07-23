import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Favors warm, shallow, near-shore lake tiles and leaves ocean habitat to reef scorers.
 * It changes only authored controls; the shared operation remains the sole input and output authority.
 */
export default defineStrategy({
  id: "warm-shallow-lake",
  config: Type.Object({
    tempWarmStartC: Type.Number({
      default: 16,
      minimum: -100,
      maximum: 100,
      description: "Temperature where lotus suitability begins increasing.",
    }),
    tempWarmEndC: Type.Number({
      default: 32,
      minimum: -100,
      maximum: 100,
      description: "Temperature where lotus suitability reaches its warm optimum.",
    }),
    shallowDepthM: Type.Integer({
      default: 0,
      minimum: 0,
      maximum: 12000,
      description: "Shallow-water depth used for lotus scoring.",
    }),
    deepDepthM: Type.Integer({
      default: 40,
      minimum: 0,
      maximum: 12000,
      description: "Deep-water limit used for lotus scoring.",
    }),
    maxDistanceToCoast: Type.Integer({
      default: 2,
      minimum: 0,
      maximum: 512,
      description: "Maximum tile distance from coast for lotus suitability.",
    }),
  }),
});
