import morphology from "@mapgen/domain/morphology";
import { artifacts as morphologyCoastsArtifacts } from "@mapgen/domain/morphology/modules/coasts/artifacts/index.js";
import { artifacts as morphologyRoutingArtifacts } from "@mapgen/domain/morphology/modules/routing/artifacts/index.js";
import { artifacts as morphologyTerrainArtifacts } from "@mapgen/domain/morphology/modules/terrain/artifacts/index.js";
import { artifacts as morphologyErosionArtifacts } from "@mapgen/domain/morphology/modules/erosion/artifacts/index.js";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Applies geomorphic cycle deltas to copied topography and substrate, then publishes new vintages.
 */
export const config = defineStep({
  id: "geomorphology",
  requires: [],
  provides: [],
  artifacts: {
    requires: [
      morphologyCoastsArtifacts.carvedTopography,
      morphologyRoutingArtifacts.routing,
      morphologyTerrainArtifacts.baseSubstrate,
    ],
    provides: [morphologyErosionArtifacts.erodedTopography, morphologyErosionArtifacts.substrate],
  },
  ops: {
    geomorphology: morphology.erosion.ops.computeGeomorphicCycle,
  },
  schema: Type.Object({}),
});
