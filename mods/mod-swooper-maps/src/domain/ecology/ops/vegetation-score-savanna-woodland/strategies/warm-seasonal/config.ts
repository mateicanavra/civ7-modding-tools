import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Projects warm seasonal moisture and open biomass into bounded savanna-woodland suitability.
 * It changes only authored controls; the shared operation remains the sole input and output authority.
 */
export default defineStrategy({
  id: "warm-seasonal",
  config: Type.Object({}, { additionalProperties: false }),
});
