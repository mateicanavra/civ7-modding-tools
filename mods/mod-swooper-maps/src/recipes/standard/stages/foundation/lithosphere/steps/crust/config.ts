import foundation from "@mapgen/domain/foundation";
import { artifacts as lithosphereArtifacts } from "@mapgen/domain/foundation/modules/lithosphere/artifacts";
import { artifacts as mantleArtifacts } from "@mapgen/domain/foundation/modules/mantle/artifacts";
import { artifacts as meshArtifacts } from "@mapgen/domain/foundation/modules/mesh/artifacts";
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
    requires: [meshArtifacts.mesh, mantleArtifacts.mantleForcing],
    provides: [lithosphereArtifacts.initialCrust],
  },
  ops: {
    computeCrust: foundation.lithosphere.ops.computeCrust,
  },
  schema: Type.Object({}, { additionalProperties: false }),
});
