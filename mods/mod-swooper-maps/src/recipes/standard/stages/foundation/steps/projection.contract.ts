import { Type, defineStep } from "@swooper/mapgen-core/authoring";
import foundation from "@mapgen/domain/foundation";

import { foundationArtifacts } from "../artifacts.js";
import { mapArtifacts } from "../../../map-artifacts.js";

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
      foundationArtifacts.tectonics,
      foundationArtifacts.tectonicHistory,
      foundationArtifacts.tectonicProvenance,
    ],
    provides: [
      mapArtifacts.foundationPlates,
      mapArtifacts.foundationTileToCellIndex,
      mapArtifacts.foundationCrustTiles,
      mapArtifacts.foundationTectonicHistoryTiles,
      mapArtifacts.foundationTectonicProvenanceTiles,
    ],
  },
  ops: {
    computePlates: foundation.ops.computePlatesTensors,
  },
  schema: Type.Object({}, { additionalProperties: false }),
});

export default ProjectionStepContract;
