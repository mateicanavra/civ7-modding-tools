import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Projects warm humid bioclimate and biomass into bounded rainforest suitability.
 * It changes only authored controls; the shared operation remains the sole input and output authority.
 */
export default defineStrategy({
  id: "warm-humid",
  config: Type.Object(
    {},
    {
      additionalProperties: false,
      description:
        "Rainforest suitability uses fixed warm, humid, high-biomass response curves with no authored parameters.",
    }
  ),
});
