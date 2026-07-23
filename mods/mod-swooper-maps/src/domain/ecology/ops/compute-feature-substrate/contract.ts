import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import strategies from "./strategies/contract.js";

/** Derives shared river, coastal, lowland, and hydromorphic masks so feature planners consume one physical substrate authority. Every implementation shares this admitted input and output boundary. */
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
  strategies,
});

export default ComputeFeatureSubstrateContract;
