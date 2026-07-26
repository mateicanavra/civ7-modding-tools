import morphology from "@mapgen/domain/morphology";
import { artifacts as morphologyCoastsArtifacts } from "@mapgen/domain/morphology/modules/coasts/artifacts/index.js";
import { artifacts as morphologyTerrainArtifacts } from "@mapgen/domain/morphology/modules/terrain/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

/** Derives immutable pre-island shoreline evidence from base Morphology topography. */
export const config = defineStep({
  id: "coastline-evidence",
  requires: [],
  provides: [],
  artifacts: {
    requires: [morphologyTerrainArtifacts.baseTopography],
    provides: [morphologyCoastsArtifacts.baseCoastline],
  },
  ops: {
    adjacency: morphology.coasts.ops.computeCoastalAdjacency,
    distanceToCoast: morphology.coasts.ops.computeDistanceToCoast,
  },
});
