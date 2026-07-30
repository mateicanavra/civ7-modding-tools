import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Favors warm, shallow offshore banks separated from the immediate coastline.
 * It changes only authored controls; the shared operation remains the sole input and output authority.
 */
export default defineStrategy({
  id: "warm-ocean-bank",
  config: Type.Object(
    {
      tempWarmStartC: Type.Number({
        default: 18,
        minimum: -100,
        maximum: 100,
        description: "Temperature where atoll suitability begins increasing.",
      }),
      tempWarmEndC: Type.Number({
        default: 30,
        minimum: -100,
        maximum: 100,
        description: "Temperature where atoll suitability reaches its warm optimum.",
      }),
      shallowDepthM: Type.Integer({
        default: 0,
        minimum: 0,
        maximum: 12000,
        description: "Shallow-water depth used for atoll scoring.",
      }),
      deepDepthM: Type.Integer({
        default: 100,
        minimum: 0,
        maximum: 12000,
        description: "Deep-water limit used for atoll scoring.",
      }),
      minDistanceToCoast: Type.Integer({
        default: 4,
        minimum: 0,
        maximum: 512,
        description: "Minimum tile distance from coast for atoll suitability.",
      }),
      maxDistanceToCoast: Type.Integer({
        default: 8,
        minimum: 0,
        maximum: 512,
        description: "Maximum tile distance from coast for atoll suitability.",
      }),
    },
    {
      description:
        "Warm-water, bank-depth, and offshore-distance bounds used to score atoll habitat.",
    }
  ),
});
