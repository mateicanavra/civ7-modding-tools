import morphology, { artifacts as morphologyArtifacts } from "@mapgen/domain/morphology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Applies geomorphic cycle deltas to copied topography and substrate, then publishes new vintages.
 */
export const GeomorphologyStepContract = defineStep({
  id: "geomorphology",
  requires: [],
  provides: [],
  artifacts: {
    requires: [
      morphologyArtifacts.carvedTopography,
      morphologyArtifacts.routing,
      morphologyArtifacts.baseSubstrate,
    ],
    provides: [morphologyArtifacts.erodedTopography, morphologyArtifacts.substrate],
  },
  ops: {
    geomorphology: morphology.ops.computeGeomorphicCycle,
  },
  schema: Type.Object({}),
});
