import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Fixes coast distance to uniform hex-hop distance from all admitted coastal seeds at once.
 * The strategy has no tuning surface: seeds are always distance zero, and an input with no seeds
 * leaves every tile at the unsigned-16-bit unreached sentinel.
 */
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
