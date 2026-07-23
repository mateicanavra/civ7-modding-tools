import foundation, { artifacts as foundationArtifacts } from "@mapgen/domain/foundation";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines initial lithosphere truth from the tectonic mesh and mantle forcing. The step
 * publishes initialCrust before plate partitioning, keeping initial crust generation distinct
 * from later tectonic evolution.
 */
export const CrustStepContract = defineStep({
  id: "crust",
  requires: [],
  provides: [],
  artifacts: {
    requires: [foundationArtifacts.mesh, foundationArtifacts.mantleForcing],
    provides: [foundationArtifacts.initialCrust],
  },
  ops: {
    computeCrust: foundation.ops.computeCrust,
  },
  schema: Type.Object({}, { additionalProperties: false }),
});
