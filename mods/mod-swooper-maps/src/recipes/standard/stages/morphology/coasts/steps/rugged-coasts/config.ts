import morphology from "@mapgen/domain/morphology";
import { artifacts as morphologyCoastsArtifacts } from "@mapgen/domain/morphology/modules/coasts/artifacts/index.js";
import { artifacts as morphologyTerrainArtifacts } from "@mapgen/domain/morphology/modules/terrain/artifacts/index.js";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Produces coastline metrics and applies ruggedization adjustments.
 */
export const config = defineStep({
  id: "rugged-coasts",
  requires: [],
  provides: [],
  artifacts: {
    requires: [morphologyTerrainArtifacts.beltDrivers, morphologyTerrainArtifacts.baseTopography],
    provides: [
      morphologyCoastsArtifacts.carvedTopography,
      morphologyCoastsArtifacts.carvedCoastline,
    ],
  },
  ops: {
    coastlines: morphology.coasts.ops.computeCoastlineMetrics,
    reconcileHeightfield: morphology.coasts.ops.reconcileHeightfieldFromCoast,
    distanceToCoast: morphology.coasts.ops.computeDistanceToCoast,
  },
  schema: Type.Object({}),
});
