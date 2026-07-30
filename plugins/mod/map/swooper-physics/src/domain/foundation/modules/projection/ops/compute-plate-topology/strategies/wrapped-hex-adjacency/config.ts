import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Semantic identity for wrapped-hex plate adjacency, whose behavior is fully determined by input.
 * Topology input and output remain owned by the shared operation contract.
 */
export default defineStrategy({
  id: "wrapped-hex-adjacency",
  config: Type.Object(
    {},
    {
      additionalProperties: false,
      description:
        "Parameter-free wrapped-hex adjacency strategy; topology is determined entirely by the admitted plate-id raster.",
    }
  ),
});
