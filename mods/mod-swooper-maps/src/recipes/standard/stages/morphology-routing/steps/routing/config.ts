import morphology from "@mapgen/domain/morphology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import {
  artifactModules as morphologyArtifactModules,
  artifacts as morphologyArtifacts,
} from "../../../morphology/artifacts/index.js";

/**
 * Computes Morphology's geomorphic routing proxy from current topography.
 *
 * Hydrology computes canonical drainage routing separately over final
 * Morphology topography.
 */
export const RoutingStepContract = defineStep({
  id: "routing",
  phase: "morphology",
  requires: [],
  provides: [],
  artifacts: {
    requires: [morphologyArtifacts.carvedTopography],
    provides: [morphologyArtifactModules.routing],
  },
  ops: {
    routing: morphology.ops.computeFlowRouting,
  },
  schema: Type.Object({}),
});
