import foundation, {
  artifactModules as foundationArtifactModules,
  artifacts as foundationArtifacts,
} from "@mapgen/domain/foundation";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines deterministic mantle source potential over the generated mesh. It publishes the
 * source field before forcing is derived, separating authored mantle structure from its
 * physical effects.
 */
const MantlePotentialStepContract = defineStep({
  id: "mantle-potential",
  phase: "foundation",
  requires: [],
  provides: [],
  artifacts: {
    requires: [foundationArtifacts.mesh],
    provides: [foundationArtifactModules.mantlePotential],
  },
  ops: {
    computeMantlePotential: foundation.ops.computeMantlePotential,
  },
  schema: Type.Object({}, { additionalProperties: false }),
});

export default MantlePotentialStepContract;
