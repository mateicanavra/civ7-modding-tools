import morphology from "@mapgen/domain/morphology";
import { artifacts as morphologyCoastsArtifacts } from "@mapgen/domain/morphology/modules/coasts/artifacts/index.js";
import { artifacts as morphologyRoutingArtifacts } from "@mapgen/domain/morphology/modules/routing/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Computes Morphology's geomorphic routing proxy from current topography.
 *
 * Hydrology computes canonical drainage routing separately over final
 * Morphology topography.
 */
export const config = defineStep({
  id: "routing",
  requires: [],
  provides: [],
  artifacts: {
    requires: [morphologyCoastsArtifacts.carvedTopography],
    provides: [morphologyRoutingArtifacts.routing],
  },
  ops: {
    routing: morphology.routing.ops.computeFlowRouting,
  },
});
