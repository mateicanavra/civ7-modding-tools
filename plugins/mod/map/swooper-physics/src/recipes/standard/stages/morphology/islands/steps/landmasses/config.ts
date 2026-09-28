import morphology from "../../../../../../../domain/morphology/index.js";
import { artifacts as morphologyLandformsArtifacts } from "../../../../../../../domain/morphology/modules/landforms/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Publishes original marine landmass identity before freshwater exposure changes.
 */
export const config = defineStep({
  id: "landmasses",
  requires: [morphologyLandformsArtifacts.topography],
  provides: [morphologyLandformsArtifacts.landmasses],

  ops: {
    landmasses: morphology.landforms.ops.computeLandmasses,
  },
});
