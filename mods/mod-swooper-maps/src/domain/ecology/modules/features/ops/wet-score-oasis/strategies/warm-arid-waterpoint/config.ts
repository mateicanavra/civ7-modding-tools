import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Requires an isolated water source, then combines aridity, local water, and heat.
 * It changes only authored controls; the shared operation remains the sole input and output authority.
 */
export default defineStrategy({
  id: "warm-arid-waterpoint",
  config: Type.Object(
    {
      dryMin01: Type.Number({
        default: 0.6,
        minimum: 0,
        maximum: 1,
        description: "Minimum aridity for oasis suitability.",
      }),
      dryMax01: Type.Number({
        default: 0.95,
        minimum: 0,
        maximum: 1,
        description: "Upper aridity bound for oasis suitability.",
      }),
      waterMin01: Type.Number({
        default: 0.35,
        minimum: 0,
        maximum: 1,
        description: "Minimum local water availability for oasis suitability.",
      }),
      tempWarmStartC: Type.Number({
        default: 20,
        minimum: -100,
        maximum: 100,
        description: "Temperature where oasis suitability begins increasing.",
      }),
      tempWarmEndC: Type.Number({
        default: 38,
        minimum: -100,
        maximum: 100,
        description: "Temperature where oasis suitability reaches its warm optimum.",
      }),
    },
    {
      description:
        "Aridity, local-water, and temperature thresholds used to score oasis habitat around isolated water sources.",
    }
  ),
});
