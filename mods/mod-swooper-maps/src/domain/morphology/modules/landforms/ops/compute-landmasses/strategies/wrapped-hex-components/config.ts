import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Fixes landmass identity to connected components on the map's wrapped odd-Q hex topology.
 * The strategy is parameter-free and assigns stable IDs after sorting components by size and
 * deterministic tie-breakers, so downstream region planning does not inherit traversal order.
 */
export default defineStrategy({
  id: "wrapped-hex-components",
  config: Type.Object(
    {},
    {
      description:
        "Connected-component decomposition with horizontal wrap and deterministic size-ranked landmass IDs; topology and ordering are not author-tunable.",
    }
  ),
});
