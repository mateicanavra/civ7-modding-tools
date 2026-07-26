import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Declares authored configuration for the `multi-source-hex-bfs` implementation of `morphology/compute-distance-to-coast`. */
export default defineStrategy({
  id: "multi-source-hex-bfs",
  config: Type.Object(
    {},
    {
      additionalProperties: false,
      description: "Parameter-free multi-source hex BFS from the coastal seed mask.",
    }
  ),
});
