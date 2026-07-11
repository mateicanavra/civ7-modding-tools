import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

const FeatureSubstrateConfigSchema = Type.Object(
  {
    nearRiverRadius: Type.Integer({
      description: "Square-radius used to compute near-river adjacency mask.",
      default: 2,
      minimum: 0,
      maximum: 64,
    }),
    isolatedRiverRadius: Type.Integer({
      description: "Square-radius used to compute isolated-river adjacency mask.",
      default: 1,
      minimum: 0,
      maximum: 64,
    }),
    coastalAdjacencyRadius: Type.Integer({
      description: "Square-radius used to compute coastal land adjacency mask.",
      default: 1,
      minimum: 0,
      maximum: 64,
    }),
    lowlandMaxElevationAboveSeaM: Type.Integer({
      description: "Maximum land elevation above sea level treated as lowland wetland substrate.",
      default: 160,
      minimum: 0,
      maximum: 12_000,
    }),
    intertidalMaxElevationAboveSeaM: Type.Integer({
      description:
        "Maximum coastal land elevation above sea level treated as intertidal substrate.",
      default: 40,
      minimum: 0,
      maximum: 12_000,
    }),
    floodplainDischargeMin: Type.Number({
      description: "Minimum nearby discharge treated as meaningful floodplain water exchange.",
      default: 0,
      minimum: 0,
      maximum: 1_000_000,
    }),
  },
  {
    additionalProperties: false,
    description:
      "Shared compute substrate tuning for feature planning masks. This should stay small and reusable.",
  }
);

/**
 * Computes reusable feature-planning substrate masks (rivers + coastal adjacency) for multiple planners.
 */
const ComputeFeatureSubstrateContract = defineOp({
  kind: "compute",
  id: "ecology/compute-feature-substrate",
  input: Type.Object(
    {
      width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
      height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
      riverClass: TypedArraySchemas.u8({
        description: "River class per tile (0=no river, >0 indicates river presence).",
      }),
      navigableRiverMask: TypedArraySchemas.u8({
        description:
          "Materialized navigable-river terrain mask from map-rivers projection (1=navigable river terrain).",
      }),
      landMask: TypedArraySchemas.u8({
        description: "Land mask per tile (1=land, 0=water).",
      }),
      elevation: TypedArraySchemas.i16({
        description: "Elevation in meters, using the same datum as seaLevel.",
      }),
      seaLevel: Type.Number({
        description: "Global sea-level datum in meters.",
      }),
      discharge: TypedArraySchemas.f32({
        description: "Hydrology discharge proxy per tile.",
      }),
      sinkMask: TypedArraySchemas.u8({
        description: "Mask (1/0): local drainage sink or depression.",
      }),
    },
    { additionalProperties: false }
  ),
  output: Type.Object({
    navigableRiverMask: TypedArraySchemas.u8({
      description: "Mask (1/0): materialized navigable-river terrain tiles.",
    }),
    nearRiverMask: TypedArraySchemas.u8({
      description: "Mask (1/0): tiles within nearRiverRadius of any river tile.",
    }),
    isolatedRiverMask: TypedArraySchemas.u8({
      description: "Mask (1/0): tiles within isolatedRiverRadius of any river tile.",
    }),
    coastalLandMask: TypedArraySchemas.u8({
      description: "Mask (1/0): land tiles within coastalAdjacencyRadius of any water tile.",
    }),
    lowlandMask: TypedArraySchemas.u8({
      description: "Mask (1/0): land tiles close enough to sea level for wetland substrate.",
    }),
    floodplainMask: TypedArraySchemas.u8({
      description: "Mask (1/0): lowland land with nearby meaningful river water exchange.",
    }),
    intertidalCoastMask: TypedArraySchemas.u8({
      description: "Mask (1/0): low coastal land adjacent to water.",
    }),
    sinkBasinMask: TypedArraySchemas.u8({
      description: "Mask (1/0): lowland drainage sinks/depressions.",
    }),
    hydromorphicMask: TypedArraySchemas.u8({
      description: "Mask (1/0): floodplain, intertidal, or sink-basin wetland substrate.",
    }),
    wellDrainedMask: TypedArraySchemas.u8({
      description: "Mask (1/0): land outside hydromorphic substrate.",
    }),
    isolatedWaterPointMask: TypedArraySchemas.u8({
      description: "Mask (1/0): isolated lowland water-point substrate for arid wet features.",
    }),
  }),
  strategies: {
    default: FeatureSubstrateConfigSchema,
  },
});

export default ComputeFeatureSubstrateContract;
