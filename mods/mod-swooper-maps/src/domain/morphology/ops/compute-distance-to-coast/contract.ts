import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Shared multi-source BFS that labels every tile with its hex-distance to the
 * nearest coastal tile.
 *
 * "Coastal" is caller-defined via the `coastal` seed mask (1 = a distance-0
 * source). The op is geometry-only: it has no physics and no config — it simply
 * floods outward over the odd-Q hex grid. It is reused at two points in the
 * pipeline that previously each carried their own copy of the BFS:
 *  - stage-2 coast carving (distance from the carved coastline), and
 *  - the post-features shelf stage (distance from the post-island coastline).
 *
 * Tiles unreachable from any seed (or every tile, when the seed mask is empty)
 * retain the sentinel 65535.
 */
const ComputeDistanceToCoastContract = defineOp({
  kind: "compute",
  id: "morphology/compute-distance-to-coast",
  input: Type.Object({
    width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
    height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
    coastal: TypedArraySchemas.u8({
      description:
        "Seed mask (1/0): tiles at distance 0 (the coastline) from which the BFS floods.",
    }),
  }),
  output: Type.Object({
    distanceToCoast: TypedArraySchemas.u16({
      description:
        "Hex-distance to the nearest coastal seed per tile (0 = coastal). Unreachable tiles are 65535.",
    }),
  }),
  strategies: {
    default: Type.Object(
      {},
      {
        additionalProperties: false,
        description: "Parameter-free multi-source hex BFS from the coastal seed mask.",
      }
    ),
  },
});

export default ComputeDistanceToCoastContract;
