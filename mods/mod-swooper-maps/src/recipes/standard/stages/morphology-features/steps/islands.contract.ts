import morphology from "@mapgen/domain/morphology/contract";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

import { mapArtifacts } from "../../../map-artifacts.js";
import { morphologyArtifacts } from "../../morphology/artifacts.js";

/**
 * Plans island chain edits (coastal and volcanic accents).
 */
const IslandsStepContract = defineStep({
  id: "islands",
  phase: "morphology",
  requires: [],
  provides: [],
  artifacts: {
    requires: [mapArtifacts.foundationPlates, morphologyArtifacts.topography],
  },
  ops: {
    islands: morphology.ops.planIslandChains,
  },
  schema: Type.Object({}),
});

export default IslandsStepContract;
