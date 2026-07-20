import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Island chain placement using deterministic noise and volcanism signals.
 */
const IslandsConfigSchema = Type.Object(
  {
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
      description:
        "Controls minimum spacing from continental landmasses to prevent coastal island clutter.",
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
      description:
        "Controls island frequency away from active margins and shapes interior archipelagos.",
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
      description:
        "Controls chance of spawning larger microcontinent island chains outside major margins (0..1).",
      default: 0,
      minimum: 0,
      maximum: 1,
    }),
  },
  {
    additionalProperties: false,
    description: "Controls deterministic island chain placement and archipelago sizing.",
  }
);

const IslandChainsConfigSchema = Type.Object(
  {
    islands: IslandsConfigSchema,
  },
  {
    additionalProperties: false,
    description: "Island-chain controls exposed as the Morphology feature authoring surface.",
  }
);

const IslandEditSchema = Type.Object({
  index: Type.Integer({ minimum: 0, description: "Tile index in row-major order." }),
  kind: Type.Union([Type.Literal("coast"), Type.Literal("peak")], {
    description: "Island terrain kind to apply at this tile.",
  }),
});

/**
 * Plans island chain edits to apply after base land/sea shaping.
 */
const PlanIslandChainsContract = defineOp({
  kind: "plan",
  id: "morphology/plan-island-chains",
  input: Type.Object({
    width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
    height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
    landMask: TypedArraySchemas.u8({ description: "Land mask per tile (1=land, 0=water)." }),
    boundaryCloseness: TypedArraySchemas.u8({
      description: "Boundary proximity per tile (0..255).",
    }),
    boundaryType: TypedArraySchemas.u8({
      description: "Boundary type per tile (1=conv,2=div,3=trans).",
    }),
    volcanism: TypedArraySchemas.u8({ description: "Volcanism signal per tile (0..255)." }),
    rngSeed: Type.Integer({ description: "Seed for deterministic island placement." }),
  }),
  output: Type.Object({
    edits: Type.Array(IslandEditSchema, {
      description: "Terrain edits to apply for island chains.",
    }),
  }),
  defaultStrategy: "default",
  strategies: {
    default: IslandChainsConfigSchema,
  },
});

export default PlanIslandChainsContract;
