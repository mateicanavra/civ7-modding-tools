import { Type, defineStep } from "@swooper/mapgen-core/authoring";
import foundation from "@mapgen/domain/foundation";

import { foundationArtifacts } from "../artifacts.js";

const CrustEvolutionStepContract = defineStep({
  id: "crust-evolution",
  phase: "foundation",
  requires: [],
  provides: [],
  artifacts: {
    requires: [
      foundationArtifacts.mesh,
      foundationArtifacts.crustInit,
      foundationArtifacts.tectonics,
      foundationArtifacts.tectonicHistory,
    ],
    provides: [foundationArtifacts.crust],
  },
  ops: {
    computeCrustEvolution: foundation.ops.computeCrustEvolution,
  },
  schema: Type.Object({}, { additionalProperties: false }),
});

export default CrustEvolutionStepContract;
