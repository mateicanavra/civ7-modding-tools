import foundation, { artifacts as foundationArtifacts } from "@mapgen/domain/foundation";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines final crust evolution from initial crust, mantle forcing, plate motion, and tectonic
 * history. It publishes the crust vintage consumed by morphology without exposing intermediate
 * history as elevation.
 */
export const CrustEvolutionStepContract = defineStep({
  id: "crust-evolution",
  requires: [],
  provides: [],
  artifacts: {
    requires: [
      foundationArtifacts.mesh,
      foundationArtifacts.initialCrust,
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
