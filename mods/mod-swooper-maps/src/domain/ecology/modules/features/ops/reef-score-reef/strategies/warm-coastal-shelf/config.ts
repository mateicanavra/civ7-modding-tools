import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Favors warm shallow coastal water without extending reef suitability into deep ocean.
 * It changes only authored controls; the shared operation remains the sole input and output authority.
 */
export default defineStrategy({
  id: "warm-coastal-shelf",
  config: Type.Object(
    {
      tempWarmStartC: Type.Number({
        default: 14,
        minimum: -100,
        maximum: 100,
        description: "Temperature where warm-reef suitability begins increasing.",
      }),
      tempWarmEndC: Type.Number({
        default: 28,
        minimum: -100,
        maximum: 100,
        description: "Temperature where warm-reef suitability reaches its warm optimum.",
      }),
      shallowDepthM: Type.Integer({
        default: 0,
        minimum: 0,
        maximum: 12000,
        description: "Shallow-water depth used for warm-reef scoring.",
      }),
      deepDepthM: Type.Integer({
        default: 120,
        minimum: 0,
        maximum: 12000,
        description: "Deep-water limit used for warm-reef scoring.",
      }),
      maxDistanceToCoast: Type.Integer({
        default: 3,
        minimum: 0,
        maximum: 512,
        description: "Maximum tile distance from coast for warm-reef suitability.",
      }),
    },
    {
      description:
        "Warm-water, shelf-depth, and coast-distance bounds used to score coastal reef habitat.",
    }
  ),
});
