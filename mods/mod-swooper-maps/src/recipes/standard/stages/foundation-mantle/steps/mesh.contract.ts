import foundation from "@mapgen/domain/foundation";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

import { foundationArtifacts } from "../../foundation/artifacts.js";

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
