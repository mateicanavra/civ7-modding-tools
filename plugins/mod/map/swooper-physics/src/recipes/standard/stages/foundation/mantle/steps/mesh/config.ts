import foundation from "../../../../../../../domain/foundation/index.js";
import { artifacts as meshArtifacts } from "../../../../../../../domain/foundation/modules/mesh/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines the Foundation mesh bootstrap with no artifact prerequisites. Every later Foundation
 * operation consumes the published mesh, so resolution and cell identity are established
 * exactly once.
 */
export const config = defineStep({
  id: "mesh",
  requires: [],
  provides: [meshArtifacts.mesh],

  ops: {
    computeMesh: foundation.mesh.ops.computeMesh,
  },
});
