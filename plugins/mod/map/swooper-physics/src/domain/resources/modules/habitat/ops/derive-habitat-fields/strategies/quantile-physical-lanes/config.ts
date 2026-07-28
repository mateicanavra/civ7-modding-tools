import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Converts physical fields into the canonical named habitat lanes and family intensities.
 * The physical-lane policy is fixed and exposes no authored controls.
 */
export default defineStrategy({
  id: "quantile-physical-lanes",
  config: Type.Object(
    {},
    {
      additionalProperties: false,
      description:
        "Fixed resource-planning policy that converts terrain, water, climate, ecology, and tectonic fields into named habitat masks and family intensity surfaces; it exposes no authored knobs.",
    }
  ),
});
