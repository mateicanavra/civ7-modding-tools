import foundation from "../../../../../../../domain/foundation/index.js";
import { artifacts as projectionArtifacts } from "../../../../../../../domain/foundation/modules/projection/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines the projection-adjacent summary from tile-space plate IDs into whole-plate
 * adjacency. It deliberately follows Foundation projection because its topology is derived
 * from the projected raster vintage.
 */
export const config = defineStep({
  id: "plate-topology",
  requires: [projectionArtifacts.plates],
  provides: [projectionArtifacts.plateTopology],

  ops: {
    computePlateTopology: foundation.projection.ops.computePlateTopology,
  },
});
