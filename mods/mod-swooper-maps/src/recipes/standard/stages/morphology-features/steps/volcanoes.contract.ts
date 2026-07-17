import morphology from "@mapgen/domain/morphology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

import { artifacts as standardArtifacts } from "../../../artifacts/index.js";
import { artifacts as morphologyArtifacts } from "../../morphology/artifacts/index.js";

/**
 * Plans volcanic placements (truth-only intent).
 */
const VolcanoesStepContract = defineStep({
  id: "volcanoes",
  phase: "morphology",
  requires: [],
  artifacts: {
    requires: [standardArtifacts.foundationPlates, morphologyArtifacts.topography],
    provides: [morphologyArtifacts.volcanoes],
  },
  provides: [],
  ops: {
    volcanoes: morphology.ops.planVolcanoes,
  },
  schema: Type.Object({}),
});

export default VolcanoesStepContract;
