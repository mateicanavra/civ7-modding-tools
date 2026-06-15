import foundation from "@mapgen/domain/foundation/contract";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

import { foundationArtifacts } from "../artifacts.js";

const CrustStepContract = defineStep({
  id: "crust",
  phase: "foundation",
  requires: [],
  provides: [],
  artifacts: {
    requires: [foundationArtifacts.mesh, foundationArtifacts.mantleForcing],
    provides: [foundationArtifacts.crustInit],
  },
  ops: {
    computeCrust: foundation.ops.computeCrust,
  },
  schema: Type.Object({}, { additionalProperties: false }),
});

export default CrustStepContract;
