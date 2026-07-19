import foundation, {
  artifactModules as foundationArtifactModules,
  artifacts as foundationArtifacts,
} from "@mapgen/domain/foundation";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines plate partitioning over the mesh and initial crust. It publishes the graph used by
 * motion and tectonic history so those stages share one plate identity topology.
 */
export const PlateGraphStepContract = defineStep({
  id: "plate-graph",
  requires: [],
  provides: [],
  artifacts: {
    requires: [foundationArtifacts.mesh, foundationArtifacts.crustInit],
    provides: [foundationArtifactModules.plateGraph],
  },
  ops: {
    computePlateGraph: foundation.ops.computePlateGraph,
  },
  schema: Type.Object({}, { additionalProperties: false }),
});
