import morphology from "@mapgen/domain/morphology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

import { artifacts as standardArtifacts } from "../../../../artifacts/index.js";
import { artifactModules as morphologyArtifactModules } from "../../../morphology/artifacts/index.js";

/**
 * Publishes initial Morphology evidence from Foundation crust and tectonic history.
 */
export const LandmassPlatesStepContract = defineStep({
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
      morphologyArtifactModules.baseTopography,
      morphologyArtifactModules.baseSubstrate,
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
