import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Connected-component and coast-distance traversal derive basin identity, normals, and tangents from one topology. */
export default defineStrategy({
  id: "connected-basins",
  config: Type.Object(
    {
      /** Max coast distance to compute in BFS steps (cap for cost + stability). */
      maxCoastDistance: Type.Integer({
        default: 64,
        minimum: 1,
        maximum: 1024,
        description: "Max coast distance to compute in BFS steps (cap for cost + stability).",
      }),
      /** Max coast distance at which to emit coast normal/tangent vectors. */
      maxCoastVectorDistance: Type.Integer({
        default: 10,
        minimum: 0,
        maximum: 256,
        description: "Max coast distance at which to emit coast normal/tangent vectors.",
      }),
    },
    {
      additionalProperties: false,
      description: "Ocean geometry parameters (connected-basins strategy).",
    }
  ),
});
