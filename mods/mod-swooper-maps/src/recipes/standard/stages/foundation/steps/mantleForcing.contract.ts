import { Type, defineStep } from "@swooper/mapgen-core/authoring";
import foundation from "@mapgen/domain/foundation";

import { foundationArtifacts } from "../artifacts.js";

const MantleForcingStepContract = defineStep({
  id: "mantle-forcing",
  phase: "foundation",
  requires: [],
  provides: [],
  artifacts: {
    requires: [foundationArtifacts.mesh, foundationArtifacts.mantlePotential],
    provides: [foundationArtifacts.mantleForcing],
  },
  ops: {
    computeMantleForcing: foundation.ops.computeMantleForcing,
  },
  schema: Type.Object({}, { additionalProperties: false }),
});

export default MantleForcingStepContract;
