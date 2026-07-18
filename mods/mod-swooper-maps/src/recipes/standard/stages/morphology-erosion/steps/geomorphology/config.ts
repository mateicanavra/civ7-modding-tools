import morphology from "@mapgen/domain/morphology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

import { artifacts as morphologyArtifacts } from "../../../morphology/artifacts/index.js";

/**
 * Applies geomorphic cycle deltas to elevation and sediment buffers.
 */
export const GeomorphologyStepContract = defineStep({
  id: "geomorphology",
  phase: "morphology",
  requires: [],
  provides: [],
  artifacts: {
    requires: [
      morphologyArtifacts.topography,
      morphologyArtifacts.routing,
      morphologyArtifacts.substrate,
    ],
  },
  ops: {
    geomorphology: morphology.ops.computeGeomorphicCycle,
  },
  schema: Type.Object({}),
});
