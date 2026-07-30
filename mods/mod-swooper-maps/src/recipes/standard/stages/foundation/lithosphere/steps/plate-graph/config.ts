import foundation from "@mapgen/domain/foundation";
import { artifacts as lithosphereArtifacts } from "@mapgen/domain/foundation/modules/lithosphere/artifacts";
import { artifacts as meshArtifacts } from "@mapgen/domain/foundation/modules/mesh/artifacts";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines plate partitioning over the mesh and initial crust. It publishes the graph used by
 * motion and tectonic history so those stages share one plate identity topology.
 */
export const config = defineStep({
  id: "plate-graph",
  requires: [meshArtifacts.mesh, lithosphereArtifacts.initialCrust],
  provides: [lithosphereArtifacts.plateGraph],

  ops: {
    computePlateGraph: foundation.lithosphere.ops.computePlateGraph,
  },
});
