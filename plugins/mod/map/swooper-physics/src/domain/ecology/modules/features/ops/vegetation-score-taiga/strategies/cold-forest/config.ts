import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Projects cold moist bioclimate and biomass into bounded taiga suitability.
 * It changes only authored controls; the shared operation remains the sole input and output authority.
 */
export default defineStrategy({
  id: "cold-forest",
  config: Type.Object(
    {},
    {
      additionalProperties: false,
      description:
        "Taiga suitability uses fixed cold, moist, forest-biomass response curves with no authored parameters.",
    }
  ),
});
