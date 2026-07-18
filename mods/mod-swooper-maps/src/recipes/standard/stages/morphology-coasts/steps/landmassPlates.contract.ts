import morphology from "@mapgen/domain/morphology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

import { artifacts as standardArtifacts } from "../../../artifacts/index.js";
import { artifactModules as morphologyArtifactModules } from "../../morphology/artifacts/index.js";

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
      standardArtifacts.foundationCrustTiles,
      standardArtifacts.foundationTectonicHistoryTiles,
      standardArtifacts.foundationTectonicProvenanceTiles,
    ],
    provides: [
      morphologyArtifactModules.topography,
      morphologyArtifactModules.substrate,
      morphologyArtifactModules.beltDrivers,
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

export default LandmassPlatesStepContract;
