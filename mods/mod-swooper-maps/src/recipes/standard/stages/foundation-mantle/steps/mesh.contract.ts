import foundation, { artifacts as foundationArtifacts } from "@mapgen/domain/foundation";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

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
