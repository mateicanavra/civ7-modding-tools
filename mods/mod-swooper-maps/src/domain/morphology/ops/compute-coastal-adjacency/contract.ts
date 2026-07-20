import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Land/water shoreline adjacency for a given land mask.
 *
 * For each tile, a tile is "coastal" iff it has at least one odd-Q hex neighbor
 * of the opposite class: land touching water => coastalLand; water touching land
 * => coastalWater. Geometry-only, no physics, no config.
 *
 * This is the pure form of the adjacency pass that compute-coastline-metrics runs
 * internally after carving. It is its own op because the carve op cannot delegate
 * (op-calls-op is forbidden) and the post-features shelf stage needs adjacency on
 * the FINAL post-island land mask — a different vintage than the carved coastline.
 */
const ComputeCoastalAdjacencyContract = defineOp({
  kind: "compute",
  id: "morphology/compute-coastal-adjacency",
  input: Type.Object({
    width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
    height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
    landMask: TypedArraySchemas.u8({ description: "Land mask per tile (1=land, 0=water)." }),
  }),
  output: Type.Object({
    coastalLand: TypedArraySchemas.u8({ description: "Mask (1/0): land tiles adjacent to water." }),
    coastalWater: TypedArraySchemas.u8({
      description: "Mask (1/0): water tiles adjacent to land.",
    }),
  }),
  defaultStrategy: "default",
  strategies: {
    default: Type.Object(
      {},
      {
        additionalProperties: false,
        description: "Parameter-free shoreline adjacency over the odd-Q hex grid.",
      }
    ),
  },
});

export default ComputeCoastalAdjacencyContract;
