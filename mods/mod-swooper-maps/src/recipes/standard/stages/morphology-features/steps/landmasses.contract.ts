import morphology from "@mapgen/domain/morphology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

import { morphologyArtifacts } from "../../morphology/artifacts.js";

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
    provides: [morphologyArtifacts.landmasses],
  },
  ops: {
    landmasses: morphology.ops.computeLandmasses,
  },
  schema: Type.Object({}),
});

export default LandmassesStepContract;
