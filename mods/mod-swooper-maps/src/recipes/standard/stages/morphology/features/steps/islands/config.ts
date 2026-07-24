import { artifacts as foundationProjectionArtifacts } from "@mapgen/domain/foundation/modules/projection/artifacts";
import morphology from "@mapgen/domain/morphology";
import { artifacts as morphologyErosionArtifacts } from "@mapgen/domain/morphology/modules/erosion/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Plans island chain edits (coastal and volcanic accents).
 */
export const IslandsStepContract = defineStep({
  id: "islands",
  requires: [],
  provides: [],
  artifacts: {
    requires: [foundationProjectionArtifacts.plates, morphologyErosionArtifacts.erodedTopography],
    provides: [morphologyLandformsArtifacts.topography],
  },
  ops: {
    islands: morphology.landforms.ops.planIslandChains,
  },
  schema: Type.Object({}),
});
