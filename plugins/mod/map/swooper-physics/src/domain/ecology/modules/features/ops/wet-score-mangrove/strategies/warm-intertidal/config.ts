import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Scores coarse mangrove occurrence from marine low-shore substrate, warmth, and low aridity.
 * It changes only authored controls; the shared operation remains the sole input and output authority.
 */
export default defineStrategy({
  id: "warm-intertidal",
  config: Type.Object(
    {
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
        "Aridity and temperature thresholds for coarse mangrove occurrence on admitted marine low-shore substrate; nutrients, persistent tides, and salinity are not measured.",
    }
  ),
});
