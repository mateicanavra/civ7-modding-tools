import foundation from "@mapgen/domain/foundation";
import { artifacts as mantleArtifacts } from "@mapgen/domain/foundation/modules/mantle/artifacts";
import { artifacts as meshArtifacts } from "@mapgen/domain/foundation/modules/mesh/artifacts";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines deterministic mantle source potential over the generated mesh. It publishes the
 * source field before forcing is derived, separating authored mantle structure from its
 * physical effects.
 */
export const MantlePotentialStepContract = defineStep({
  id: "mantle-potential",
  requires: [],
  provides: [],
  artifacts: {
    requires: [meshArtifacts.mesh],
    provides: [mantleArtifacts.mantlePotential],
  },
  ops: {
    computeMantlePotential: foundation.mantle.ops.computeMantlePotential,
  },
  schema: Type.Object({}, { additionalProperties: false }),
});
