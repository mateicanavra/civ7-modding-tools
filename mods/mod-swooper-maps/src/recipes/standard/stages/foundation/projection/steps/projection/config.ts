import foundation, { artifacts as foundationArtifacts } from "@mapgen/domain/foundation";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines Foundation's mesh-to-tile projection boundary. It projects crust, plate, tectonic,
 * and provenance truth into map artifacts while leaving terrain shaping to Morphology.
 */
export const ProjectionStepContract = defineStep({
  id: "projection",
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
      foundationArtifacts.plates,
      foundationArtifacts.crustTiles,
      foundationArtifacts.tectonicHistoryTiles,
      foundationArtifacts.tectonicProvenanceTiles,
    ],
  },
  ops: {
    computePlates: foundation.ops.computePlatesTensors,
  },
  schema: Type.Object({}, { additionalProperties: false }),
});
