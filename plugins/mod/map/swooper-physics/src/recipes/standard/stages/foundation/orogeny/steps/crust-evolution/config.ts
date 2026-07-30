import foundation from "../../../../../../../domain/foundation/index.js";
import { artifacts as lithosphereArtifacts } from "../../../../../../../domain/foundation/modules/lithosphere/artifacts/index.js";
import { artifacts as meshArtifacts } from "../../../../../../../domain/foundation/modules/mesh/artifacts/index.js";
import { artifacts as orogenyArtifacts } from "../../../../../../../domain/foundation/modules/orogeny/artifacts/index.js";
import { artifacts as tectonicsArtifacts } from "../../../../../../../domain/foundation/modules/tectonics/artifacts/index.js";
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
