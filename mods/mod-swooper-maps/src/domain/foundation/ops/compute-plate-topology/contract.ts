import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

import { Schema as FoundationPlateTopologySchema } from "../../artifacts/plate-topology.artifact.js";

/**
 * compute-plate-topology — build the plate adjacency graph from the tile-space
 * plate-id field. This is a tile-derived (projection-adjacent) product: it reads
 * the projected per-tile plate ids and summarizes whole-plate adjacency so
 * higher-level logic can reason about plates instead of tile-level boundary
 * noise. The plate budget is derived from the raster (max id + 1).
 *
 * NOTE (follow-on): a mesh-native variant could derive adjacency directly from
 * `foundation.plateGraph` + `foundation.mesh` and move to the plates stage; that
 * changes output and is intentionally out of scope for the identity-preserving
 * decomposition. See docs/projects/foundation-stage-decomposition.
 */
const ComputePlateTopologyContract = defineOp({
  kind: "compute",
  id: "foundation/compute-plate-topology",
  input: Type.Object(
    {
      plateIds: TypedArraySchemas.i16({
        cardinality: ["width", "height"],
        description: "Plate id per tile (tile order).",
      }),
      width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
      height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    { plateTopology: FoundationPlateTopologySchema },
    { additionalProperties: false }
  ),
  strategies: {
    default: Type.Object({}, { additionalProperties: false }),
  },
});

export default ComputePlateTopologyContract;
