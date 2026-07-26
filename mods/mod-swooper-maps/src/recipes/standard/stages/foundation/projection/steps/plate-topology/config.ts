import foundation from "@mapgen/domain/foundation";
import { artifacts as projectionArtifacts } from "@mapgen/domain/foundation/modules/projection/artifacts";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines the projection-adjacent summary from tile-space plate IDs into whole-plate
 * adjacency. It deliberately follows Foundation projection because its topology is derived
 * from the projected raster vintage.
 */
export const config = defineStep({
  id: "plate-topology",
  requires: [],
  provides: [],
  artifacts: {
    requires: [projectionArtifacts.plates],
    provides: [projectionArtifacts.plateTopology],
  },
  ops: {
    computePlateTopology: foundation.projection.ops.computePlateTopology,
  },
  schema: Type.Object({}, { additionalProperties: false }),
});
