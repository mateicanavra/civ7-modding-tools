import { artifacts as foundationProjectionArtifacts } from "../../../../../../../domain/foundation/modules/projection/artifacts/index.js";
import morphology from "../../../../../../../domain/morphology/index.js";
import { artifacts as morphologyCoastsArtifacts } from "../../../../../../../domain/morphology/modules/coasts/artifacts/index.js";
import { artifacts as morphologyErosionArtifacts } from "../../../../../../../domain/morphology/modules/erosion/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "../../../../../../../domain/morphology/modules/landforms/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Computes and publishes coherent post-island topography.
 */
export const config = defineStep({
  id: "islands",
  requires: [
    foundationProjectionArtifacts.plates,
    morphologyErosionArtifacts.erodedTopography,
    morphologyCoastsArtifacts.baseCoastline,
  ],
  provides: [morphologyLandformsArtifacts.topography],

  ops: {
    islands: morphology.landforms.ops.computeIslandTopography,
  },
});
