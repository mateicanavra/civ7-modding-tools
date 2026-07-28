import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Selects the area-balanced, seam-safe hemisphere strategy for assigning each
 * connected landmass to one gameplay region.
 */
export default defineStrategy({
  id: "balanced-hemisphere",
  config: Type.Object(
    {},
    {
      additionalProperties: false,
      description:
        "Area-balanced hemisphere assignment has no author-facing parameters; Civ7 policy owns the two gameplay-region identities.",
    }
  ),
});
