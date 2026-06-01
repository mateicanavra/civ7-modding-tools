import { Type, type Static } from "@swooper/mapgen-core/authoring";

/**
 * Volcano placement controls combining plate-aware arcs and hotspot trails.
 */
export const VolcanoesConfigSchema = Type.Object({
  /** Master toggle for volcano placement. */
  enabled: Type.Boolean({
    description: "Master toggle for volcano placement.",
    default: true,
  }),
  /** Baseline volcanoes per land tile; higher density spawns more vents overall. */
  baseDensity: Type.Number({
    description: "Baseline volcanoes per land tile; higher density spawns more vents overall.",
    default: 1 / 170,
    minimum: 0,
  }),
  /** Minimum Euclidean distance between volcanoes in tiles to avoid clusters merging. */
  minSpacing: Type.Number({
    description: "Minimum Euclidean distance between volcanoes in tiles to avoid clusters merging.",
    default: 3,
    minimum: 0,
  }),
  /** Plate-boundary closeness threshold (0..1) for treating a tile as margin-adjacent. */
  boundaryThreshold: Type.Number({
    description:
      "Plate-boundary closeness threshold (0..1) for treating a tile as margin-adjacent.",
    default: 0.35,
    minimum: 0,
    maximum: 1,
  }),
  /** Base weight applied to tiles within the boundary band, biasing arcs over interiors. */
  boundaryWeight: Type.Number({
    description:
      "Base weight applied to tiles within the boundary band, biasing arcs over interiors.",
    default: 1.2,
    minimum: 0,
  }),
  /** Weight multiplier for convergent boundaries; raises classic arc volcano density. */
  convergentMultiplier: Type.Number({
    description: "Weight multiplier for convergent boundaries; raises classic arc volcano density.",
    default: 2.4,
    minimum: 0,
  }),
  /** Weight multiplier for transform boundaries; typically lower to avoid shear volcanism. */
  transformMultiplier: Type.Number({
    description:
      "Weight multiplier for transform boundaries; typically lower to avoid shear volcanism.",
    default: 1.1,
    minimum: 0,
  }),
  /** Weight multiplier for divergent boundaries; keep small to prevent rift volcanism dominating. */
  divergentMultiplier: Type.Number({
    description:
      "Weight multiplier for divergent boundaries; keep small to prevent rift volcanism dominating.",
    default: 0.35,
    minimum: 0,
  }),
  /** Weight contribution for interior hotspots; increases inland/shield volcano presence. */
  hotspotWeight: Type.Number({
    description:
      "Weight contribution for interior hotspots; increases inland/shield volcano presence.",
    default: 0.12,
    minimum: 0,
  }),
  /** Penalty applied using shield stability; higher values suppress volcanoes on ancient cratons. */
  shieldPenalty: Type.Number({
    description:
      "Penalty applied using shield stability; higher values suppress volcanoes on ancient cratons.",
    default: 0.6,
    minimum: 0,
    maximum: 1,
  }),
  /** Random additive jitter per tile to break up deterministic patterns. */
  randomJitter: Type.Number({
    description: "Random additive jitter per tile to break up deterministic patterns.",
    default: 0.08,
    minimum: 0,
  }),
  /** Minimum volcano count target to guarantee a few vents even on sparse maps. */
  minVolcanoes: Type.Number({
    description: "Minimum volcano count target to guarantee a few vents even on sparse maps.",
    default: 5,
    minimum: 0,
  }),
  /** Maximum volcano count cap; set <=0 to disable the cap and allow density-driven totals. */
  maxVolcanoes: Type.Number({
    description:
      "Maximum volcano count cap; set <=0 to disable the cap and allow density-driven totals.",
    default: 40,
  }),
});

export type VolcanoesConfig = Static<typeof VolcanoesConfigSchema>;
