import morphology from "@mapgen/domain/morphology";
import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Publishes the landmass decomposition artifact from the final land mask.
 */
export const config = defineStep({
  id: "landmasses",
  requires: [],
  provides: [],
  artifacts: {
    requires: [morphologyLandformsArtifacts.topography],
    provides: [morphologyLandformsArtifacts.landmasses],
  },
  ops: {
    landmasses: morphology.landforms.ops.computeLandmasses,
  },
  schema: Type.Object({}),
});
