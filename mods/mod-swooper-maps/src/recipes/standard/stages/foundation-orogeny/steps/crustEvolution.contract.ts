import foundation, { artifacts as foundationArtifacts } from "@mapgen/domain/foundation";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

const CrustEvolutionStepContract = defineStep({
  id: "crust-evolution",
  phase: "foundation",
  requires: [],
  provides: [],
  artifacts: {
    requires: [
      foundationArtifacts.mesh,
      foundationArtifacts.crustInit,
      foundationArtifacts.currentTectonics,
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
