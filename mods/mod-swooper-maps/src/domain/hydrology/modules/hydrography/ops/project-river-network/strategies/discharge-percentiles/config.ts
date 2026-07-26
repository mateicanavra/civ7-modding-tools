import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines map-relative minor and major discharge percentiles plus absolute safety floors. Defaults
 * select the upper 15 percent for rivers and upper five percent for major candidates while
 * preserving `major >= minor`.
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
      /** Discharge percentile used as the major river threshold (0..1). */
      majorPercentile: Type.Number({
        default: 0.95,
        minimum: 0,
        maximum: 1,
        description: "Discharge percentile used as the major river threshold (0..1).",
      }),
      /** Minimum discharge allowed for minor rivers (same units as discharge). */
      minMinorDischarge: Type.Number({
        default: 0,
        minimum: 0,
        maximum: 1e9,
        description: "Minimum discharge allowed for minor rivers (same units as discharge).",
      }),
      /** Minimum discharge allowed for major rivers (same units as discharge). */
      minMajorDischarge: Type.Number({
        default: 0,
        minimum: 0,
        maximum: 1e9,
        description: "Minimum discharge allowed for major rivers (same units as discharge).",
      }),
    },
    {
      additionalProperties: false,
      description: "River network projection parameters (discharge-percentiles strategy).",
    }
  ),
});
