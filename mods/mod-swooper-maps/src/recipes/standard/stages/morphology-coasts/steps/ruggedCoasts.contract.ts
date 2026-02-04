import { Type, defineStep } from "@swooper/mapgen-core/authoring";
import morphology from "@mapgen/domain/morphology";

import { morphologyArtifacts } from "../../morphology/artifacts.js";

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
    shelfMask: { contract: morphology.ops.computeShelfMask, defaultStrategy: "default" },
  },
  schema: Type.Object({}),
});

export default RuggedCoastsStepContract;
