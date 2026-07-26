import { artifacts as foundationProjectionArtifacts } from "@mapgen/domain/foundation/modules/projection/artifacts";
import morphology, { artifacts as morphologyArtifacts } from "@mapgen/domain/morphology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Plans island chain edits (coastal and volcanic accents).
 */
export const IslandsStepContract = defineStep({
  id: "islands",
  requires: [],
  provides: [],
  artifacts: {
    requires: [foundationProjectionArtifacts.plates, morphologyArtifacts.erodedTopography],
    provides: [morphologyArtifacts.topography],
  },
  ops: {
    islands: morphology.ops.planIslandChains,
  },
  schema: Type.Object({}),
});
