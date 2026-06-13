import { Type, type Static } from "@swooper/mapgen-core/authoring";

/**
 * Tagging config owns hotspot, rift, and margin schemas because those knobs
 * directly shape story overlay tagging. The root narrative config imports these
 * schemas only to assemble the public recipe-facing aggregate.
 */
export const HotspotTunablesSchema = Type.Object(
  {
    /** Maximum hotspot trails to seed, before map-size scaling. */
    maxTrails: Type.Optional(
      Type.Number({
        description: "Maximum hotspot trails to seed (pre-scaling).",
        default: 12,
        minimum: 0,
      })
    ),
    /** Steps per trail before map-size scaling. */
    steps: Type.Optional(
      Type.Number({
        description: "Steps per hotspot trail (pre-scaling).",
        default: 15,
        minimum: 1,
      })
    ),
    /** Step length in tiles for each trail advance. */
    stepLen: Type.Optional(
      Type.Number({
        description: "Step length in tiles for hotspot trails.",
        default: 2,
        minimum: 1,
      })
    ),
    /** Minimum Manhattan distance from land for trail points. */
    minDistFromLand: Type.Optional(
      Type.Number({
        description: "Minimum Manhattan distance from land for hotspot trail points (tiles).",
        default: 5,
        minimum: 0,
      })
    ),
    /** Minimum Manhattan separation between seeded trails. */
    minTrailSeparation: Type.Optional(
      Type.Number({
        description: "Minimum Manhattan separation between seeded hotspot trails (tiles).",
        default: 12,
        minimum: 1,
      })
    ),
    /** Bias applied to paradise hotspots when selecting overlays. */
    paradiseBias: Type.Optional(
      Type.Number({
        description:
          "Bias applied to paradise hotspots when selecting overlays (unitless multiplier).",
        default: 2,
      })
    ),
    /** Bias applied to volcanic hotspots when selecting overlays. */
    volcanicBias: Type.Optional(
      Type.Number({
        description:
          "Bias applied to volcanic hotspots when selecting overlays (unitless multiplier).",
        default: 1,
      })
    ),
    /** Chance that a volcanic hotspot contains a high peak suitable for story placement. */
    volcanicPeakChance: Type.Optional(
      Type.Number({
        description:
          "Chance that a volcanic hotspot contains a high peak suitable for story placement (0..1).",
        default: 0.33,
        minimum: 0,
        maximum: 1,
      })
    ),
  },
  { additionalProperties: false }
);

export const RiftTunablesSchema = Type.Object(
  {
    /** Maximum rift valleys per map before map-size scaling. */
    maxRiftsPerMap: Type.Optional(
      Type.Number({
        description: "Maximum rift valleys per map (pre-scaling).",
        default: 3,
        minimum: 0,
      })
    ),
    /** Steps along each rift line before map-size scaling. */
    lineSteps: Type.Optional(
      Type.Number({
        description: "Steps along each rift line (pre-scaling).",
        default: 18,
        minimum: 1,
      })
    ),
    /** Step length for rift marching. */
    stepLen: Type.Optional(
      Type.Number({
        description: "Step length for rift marching (tiles).",
        default: 2,
        minimum: 1,
      })
    ),
    /** Shoulder width around rift lines. */
    shoulderWidth: Type.Optional(
      Type.Number({
        description: "Shoulder width around rift lines (tiles).",
        default: 1,
        minimum: 0,
      })
    ),
  },
  { additionalProperties: false }
);

export const ContinentalMarginsConfigSchema = Type.Object(
  {
    /** Fraction of coastal tiles to tag as active margins. */
    activeFraction: Type.Optional(
      Type.Number({
        description: "Fraction of coastal tiles to tag as active margins (0..1).",
        default: 0.25,
        minimum: 0,
        maximum: 1,
      })
    ),
    /** Fraction of coastal tiles to tag as passive shelves. */
    passiveFraction: Type.Optional(
      Type.Number({
        description: "Fraction of coastal tiles to tag as passive shelves (0..1).",
        default: 0.25,
        minimum: 0,
        maximum: 1,
      })
    ),
    /** Minimum contiguous coastline segment length to consider. */
    minSegmentLength: Type.Optional(
      Type.Number({
        description: "Minimum contiguous coastline segment length to consider.",
        default: 12,
        minimum: 0,
      })
    ),
  },
  { additionalProperties: false }
);

export type NarrativeHotspotTunables = Static<typeof HotspotTunablesSchema>;
export type RiftTunables = Static<typeof RiftTunablesSchema>;
export type ContinentalMarginsConfig = Static<typeof ContinentalMarginsConfigSchema>;
