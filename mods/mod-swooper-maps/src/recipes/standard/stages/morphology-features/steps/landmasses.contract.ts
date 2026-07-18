import morphology from "@mapgen/domain/morphology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import {
  artifactModules as morphologyArtifactModules,
  artifacts as morphologyArtifacts,
} from "../../morphology/artifacts/index.js";

/**
 * Publishes the landmass decomposition artifact from the final land mask.
 */
const LandmassesStepContract = defineStep({
  id: "landmasses",
  phase: "morphology",
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

export default LandmassesStepContract;
