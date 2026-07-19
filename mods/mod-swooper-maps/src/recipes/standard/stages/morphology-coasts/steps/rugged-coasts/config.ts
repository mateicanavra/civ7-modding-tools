import morphology from "@mapgen/domain/morphology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import {
  artifactModules as morphologyArtifactModules,
  artifacts as morphologyArtifacts,
} from "../../../morphology/artifacts/index.js";

/**
 * Produces coastline metrics and applies ruggedization adjustments.
 */
export const RuggedCoastsStepContract = defineStep({
  id: "rugged-coasts",
  requires: [],
  provides: [],
  artifacts: {
    requires: [morphologyArtifacts.beltDrivers, morphologyArtifacts.baseTopography],
    provides: [
      morphologyArtifactModules.carvedTopography,
      morphologyArtifactModules.coastlineMetrics,
    ],
  },
  ops: {
    coastlines: morphology.ops.computeCoastlineMetrics,
    reconcileHeightfield: morphology.ops.reconcileHeightfieldFromCoast,
    distanceToCoast: morphology.ops.computeDistanceToCoast,
  },
  schema: Type.Object({}),
});
