import { artifacts as foundationArtifacts } from "@mapgen/domain/foundation";
import morphology, {
  artifactModules as morphologyArtifactModules,
  artifacts as morphologyArtifacts,
} from "@mapgen/domain/morphology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Plans island chain edits (coastal and volcanic accents).
 */
export const IslandsStepContract = defineStep({
  id: "islands",
  requires: [],
  provides: [],
  artifacts: {
    requires: [foundationArtifacts.plates, morphologyArtifacts.erodedTopography],
    provides: [morphologyArtifactModules.topography],
  },
  ops: {
    islands: morphology.ops.planIslandChains,
  },
  schema: Type.Object({}),
});
