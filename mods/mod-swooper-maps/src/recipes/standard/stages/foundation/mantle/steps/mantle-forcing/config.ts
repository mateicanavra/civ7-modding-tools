import foundation from "@mapgen/domain/foundation";
import { artifacts as mantleArtifacts } from "@mapgen/domain/foundation/modules/mantle/artifacts";
import { artifacts as meshArtifacts } from "@mapgen/domain/foundation/modules/mesh/artifacts";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines the conversion from mantle potential into velocity, stress, and
 * upwelling/downwelling forcing. Lithosphere and tectonic consumers therefore share one
 * forcing field vintage.
 */
export const config = defineStep({
  id: "mantle-forcing",
  requires: [],
  provides: [],
  artifacts: {
    requires: [meshArtifacts.mesh, mantleArtifacts.mantlePotential],
    provides: [mantleArtifacts.mantleForcing],
  },
  ops: {
    computeMantleForcing: foundation.mantle.ops.computeMantleForcing,
  },
  schema: Type.Object({}, { additionalProperties: false }),
});
