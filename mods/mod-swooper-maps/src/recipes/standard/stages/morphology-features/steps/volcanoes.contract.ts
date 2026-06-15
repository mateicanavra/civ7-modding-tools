import morphology from "@mapgen/domain/morphology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring";

import { mapArtifacts } from "../../../map-artifacts.js";
import { morphologyArtifacts } from "../../morphology/artifacts.js";

/**
 * Plans volcanic placements (truth-only intent).
 */
const VolcanoesStepContract = defineStep({
  id: "volcanoes",
  phase: "morphology",
  requires: [],
  artifacts: {
    requires: [mapArtifacts.foundationPlates, morphologyArtifacts.topography],
    provides: [morphologyArtifacts.volcanoes],
  },
  provides: [],
  ops: {
    volcanoes: morphology.ops.planVolcanoes,
  },
  schema: Type.Object({}),
});

export default VolcanoesStepContract;
