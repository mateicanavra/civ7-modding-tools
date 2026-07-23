import morphology, { artifacts as morphologyArtifacts } from "@mapgen/domain/morphology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Computes Morphology's geomorphic routing proxy from current topography.
 *
 * Hydrology computes canonical drainage routing separately over final
 * Morphology topography.
 */
export const RoutingStepContract = defineStep({
  id: "routing",
  requires: [],
  provides: [],
  artifacts: {
    requires: [morphologyArtifacts.carvedTopography],
    provides: [morphologyArtifacts.routing],
  },
  ops: {
    routing: morphology.ops.computeFlowRouting,
  },
  schema: Type.Object({}),
});
