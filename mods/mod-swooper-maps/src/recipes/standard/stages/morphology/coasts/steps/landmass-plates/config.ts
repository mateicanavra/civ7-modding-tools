import { artifacts as foundationProjectionArtifacts } from "@mapgen/domain/foundation/modules/projection/artifacts";
import morphology, { artifacts as morphologyArtifacts } from "@mapgen/domain/morphology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Publishes initial Morphology evidence from Foundation crust and tectonic history.
 */
export const LandmassPlatesStepContract = defineStep({
  id: "landmass-plates",
  requires: [],
  provides: [],
  artifacts: {
    requires: [
      foundationProjectionArtifacts.crustTiles,
      foundationProjectionArtifacts.tectonicHistoryTiles,
      foundationProjectionArtifacts.tectonicProvenanceTiles,
    ],
    provides: [
      morphologyArtifacts.baseTopography,
      morphologyArtifacts.baseSubstrate,
      morphologyArtifacts.beltDrivers,
    ],
  },
  ops: {
    beltDrivers: morphology.ops.computeBeltDrivers,
    substrate: morphology.ops.computeSubstrate,
    baseTopography: morphology.ops.computeBaseTopography,
    sculptContinentalMargin: morphology.ops.computeSculptContinentalMargin,
    seaLevel: morphology.ops.computeSeaLevel,
    landmask: morphology.ops.computeLandmask,
  },
  schema: Type.Object({}),
});
