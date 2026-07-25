import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Requires intertidal substrate, then combines warmth, water, fertility, and low aridity.
 * It changes only authored controls; the shared operation remains the sole input and output authority.
 */
export default defineStrategy({
  id: "warm-intertidal",
  config: Type.Object(
    {
      waterMin01: Type.Number({
        default: 0.45,
        minimum: 0,
        maximum: 1,
        description: "Minimum water availability for mangrove suitability.",
      }),
      fertilityMin01: Type.Number({
        default: 0.15,
        minimum: 0,
        maximum: 1,
        description: "Minimum soil fertility for mangrove suitability.",
      }),
      aridityMax01: Type.Number({
        default: 0.7,
        minimum: 0,
        maximum: 1,
        description: "Maximum aridity for mangrove suitability.",
      }),
      tempWarmStartC: Type.Number({
        default: 18,
        minimum: -100,
        maximum: 100,
        description: "Temperature where mangrove suitability begins increasing.",
      }),
      tempWarmEndC: Type.Number({
        default: 30,
        minimum: -100,
        maximum: 100,
        description: "Temperature where mangrove suitability reaches its warm optimum.",
      }),
    },
    {
      description:
        "Water, fertility, aridity, and temperature thresholds used to score mangrove habitat on admitted intertidal substrate.",
    }
  ),
});
