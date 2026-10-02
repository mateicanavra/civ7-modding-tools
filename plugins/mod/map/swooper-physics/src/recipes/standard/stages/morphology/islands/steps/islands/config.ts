import { artifacts as foundationProjectionArtifacts } from "../../../../../../../domain/foundation/modules/projection/artifacts/index.js";
import morphology from "../../../../../../../domain/morphology/index.js";
import { artifacts as morphologyCoastsArtifacts } from "../../../../../../../domain/morphology/modules/coasts/artifacts/index.js";
import { artifacts as morphologyErosionArtifacts } from "../../../../../../../domain/morphology/modules/erosion/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "../../../../../../../domain/morphology/modules/landforms/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Publishes final physical ground before climate and water-network computation.
 */
export const config = defineStep({
  id: "islands",
  requires: [
    foundationProjectionArtifacts.plates,
    morphologyErosionArtifacts.erodedTopography,
    morphologyCoastsArtifacts.baseCoastline,
  ],
  provides: [morphologyLandformsArtifacts.initialTopography],

  ops: {
    islands: morphology.landforms.ops.computeIslandTopography,
  },
});
