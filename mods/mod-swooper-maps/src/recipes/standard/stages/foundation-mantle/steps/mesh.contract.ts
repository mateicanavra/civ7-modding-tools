import foundation, { artifacts as foundationArtifacts } from "@mapgen/domain/foundation";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines the Foundation mesh bootstrap with no artifact prerequisites. Every later Foundation
 * operation consumes the published mesh, so resolution and cell identity are established
 * exactly once.
 */
const MeshStepContract = defineStep({
  id: "mesh",
  phase: "foundation",
  requires: [],
  provides: [],
  artifacts: {
    provides: [foundationArtifacts.mesh],
  },
  ops: {
    computeMesh: foundation.ops.computeMesh,
  },
  schema: Type.Object({}, { additionalProperties: false }),
});

export default MeshStepContract;
