import morphology, {
  artifactModules as morphologyArtifactModules,
  artifacts as morphologyArtifacts,
} from "@mapgen/domain/morphology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Publishes the landmass decomposition artifact from the final land mask.
 */
export const LandmassesStepContract = defineStep({
  id: "landmasses",
  requires: [],
  provides: [],
  artifacts: {
    requires: [morphologyArtifacts.topography],
    provides: [morphologyArtifactModules.landmasses],
  },
  ops: {
    landmasses: morphology.ops.computeLandmasses,
  },
  schema: Type.Object({}),
});
