import { artifacts as foundationProjectionArtifacts } from "../../../../../../../domain/foundation/modules/projection/artifacts/index.js";
import morphology from "../../../../../../../domain/morphology/index.js";
import { artifacts as morphologyLandformsArtifacts } from "../../../../../../../domain/morphology/modules/landforms/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Plans volcanic placements (truth-only intent).
 */
export const config = defineStep({
  id: "volcanoes",
  requires: [foundationProjectionArtifacts.plates, morphologyLandformsArtifacts.topography],

  provides: [morphologyLandformsArtifacts.volcanoes],
  ops: {
    volcanoes: morphology.landforms.ops.planVolcanoes,
  },
});
