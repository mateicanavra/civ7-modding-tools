import foundation, { artifacts as foundationArtifacts } from "@mapgen/domain/foundation";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

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
