import { Type, defineStep } from "@swooper/mapgen-core/authoring";
import morphology from "@mapgen/domain/morphology";

import { foundationArtifacts } from "../../foundation/artifacts.js";
import { morphologyArtifacts } from "../../morphology/artifacts.js";

/**
 * Seeds morphology buffers from foundation crust + tectonic history (belt drivers + substrate + base topography).
 */
const LandmassPlatesStepContract = defineStep({
  id: "landmass-plates",
  phase: "morphology",
  requires: [],
  provides: [],
  artifacts: {
    requires: [
      foundationArtifacts.crustTiles,
      foundationArtifacts.tectonicHistoryTiles,
      foundationArtifacts.tectonicProvenanceTiles,
    ],
    provides: [
      morphologyArtifacts.topography,
      morphologyArtifacts.substrate,
      morphologyArtifacts.beltDrivers,
    ],
  },
  ops: {
    beltDrivers: morphology.ops.computeBeltDrivers,
    substrate: morphology.ops.computeSubstrate,
    baseTopography: morphology.ops.computeBaseTopography,
    seaLevel: morphology.ops.computeSeaLevel,
    landmask: morphology.ops.computeLandmask,
  },
  schema: Type.Object({}),
});

export default LandmassPlatesStepContract;
