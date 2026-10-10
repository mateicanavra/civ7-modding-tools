import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Projects annual energy, atmospheric water, biomass, and plant stress into taiga opportunity.
 * It changes only authored controls; the shared operation remains the sole input and output authority.
 */
export default defineStrategy({
  id: "cold-forest",
  config: Type.Object(
    {},
    {
      additionalProperties: false,
      description:
        "Taiga opportunity uses a bounded annual cold-forest energy envelope, atmospheric moisture, biomass, and plant stress with no authored parameters.",
    }
  ),
});
