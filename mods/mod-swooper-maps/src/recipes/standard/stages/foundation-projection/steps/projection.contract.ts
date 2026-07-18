import foundation, { artifacts as foundationArtifacts } from "@mapgen/domain/foundation";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import { artifactModules as standardArtifactModules } from "../../../artifacts/index.js";

/**
 * Defines Foundation's mesh-to-tile projection boundary. It projects crust, plate, tectonic,
 * and provenance truth into map artifacts while leaving terrain shaping to Morphology.
 */
const ProjectionStepContract = defineStep({
  id: "projection",
  phase: "foundation",
  requires: [],
  provides: [],
  artifacts: {
    requires: [
      foundationArtifacts.mesh,
      foundationArtifacts.crust,
      foundationArtifacts.plateGraph,
      foundationArtifacts.plateMotion,
      foundationArtifacts.currentTectonics,
      foundationArtifacts.tectonicHistory,
      foundationArtifacts.tectonicProvenance,
    ],
    provides: [
      standardArtifactModules.foundationPlates,
      standardArtifactModules.foundationTileToCellIndex,
      standardArtifactModules.foundationCrustTiles,
      standardArtifactModules.foundationTectonicHistoryTiles,
      standardArtifactModules.foundationTectonicProvenanceTiles,
    ],
  },
  ops: {
    computePlates: foundation.ops.computePlatesTensors,
  },
  schema: Type.Object({}, { additionalProperties: false }),
});

export default ProjectionStepContract;
