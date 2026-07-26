import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Preserves strict single-feature occupancy and tile order rather than silently resolving collisions.
 * It changes only authored controls; the shared operation remains the sole input and output authority.
 */
export default defineStrategy({
  id: "strict-single-occupancy",
  config: Type.Object(
    {},
    {
      description:
        "Feature consolidation has no authored parameters; each Civ7 tile admits exactly one planned feature.",
    }
  ),
});
