import { Type, defineStep } from "@swooper/mapgen-core/authoring";
import foundation from "@mapgen/domain/foundation";

import { foundationArtifacts } from "../artifacts.js";

const MantlePotentialStepContract = defineStep({
  id: "mantle-potential",
  phase: "foundation",
  requires: [],
  provides: [],
  artifacts: {
    requires: [foundationArtifacts.mesh],
    provides: [foundationArtifacts.mantlePotential],
  },
  ops: {
    computeMantlePotential: foundation.ops.computeMantlePotential,
  },
  schema: Type.Object({}, { additionalProperties: false }),
});

export default MantlePotentialStepContract;
