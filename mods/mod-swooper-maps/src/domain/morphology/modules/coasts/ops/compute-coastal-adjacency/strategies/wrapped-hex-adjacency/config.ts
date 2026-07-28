import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Fixes shoreline classification to the map's wrapped odd-Q hex topology.
 * The strategy is deliberately parameter-free: a tile is coastal exactly when any neighbor has
 * the opposite land/water identity, keeping the paired coastal masks mutually consistent.
 */
export default defineStrategy({
  id: "wrapped-hex-adjacency",
  config: Type.Object(
    {},
    {
      additionalProperties: false,
      description: "Parameter-free shoreline adjacency over the odd-Q hex grid.",
    }
  ),
});
