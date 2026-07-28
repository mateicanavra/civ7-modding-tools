import { artifacts as foundationProjectionArtifacts } from "../../../../../../../domain/foundation/modules/projection/artifacts/index.js";
import morphology from "../../../../../../../domain/morphology/index.js";
import { artifacts as morphologyTerrainArtifacts } from "../../../../../../../domain/morphology/modules/terrain/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Publishes initial Morphology evidence from Foundation crust and tectonic history.
 */
export const config = defineStep({
  id: "landmass-plates",
  requires: [
    foundationProjectionArtifacts.crustTiles,
    foundationProjectionArtifacts.tectonicHistoryTiles,
    foundationProjectionArtifacts.tectonicProvenanceTiles,
  ],
  provides: [
    morphologyTerrainArtifacts.baseTopography,
    morphologyTerrainArtifacts.baseSubstrate,
    morphologyTerrainArtifacts.beltDrivers,
  ],

  ops: {
    beltDrivers: morphology.terrain.ops.computeBeltDrivers,
    substrate: morphology.terrain.ops.computeSubstrate,
    baseTopography: morphology.terrain.ops.computeBaseTopography,
    sculptContinentalMargin: morphology.coasts.ops.computeSculptContinentalMargin,
    seaLevel: morphology.terrain.ops.computeSeaLevel,
    landmask: morphology.terrain.ops.computeLandmask,
  },
});
