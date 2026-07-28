import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import strategyDefinition from "./strategies/wrapped-hex-adjacency/config.js";

/**
 * Land/water shoreline adjacency for a given land mask.
 *
 * For each tile, a tile is "coastal" iff it has at least one odd-Q hex neighbor
 * of the opposite class: land touching water => coastalLand; water touching land
 * => coastalWater. Geometry-only, no physics, no config.
 *
 * The base-coastline step runs it against initial Morphology topography, while
 * the post-features shelf stage runs it again against final post-island land.
 * Those callers deliberately preserve distinct coastline vintages.
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
  strategies: [strategyDefinition],
});

export default ComputeCoastalAdjacencyContract;
