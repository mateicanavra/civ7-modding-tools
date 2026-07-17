import foundation, { artifacts as foundationArtifacts } from "@mapgen/domain/foundation";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines the conversion from mantle potential into velocity, stress, and
 * upwelling/downwelling forcing. Lithosphere and tectonic consumers therefore share one
 * forcing field vintage.
 */
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
