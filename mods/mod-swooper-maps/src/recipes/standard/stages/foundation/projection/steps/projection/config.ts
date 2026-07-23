import foundation from "@mapgen/domain/foundation";
import { artifacts as lithosphereArtifacts } from "@mapgen/domain/foundation/modules/lithosphere/artifacts";
import { artifacts as meshArtifacts } from "@mapgen/domain/foundation/modules/mesh/artifacts";
import { artifacts as orogenyArtifacts } from "@mapgen/domain/foundation/modules/orogeny/artifacts";
import { artifacts as projectionArtifacts } from "@mapgen/domain/foundation/modules/projection/artifacts";
import { artifacts as tectonicsArtifacts } from "@mapgen/domain/foundation/modules/tectonics/artifacts";
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
      meshArtifacts.mesh,
      orogenyArtifacts.crust,
      lithosphereArtifacts.plateGraph,
      tectonicsArtifacts.plateMotion,
      tectonicsArtifacts.currentTectonics,
      tectonicsArtifacts.tectonicHistory,
      tectonicsArtifacts.tectonicProvenance,
    ],
    provides: [
      projectionArtifacts.plates,
      projectionArtifacts.crustTiles,
      projectionArtifacts.tectonicHistoryTiles,
      projectionArtifacts.tectonicProvenanceTiles,
    ],
  },
  ops: {
    computePlates: foundation.projection.ops.computePlatesTensors,
  },
  schema: Type.Object({}, { additionalProperties: false }),
});
