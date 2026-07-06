import morphology from "@mapgen/domain/morphology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

import { artifacts as morphologyArtifacts } from "../../morphology/artifacts/index.js";

/**
 * Produces coastline metrics and applies ruggedization adjustments.
 */
const RuggedCoastsStepContract = defineStep({
  id: "rugged-coasts",
  phase: "morphology",
  requires: [],
  provides: [],
  artifacts: {
    requires: [morphologyArtifacts.beltDrivers, morphologyArtifacts.topography],
    provides: [morphologyArtifacts.coastlineMetrics],
  },
  ops: {
    coastlines: morphology.ops.computeCoastlineMetrics,
    reconcileHeightfield: {
      contract: morphology.ops.reconcileHeightfieldFromCoast,
      defaultStrategy: "default",
    },
    distanceToCoast: {
      contract: morphology.ops.computeDistanceToCoast,
      defaultStrategy: "default",
    },
  },
  schema: Type.Object({}),
});

export default RuggedCoastsStepContract;
