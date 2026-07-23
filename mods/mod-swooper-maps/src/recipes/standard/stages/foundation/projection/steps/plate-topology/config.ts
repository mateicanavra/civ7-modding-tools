import foundation, { artifacts as foundationArtifacts } from "@mapgen/domain/foundation";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines the projection-adjacent summary from tile-space plate IDs into whole-plate
 * adjacency. It deliberately follows Foundation projection because its topology is derived
 * from the projected raster vintage.
 */
export const PlateTopologyStepContract = defineStep({
  id: "plate-topology",
  requires: [],
  provides: [],
  artifacts: {
    requires: [foundationArtifacts.plates],
    provides: [foundationArtifacts.plateTopology],
  },
  ops: {
    computePlateTopology: foundation.ops.computePlateTopology,
  },
  schema: Type.Object({}, { additionalProperties: false }),
});
