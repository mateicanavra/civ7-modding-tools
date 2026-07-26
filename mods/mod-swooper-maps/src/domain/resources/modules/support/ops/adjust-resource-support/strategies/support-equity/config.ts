import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Tunes the bounded pre-stamp support pass while preserving legality, spacing, range, region,
 * exclusion, and landmass-density gates for every adjusted destination.
 */
export default defineStrategy({
  id: "support-equity",
  config: Type.Object(
    {
      enabled: Type.Boolean({
        default: true,
        description:
          "Runs the support pass. When false the plan passes through unchanged and unmet floors are recorded as typed shortfalls (reason adjustment-disabled).",
      }),
      supportFloor: Type.Integer({
        minimum: 0,
        maximum: 6,
        default: 2,
        description:
          "Target planned resource sites within supportRadiusTiles of each seated start; unattainable deficits are recorded as typed shortfalls.",
      }),
      supportRadiusTiles: Type.Integer({
        minimum: 1,
        maximum: 8,
        default: 4,
        description:
          "Hex radius around each start within which support sites are counted (E3.1 measures 4).",
      }),
      equityTolerance: Type.Integer({
        minimum: 0,
        maximum: 8,
        default: 2,
        description:
          "Target max−min per-player support-count gap; an unresolved gap is retained in typed evidence.",
      }),
      strength: Type.Number({
        minimum: 0,
        maximum: 1,
        default: 1,
        description:
          "Scales the adjustment budget: per-start floor fills apply ceil(strength × deficit) units and the equity pass budget scales with strength. 1 uses the full budget; 0 is record-only while still measuring.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Bounded start-support controls that improve nearby resource access while preserving legality, spacing, ranges, regions, exclusions, and landmass equity.",
    }
  ),
});
