import { artifacts as foundationProjectionArtifacts } from "@mapgen/domain/foundation/modules/projection/artifacts";
import morphology from "@mapgen/domain/morphology";
import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
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
