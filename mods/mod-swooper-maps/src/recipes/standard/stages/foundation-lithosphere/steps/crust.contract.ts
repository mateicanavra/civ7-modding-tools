import foundation from "@mapgen/domain/foundation";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

import { artifacts as foundationArtifacts } from "@mapgen/domain/foundation";

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
