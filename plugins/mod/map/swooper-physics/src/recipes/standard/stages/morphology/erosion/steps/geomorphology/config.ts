import morphology from "../../../../../../../domain/morphology/index.js";
import { artifacts as morphologyErosionArtifacts } from "../../../../../../../domain/morphology/modules/erosion/artifacts/index.js";
import { artifacts as morphologyRoutingArtifacts } from "../../../../../../../domain/morphology/modules/routing/artifacts/index.js";
import { artifacts as morphologyTerrainArtifacts } from "../../../../../../../domain/morphology/modules/terrain/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Publishes the coherent topography and substrate produced by the geomorphic cycle.
 */
export const config = defineStep({
  id: "geomorphology",
  requires: [
    morphologyTerrainArtifacts.baseTopography,
    morphologyRoutingArtifacts.routing,
    morphologyTerrainArtifacts.baseSubstrate,
  ],
  provides: [morphologyErosionArtifacts.erodedTopography, morphologyErosionArtifacts.substrate],

  ops: {
    geomorphology: morphology.erosion.ops.computeGeomorphicCycle,
  },
});
