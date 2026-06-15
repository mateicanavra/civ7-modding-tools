import { type Static, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Corridor config lives with the corridor owner because these policies decide
 * how sea, land, and island-hop overlays are tagged and protected. The root
 * narrative config only composes this schema into the public aggregate.
 */
export const SeaCorridorPolicySchema = Type.Object(
  {
    /**
     * Hard protection blocks edits in corridors; soft allows limited carving
     * with penalties for cases where perfect lane preservation is too rigid.
     */
    protection: Type.Optional(
      Type.Union([Type.Literal("hard"), Type.Literal("soft")], {
        description:
          "Hard protection blocks edits in corridors; soft allows limited carving with penalties.",
        default: "hard",
      })
    ),
    /** Probability multiplier applied when soft protection keeps lanes mostly open. */
    softChanceMultiplier: Type.Optional(
      Type.Number({
        description:
          "Probability multiplier applied when protection is soft to keep lanes mostly open.",
        default: 0.5,
        minimum: 0,
        maximum: 1,
      })
    ),
    /** Radius in tiles to avoid placing blocking features inside a sea corridor. */
    avoidRadius: Type.Optional(
      Type.Number({
        description: "Radius in tiles to avoid placing blocking features inside a sea corridor.",
        default: 2,
        minimum: 0,
      })
    ),
    /** Maximum sea lanes to tag. */
    maxLanes: Type.Optional(
      Type.Number({
        description: "Maximum sea lanes to tag (integer).",
        default: 3,
        minimum: 0,
      })
    ),
    /** Scan stride in tiles when searching for candidate lanes. */
    scanStride: Type.Optional(
      Type.Number({
        description: "Scan stride in tiles when searching for candidate lanes (integer).",
        default: 6,
        minimum: 1,
      })
    ),
    /** Minimum run length fraction relative to map dimension. */
    minLengthFrac: Type.Optional(
      Type.Number({
        description: "Minimum run length fraction relative to map dimension (0..1).",
        default: 0.7,
        minimum: 0,
        maximum: 1,
      })
    ),
    /** Whether diagonal lanes are eligible during tagging. */
    preferDiagonals: Type.Optional(
      Type.Boolean({
        description: "Whether diagonal lanes are eligible during tagging.",
        default: false,
      })
    ),
    /** Minimum spacing between accepted lanes. */
    laneSpacing: Type.Optional(
      Type.Number({
        description: "Minimum spacing between accepted lanes (tiles).",
        default: 6,
        minimum: 0,
      })
    ),
    /** Minimum required channel width for a tile to be considered part of a lane. */
    minChannelWidth: Type.Optional(
      Type.Number({
        description:
          "Minimum required channel width for a tile to be considered part of a lane (tiles).",
        default: 3,
        minimum: 1,
      })
    ),
  },
  { additionalProperties: false }
);

export const IslandHopCorridorConfigSchema = Type.Object(
  {
    /** Whether island-hop corridors should be tagged from hotspots. */
    useHotspots: Type.Optional(
      Type.Boolean({
        description: "Whether island-hop corridors should be tagged from hotspots.",
        default: true,
      })
    ),
    /** Maximum hotspot arcs to tag. */
    maxArcs: Type.Optional(
      Type.Number({
        description: "Maximum hotspot arcs to tag (integer).",
        default: 2,
        minimum: 0,
      })
    ),
  },
  { additionalProperties: false }
);

export const LandCorridorConfigSchema = Type.Object(
  {
    /** Strength of biome biasing near land corridors. */
    biomesBiasStrength: Type.Optional(
      Type.Number({
        description: "Strength of biome biasing near land corridors (0..1).",
        default: 0.6,
        minimum: 0,
        maximum: 1,
      })
    ),
    /** Whether rift shoulders should seed land corridors. */
    useRiftShoulders: Type.Optional(
      Type.Boolean({
        description: "Whether rift shoulders should seed land corridors.",
        default: true,
      })
    ),
    /** Maximum land corridors to tag. */
    maxCorridors: Type.Optional(
      Type.Number({
        description: "Maximum land corridors to tag (integer).",
        default: 2,
        minimum: 0,
      })
    ),
    /** Minimum contiguous run length required to tag a corridor. */
    minRunLength: Type.Optional(
      Type.Number({
        description: "Minimum contiguous run length required to tag a corridor (tiles).",
        default: 24,
        minimum: 0,
      })
    ),
    /** Minimum spacing between corridors. */
    spacing: Type.Optional(
      Type.Number({
        description: "Minimum spacing between corridors (rows).",
        default: 0,
        minimum: 0,
      })
    ),
  },
  { additionalProperties: false }
);

export const CorridorsConfigSchema = Type.Object(
  {
    /** Sea corridor protection policy for naval passage. */
    sea: Type.Optional(SeaCorridorPolicySchema),
    /** Land corridor tagging policy (rift-driven). */
    land: Type.Optional(LandCorridorConfigSchema),
    /** Island-hop corridor tagging policy (hotspot-driven). */
    islandHop: Type.Optional(IslandHopCorridorConfigSchema),
  },
  { additionalProperties: false }
);

export type CorridorsConfig = Static<typeof CorridorsConfigSchema>;
export type SeaCorridorPolicy = Static<typeof SeaCorridorPolicySchema>;
export type LandCorridorConfig = Static<typeof LandCorridorConfigSchema>;
export type IslandHopCorridorConfig = Static<typeof IslandHopCorridorConfigSchema>;
