import foundation from "@mapgen/domain/foundation";
import { artifacts as lithosphereArtifacts } from "@mapgen/domain/foundation/modules/lithosphere/artifacts";
import { artifacts as meshArtifacts } from "@mapgen/domain/foundation/modules/mesh/artifacts";
import { artifacts as orogenyArtifacts } from "@mapgen/domain/foundation/modules/orogeny/artifacts";
import { artifacts as tectonicsArtifacts } from "@mapgen/domain/foundation/modules/tectonics/artifacts";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines final crust evolution from initial crust, mantle forcing, plate motion, and tectonic
 * history. It publishes the crust vintage consumed by morphology without exposing intermediate
 * history as elevation.
 */
export const config = defineStep({
  id: "crust-evolution",
  requires: [
    meshArtifacts.mesh,
    lithosphereArtifacts.initialCrust,
    tectonicsArtifacts.currentTectonics,
    tectonicsArtifacts.tectonicHistory,
  ],
  provides: [orogenyArtifacts.crust],

  ops: {
    computeCrustEvolution: foundation.orogeny.ops.computeCrustEvolution,
  },
});
