import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Plate topology node: per-plate adjacency + centroid/area derived from the
 * tile-space plate-id raster. `area`/`centroid` are tile-space aggregates;
 * `neighbors` is the sorted, unique set of bordering plate ids.
 */
const FoundationPlateTopologyNodeSchema = Type.Object(
  {
    /** Plate id (0..plateCount-1). */
    id: Type.Integer({ minimum: 0, description: "Plate id (0..plateCount-1)." }),
    /** Plate area in tiles. */
    area: Type.Integer({ minimum: 0, description: "Plate area in tiles." }),
    /** Plate centroid in tile-space coordinates. */
    centroid: Type.Object(
      {
        /** Plate centroid X (tile space). */
        x: Type.Number({ description: "Plate centroid X (tile space)." }),
        /** Plate centroid Y (tile space). */
        y: Type.Number({ description: "Plate centroid Y (tile space)." }),
      },
      { description: "Plate centroid in tile-space coordinates." }
    ),
    /** Sorted, unique adjacent plate ids. */
    neighbors: Type.Array(Type.Integer({ minimum: 0, description: "Neighbor plate id." }), {
      default: [],
      description: "Sorted, unique adjacent plate ids.",
    }),
  },
  { description: "Plate topology node (adjacency + centroid/area)." }
);

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
        shape: null,
        description: "Plate id per tile (tile order).",
      }),
      width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
      height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      plateTopology: Type.Object(
        {
          /** Number of plates included in the topology payload. */
          plateCount: Type.Integer({ minimum: 1, description: "Number of plates." }),
          /** Plate topology nodes (indexed by plate id). */
          plates: Type.Array(FoundationPlateTopologyNodeSchema, {
            description: "Plate topology nodes (indexed by plate id).",
          }),
        },
        { description: "Foundation plate topology (tile-derived adjacency + centroid/area)." }
      ),
    },
    { additionalProperties: false }
  ),
  strategies: {
    default: Type.Object({}, { additionalProperties: false }),
  },
});

export default ComputePlateTopologyContract;
