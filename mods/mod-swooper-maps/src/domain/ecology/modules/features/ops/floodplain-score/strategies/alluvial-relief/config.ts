import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Projects fixed alluvial discharge, relief, fertility, and patch continuity semantics.
 * It changes no authored controls; the shared operation remains the sole input and output authority.
 */
export default defineStrategy({
  id: "alluvial-relief",
  config: Type.Object(
    {},
    {
      additionalProperties: false,
      description:
        "Floodplain suitability uses fixed alluvial discharge, relief, fertility, and patch-continuity semantics.",
    }
  ),
});
