import foundation from "../../../../../../../domain/foundation/index.js";
import { artifacts as mantleArtifacts } from "../../../../../../../domain/foundation/modules/mantle/artifacts/index.js";
import { artifacts as meshArtifacts } from "../../../../../../../domain/foundation/modules/mesh/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines the conversion from mantle potential into velocity, stress, and
 * upwelling/downwelling forcing. Lithosphere and tectonic consumers therefore share one
 * forcing field vintage.
 */
export const config = defineStep({
  id: "mantle-forcing",
  requires: [meshArtifacts.mesh, mantleArtifacts.mantlePotential],
  provides: [mantleArtifacts.mantleForcing],

  ops: {
    computeMantleForcing: foundation.mantle.ops.computeMantleForcing,
  },
});
