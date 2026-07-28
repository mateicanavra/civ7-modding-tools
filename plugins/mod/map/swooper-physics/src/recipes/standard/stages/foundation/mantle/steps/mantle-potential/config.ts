import foundation from "../../../../../../../domain/foundation/index.js";
import { artifacts as mantleArtifacts } from "../../../../../../../domain/foundation/modules/mantle/artifacts/index.js";
import { artifacts as meshArtifacts } from "../../../../../../../domain/foundation/modules/mesh/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines deterministic mantle source potential over the generated mesh. It publishes the
 * source field before forcing is derived, separating authored mantle structure from its
 * physical effects.
 */
export const config = defineStep({
  id: "mantle-potential",
  requires: [meshArtifacts.mesh],
  provides: [mantleArtifacts.mantlePotential],

  ops: {
    computeMantlePotential: foundation.mantle.ops.computeMantlePotential,
  },
});
