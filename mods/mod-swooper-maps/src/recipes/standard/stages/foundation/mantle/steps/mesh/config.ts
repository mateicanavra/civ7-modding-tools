import foundation from "@mapgen/domain/foundation";
import { artifacts as meshArtifacts } from "@mapgen/domain/foundation/modules/mesh/artifacts";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines the Foundation mesh bootstrap with no artifact prerequisites. Every later Foundation
 * operation consumes the published mesh, so resolution and cell identity are established
 * exactly once.
 */
export const MeshStepContract = defineStep({
  id: "mesh",
  requires: [],
  provides: [],
  artifacts: {
    provides: [meshArtifacts.mesh],
  },
  ops: {
    computeMesh: foundation.mesh.ops.computeMesh,
  },
  schema: Type.Object({}, { additionalProperties: false }),
});
