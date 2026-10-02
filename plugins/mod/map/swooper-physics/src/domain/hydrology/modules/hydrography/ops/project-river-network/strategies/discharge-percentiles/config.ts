import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines map-relative minor and major discharge percentiles plus absolute safety floors. Defaults
 * select the upper 15 percent for minor channels and upper five percent for major endpoints while
 * preserving `major >= minor`. Major reaches extend along the strongest upstream minor path;
 * their members need not meet the endpoint threshold.
 */
export default defineStrategy({
  id: "discharge-percentiles",
  config: Type.Object(
    {
      /** Discharge percentile used as the minor river threshold (0..1). */
      minorPercentile: Type.Number({
        default: 0.85,
        minimum: 0,
        maximum: 1,
        description: "Discharge percentile used as the minor river threshold (0..1).",
      }),
      /** Discharge percentile used as the major endpoint threshold (0..1). */
      majorPercentile: Type.Number({
        default: 0.95,
        minimum: 0,
        maximum: 1,
        description: "Discharge percentile used as the major endpoint threshold (0..1).",
      }),
      /** Minimum discharge allowed for minor rivers (same units as discharge). */
      minMinorDischarge: Type.Number({
        default: 0,
        minimum: 0,
        maximum: 1e9,
        description: "Minimum discharge allowed for minor rivers (same units as discharge).",
      }),
      /** Minimum discharge for major endpoints, not upstream reach members. */
      minMajorDischarge: Type.Number({
        default: 0,
        minimum: 0,
        maximum: 1e9,
        description:
          "Minimum discharge for major endpoints (same units as discharge), not upstream reach members.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Selects minor channels and coherent major reaches from map-relative discharge percentiles plus absolute safety floors; the major endpoint threshold never falls below minor.",
    }
  ),
});
