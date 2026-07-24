import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Projects temperate humidity and fertility into bounded forest suitability.
 * It changes only authored controls; the shared operation remains the sole input and output authority.
 */
export default defineStrategy({
  id: "temperate-humid",
  config: Type.Object({}, { additionalProperties: false }),
});
