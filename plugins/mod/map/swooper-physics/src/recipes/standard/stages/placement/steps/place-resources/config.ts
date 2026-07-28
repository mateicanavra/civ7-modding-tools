import { artifacts as resourceSupportArtifacts } from "../../../../../../domain/resources/modules/support/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

import { STANDARD_COMPLETIONS } from "../../../../completions.js";

/**
 * Materializes the final post-start resource plan without relocating or reselecting intent.
 *
 * The adapter owns Civ7 feasibility and exact readback. The completed step emits
 * terminal placement measurements and closes the resource product boundary
 * before discoveries.
 */
export const config = defineStep({
  id: "place-resources",
  engine: ["emitRuntimeWarning", "placeResourceIntent", "getResourceCatalog"] as const,
  requires: [resourceSupportArtifacts.resourcePlanAdjusted],
  provides: [STANDARD_COMPLETIONS.resourcesPlaced],
});
