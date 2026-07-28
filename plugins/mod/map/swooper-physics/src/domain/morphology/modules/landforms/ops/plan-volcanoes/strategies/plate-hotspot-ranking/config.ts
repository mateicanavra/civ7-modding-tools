import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Controls volcano demand, wrapped-hex spacing, and the balance between boundary and intraplate
 * evidence used to rank land candidates. `maxVolcanoes` is normalized up to `minVolcanoes` when
 * necessary, but sparse candidates or spacing conflicts may still leave the plan below its target.
 */
export default defineStrategy({
  id: "plate-hotspot-ranking",
  config: Type.Object(
    {
      /** Master toggle for volcano placement. */
      enabled: Type.Boolean({
        description: "Controls whether map volcano placement is enabled.",
        default: true,
      }),
      /** Baseline volcanoes per land tile; higher density spawns more vents overall. */
      baseDensity: Type.Number({
        description:
          "Controls baseline volcanoes per land tile; higher density spawns more vents overall.",
        default: 1 / 170,
        minimum: 0,
        maximum: 1,
      }),
      /** Minimum wrapped-hex distance between volcanoes in tiles. */
      minSpacing: Type.Integer({
        description:
          "Controls minimum wrapped-hex distance between planned volcanoes so seam-adjacent tiles cannot form accidental clusters.",
        default: 3,
        minimum: 1,
        maximum: 128,
      }),
      /** Plate-boundary closeness threshold (0..1) for treating a tile as margin-adjacent. */
      boundaryThreshold: Type.Number({
        description:
          "Controls plate-boundary closeness threshold for treating a tile as margin-adjacent (0..1).",
        default: 0.35,
        minimum: 0,
        maximum: 1,
      }),
      /** Base weight applied to tiles within the boundary band, biasing arcs over interiors. */
      boundaryWeight: Type.Number({
        description:
          "Controls base volcano weight applied to tiles within the boundary band, biasing arcs over interiors.",
        default: 1.2,
        minimum: 0,
        maximum: 10,
      }),
      /** Weight multiplier for convergent boundaries; raises classic arc volcano density. */
      convergentMultiplier: Type.Number({
        description: "Controls convergent-boundary volcano multiplier for classic arc density.",
        default: 2.4,
        minimum: 0,
        maximum: 10,
      }),
      /** Weight multiplier for transform boundaries; typically lower to avoid shear volcanism. */
      transformMultiplier: Type.Number({
        description:
          "Controls transform-boundary volcano multiplier; typically lower to avoid shear volcanism.",
        default: 1.1,
        minimum: 0,
        maximum: 10,
      }),
      /** Weight multiplier for divergent boundaries; keep small to prevent rift volcanism dominating. */
      divergentMultiplier: Type.Number({
        description:
          "Controls divergent-boundary volcano multiplier; keep small to prevent rift volcanism dominating.",
        default: 0.35,
        minimum: 0,
        maximum: 10,
      }),
      /** Weight contribution for interior hotspots; increases inland/shield volcano presence. */
      hotspotWeight: Type.Number({
        description:
          "Controls interior hotspot volcano weight; increases inland/shield volcano presence.",
        default: 0.12,
        minimum: 0,
        maximum: 10,
      }),
      /** Penalty applied using shield stability; higher values suppress volcanoes on ancient cratons. */
      shieldPenalty: Type.Number({
        description:
          "Controls shield-stability penalty; higher values suppress volcanoes on ancient cratons.",
        default: 0.6,
        minimum: 0,
        maximum: 1,
      }),
      /** Random additive jitter per tile to break up deterministic patterns. */
      randomJitter: Type.Number({
        description:
          "Controls additive map jitter per tile to break up deterministic volcano patterns.",
        default: 0.08,
        minimum: 0,
        maximum: 10,
      }),
      /** Desired volcano-count floor before candidate and spacing constraints are applied. */
      minVolcanoes: Type.Integer({
        description:
          "Controls the desired volcano-count floor; candidate availability and spacing remain authoritative over the completed plan.",
        default: 5,
        minimum: 0,
        maximum: 1000,
      }),
      /** Maximum volcano count admitted into the completed plan. */
      maxVolcanoes: Type.Integer({
        description: "Controls the hard maximum number of volcano intents admitted into the plan.",
        default: 40,
        minimum: 0,
        maximum: 1000,
      }),
    },
    {
      additionalProperties: false,
      description: "Volcano controls for plate-aware arcs, hotspots, spacing, and count caps.",
    }
  ),
});
