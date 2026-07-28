import foundation from "../../../../../../../domain/foundation/index.js";
import { artifacts as lithosphereArtifacts } from "../../../../../../../domain/foundation/modules/lithosphere/artifacts/index.js";
import { artifacts as mantleArtifacts } from "../../../../../../../domain/foundation/modules/mantle/artifacts/index.js";
import { artifacts as meshArtifacts } from "../../../../../../../domain/foundation/modules/mesh/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines initial lithosphere truth from the tectonic mesh and mantle forcing. The step
 * publishes initialCrust before plate partitioning, keeping initial crust generation distinct
 * from later tectonic evolution.
 */
export const config = defineStep({
  id: "crust",
  requires: [meshArtifacts.mesh, mantleArtifacts.mantleForcing],
  provides: [lithosphereArtifacts.initialCrust],

  ops: {
    computeCrust: foundation.lithosphere.ops.computeCrust,
  },
});
