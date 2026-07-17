import foundation, { artifacts as foundationArtifacts } from "@mapgen/domain/foundation";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import { artifacts as standardArtifacts } from "../../../artifacts/index.js";

/**
 * Defines the projection-adjacent summary from tile-space plate IDs into whole-plate
 * adjacency. It deliberately follows Foundation projection because its topology is derived
 * from the projected raster vintage.
 */
const PlateTopologyStepContract = defineStep({
  id: "plate-topology",
  phase: "foundation",
  requires: [],
  provides: [],
  artifacts: {
    requires: [standardArtifacts.foundationPlates],
    provides: [foundationArtifacts.plateTopology],
  },
  ops: {
    computePlateTopology: foundation.ops.computePlateTopology,
  },
  schema: Type.Object({}, { additionalProperties: false }),
});

export default PlateTopologyStepContract;
