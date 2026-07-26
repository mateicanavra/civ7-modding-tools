import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Requires an isolated water source, then favors drier and less fertile habitat than oasis scoring.
 * It changes only authored controls; the shared operation remains the sole input and output authority.
 */
export default defineStrategy({
  id: "arid-waterpoint",
  config: Type.Object({
    dryMin01: Type.Number({
      default: 0.45,
      minimum: 0,
      maximum: 1,
      description: "Minimum aridity for watering-hole suitability.",
    }),
    dryMax01: Type.Number({
      default: 0.85,
      minimum: 0,
      maximum: 1,
      description: "Upper aridity bound for watering-hole suitability.",
    }),
    waterMin01: Type.Number({
      default: 0.25,
      minimum: 0,
      maximum: 1,
      description: "Minimum local water availability for watering-hole suitability.",
    }),
    fertilityMin01: Type.Number({
      default: 0.1,
      minimum: 0,
      maximum: 1,
      description: "Minimum surrounding fertility for watering-hole suitability.",
    }),
    tempWarmStartC: Type.Number({
      default: 12,
      minimum: -100,
      maximum: 100,
      description: "Temperature where watering-hole suitability begins increasing.",
    }),
    tempWarmEndC: Type.Number({
      default: 32,
      minimum: -100,
      maximum: 100,
      description: "Temperature where watering-hole suitability reaches its warm optimum.",
    }),
  }),
});
