import { Type, type Static } from "@swooper/mapgen-core/authoring";

/**
 * Island chain placement using deterministic noise and volcanism signals.
 */
export const IslandsConfigSchema = Type.Object({
  /** Noise cutoff for island seeds (percent). Higher values mean fewer, larger island groups. */
  fractalThresholdPercent: Type.Number({
    description:
      "Noise cutoff for island seeds (percent). Higher values mean fewer, larger island groups.",
    default: 90,
    minimum: 0,
    maximum: 100,
  }),
  /** Minimum spacing from continental landmasses (tiles) to prevent coastal clutter. */
  minDistFromLandRadius: Type.Number({
    description: "Minimum spacing from continental landmasses (tiles) to prevent coastal clutter.",
    default: 2,
    minimum: 0,
  }),
  /**
   * Island frequency near active margins.
   * Lower denominators spawn more volcanic arcs like Japan.
   */
  baseIslandDenNearActive: Type.Number({
    description:
      "Island frequency near active margins; lower denominators spawn more volcanic arcs like Japan.",
    default: 5,
    minimum: 1,
  }),
  /** Island frequency away from active margins; controls interior archipelagos. */
  baseIslandDenElse: Type.Number({
    description: "Island frequency away from active margins; controls interior archipelagos.",
    default: 7,
    minimum: 1,
  }),
  /**
   * Island seed frequency along volcanism signals.
   * Smaller values create Hawaii-style chains.
   */
  hotspotSeedDenom: Type.Number({
    description:
      "Island seed frequency along volcanism signals; smaller values create Hawaii-style chains.",
    default: 2,
    minimum: 1,
  }),
  /** Maximum tiles per island cluster to cap archipelago size (tiles). */
  clusterMax: Type.Number({
    description: "Maximum tiles per island cluster to cap archipelago size (tiles).",
    default: 3,
    minimum: 1,
  }),
  /** Chance of spawning larger microcontinent chains outside major margins (0..1). */
  microcontinentChance: Type.Number({
    description: "Chance of spawning larger microcontinent chains outside major margins (0..1).",
    default: 0,
    minimum: 0,
    maximum: 1,
  }),
});

export const IslandChainsConfigSchema = Type.Object({
  islands: IslandsConfigSchema,
});

export type IslandsConfig = Static<typeof IslandsConfigSchema>;
