import morphology from "../../../../../../../domain/morphology/index.js";
import { artifacts as morphologyRoutingArtifacts } from "../../../../../../../domain/morphology/modules/routing/artifacts/index.js";
import { artifacts as morphologyTerrainArtifacts } from "../../../../../../../domain/morphology/modules/terrain/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Computes Morphology's geomorphic routing proxy from current topography.
 *
 * Hydrology computes canonical drainage routing separately over final
 * Morphology topography.
 */
export const config = defineStep({
  id: "routing",
  requires: [morphologyTerrainArtifacts.baseTopography],
  provides: [morphologyRoutingArtifacts.routing],

  ops: {
    routing: morphology.routing.ops.computeFlowRouting,
  },
});
