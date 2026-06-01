import { Type, type Static } from "@swooper/mapgen-core/authoring";

/**
 * Island chain placement using deterministic noise and volcanism signals.
 */
export const IslandsConfigSchema = Type.Object({
  /** Noise cutoff for island seeds (percent). Higher values mean fewer, larger island groups. */
  fractalThresholdPercent: Type.Number({
    description:
      "Controls noise cutoff for map island seeds; higher values mean fewer, larger island groups.",
    default: 90,
    minimum: 0,
    maximum: 100,
  }),
  /** Minimum spacing from continental landmasses (tiles) to prevent coastal clutter. */
  minDistFromLandRadius: Type.Number({
    description: "Controls minimum spacing from continental landmasses to prevent coastal island clutter.",
    default: 2,
    minimum: 0,
    maximum: 128,
  }),
  /**
   * Island frequency near active margins.
   * Lower denominators spawn more volcanic arcs like Japan.
   */
  baseIslandDenNearActive: Type.Number({
    description:
      "Controls island frequency near active margins; lower denominators spawn more volcanic arcs.",
    default: 5,
    minimum: 1,
    maximum: 256,
  }),
  /** Island frequency away from active margins; controls interior archipelagos. */
  baseIslandDenElse: Type.Number({
    description: "Controls island frequency away from active margins and shapes interior archipelagos.",
    default: 7,
    minimum: 1,
    maximum: 256,
  }),
  /**
   * Island seed frequency along volcanism signals.
   * Smaller values create Hawaii-style chains.
   */
  hotspotSeedDenom: Type.Number({
    description:
      "Controls island seed frequency along volcanism signals; smaller values create hotspot chains.",
    default: 2,
    minimum: 1,
    maximum: 256,
  }),
  /** Maximum tiles per island cluster to cap archipelago size (tiles). */
  clusterMax: Type.Number({
    description: "Controls maximum tiles per island cluster to cap archipelago size.",
    default: 3,
    minimum: 1,
    maximum: 256,
  }),
  /** Chance of spawning larger microcontinent chains outside major margins (0..1). */
  microcontinentChance: Type.Number({
    description: "Controls chance of spawning larger microcontinent island chains outside major margins (0..1).",
    default: 0,
    minimum: 0,
    maximum: 1,
  }),
}, {
  additionalProperties: false,
  description: "Controls deterministic island chain placement and archipelago sizing.",
});

export const IslandChainsConfigSchema = Type.Object(
  {
    islands: IslandsConfigSchema,
  },
  {
    additionalProperties: false,
    description: "Island-chain controls exposed as the Morphology feature authoring surface.",
  }
);

export type IslandsConfig = Static<typeof IslandsConfigSchema>;
