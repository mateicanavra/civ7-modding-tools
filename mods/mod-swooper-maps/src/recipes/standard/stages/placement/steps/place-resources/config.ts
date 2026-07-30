import { artifacts as resourceSupportArtifacts } from "@mapgen/domain/resources/modules/support/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

import { PLACEMENT_PRODUCT_EFFECT_TAGS } from "../../../../tag-contracts.js";

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
  requires: [],
  provides: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.resourcesPlaced],
  artifacts: {
    requires: [resourceSupportArtifacts.resourcePlanAdjusted],
  },
});
