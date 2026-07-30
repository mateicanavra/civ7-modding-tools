import foundation from "../../../../../../../domain/foundation/index.js";
import { artifacts as lithosphereArtifacts } from "../../../../../../../domain/foundation/modules/lithosphere/artifacts/index.js";
import { artifacts as meshArtifacts } from "../../../../../../../domain/foundation/modules/mesh/artifacts/index.js";
import { artifacts as orogenyArtifacts } from "../../../../../../../domain/foundation/modules/orogeny/artifacts/index.js";
import { artifacts as projectionArtifacts } from "../../../../../../../domain/foundation/modules/projection/artifacts/index.js";
import { artifacts as tectonicsArtifacts } from "../../../../../../../domain/foundation/modules/tectonics/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines Foundation's mesh-to-tile projection boundary. It projects crust, plate, tectonic,
 * and provenance truth into map artifacts while leaving terrain shaping to Morphology.
 */
export const config = defineStep({
  id: "projection",
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

  ops: {
    computePlates: foundation.projection.ops.computePlatesTensors,
  },
});
