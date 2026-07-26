import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Configuration contract for reducing era fields into cumulative history evidence. */
export default defineStrategy({
  id: "cumulative-era-rollup",
  config: Type.Object(
    {
      activityThreshold: Type.Integer({
        default: 1,
        minimum: 0,
        maximum: 255,
        description: "Threshold used to compute lastActiveEra (0..255).",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Activity admission threshold used to reduce per-era tectonic fields into cumulative and recency evidence.",
    }
  ),
});
