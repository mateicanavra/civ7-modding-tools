import morphology from "@mapgen/domain/morphology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

import { morphologyArtifacts } from "../../morphology/artifacts.js";

/**
 * Computes Morphology's geomorphic routing proxy from current topography.
 *
 * Hydrology computes canonical drainage routing separately over final
 * Morphology topography.
 */
const RoutingStepContract = defineStep({
  id: "routing",
  phase: "morphology",
  requires: [],
  provides: [],
  artifacts: {
    requires: [morphologyArtifacts.topography],
    provides: [morphologyArtifacts.routing],
  },
  ops: {
    routing: morphology.ops.computeFlowRouting,
  },
  schema: Type.Object({}),
});

export default RoutingStepContract;
