import morphology from "@mapgen/domain/morphology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

import {
  artifactModules as morphologyArtifactModules,
  artifacts as morphologyArtifacts,
} from "../../../morphology/artifacts/index.js";

/**
 * Applies geomorphic cycle deltas to copied topography and substrate, then publishes new vintages.
 */
export const GeomorphologyStepContract = defineStep({
  id: "geomorphology",
  phase: "morphology",
  requires: [],
  provides: [],
  artifacts: {
    requires: [
      morphologyArtifacts.carvedTopography,
      morphologyArtifacts.routing,
      morphologyArtifacts.baseSubstrate,
    ],
    provides: [morphologyArtifactModules.erodedTopography, morphologyArtifactModules.substrate],
  },
  ops: {
    geomorphology: morphology.ops.computeGeomorphicCycle,
  },
  schema: Type.Object({}),
});
