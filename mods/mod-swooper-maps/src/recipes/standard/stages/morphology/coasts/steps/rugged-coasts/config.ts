import morphology, { artifacts as morphologyArtifacts } from "@mapgen/domain/morphology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Produces coastline metrics and applies ruggedization adjustments.
 */
export const RuggedCoastsStepContract = defineStep({
  id: "rugged-coasts",
  requires: [],
  provides: [],
  artifacts: {
    requires: [morphologyArtifacts.beltDrivers, morphologyArtifacts.baseTopography],
    provides: [morphologyArtifacts.carvedTopography, morphologyArtifacts.carvedCoastline],
  },
  ops: {
    coastlines: morphology.ops.computeCoastlineMetrics,
    reconcileHeightfield: morphology.ops.reconcileHeightfieldFromCoast,
    distanceToCoast: morphology.ops.computeDistanceToCoast,
  },
  schema: Type.Object({}),
});
