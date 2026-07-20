import morphology from "@mapgen/domain/morphology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

import { artifacts as standardArtifacts } from "../../../../artifacts/index.js";
import {
  artifactModules as morphologyArtifactModules,
  artifacts as morphologyArtifacts,
} from "../../../morphology/artifacts/index.js";

/**
 * Plans volcanic placements (truth-only intent).
 */
export const VolcanoesStepContract = defineStep({
  id: "volcanoes",
  requires: [],
  artifacts: {
    requires: [standardArtifacts.foundationPlates, morphologyArtifacts.topography],
    provides: [morphologyArtifactModules.volcanoes],
  },
  provides: [],
  ops: {
    volcanoes: morphology.ops.planVolcanoes,
  },
  schema: Type.Object({}),
});
