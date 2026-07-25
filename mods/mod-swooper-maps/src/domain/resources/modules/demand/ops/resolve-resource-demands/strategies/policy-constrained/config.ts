import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Applies the canonical Civ7 legality, initial-age, habitat, and river-exclusion policy without
 * exposing authored tuning.
 */
export default defineStrategy({
  id: "policy-constrained",
  config: Type.Object({}, { additionalProperties: false }),
});
