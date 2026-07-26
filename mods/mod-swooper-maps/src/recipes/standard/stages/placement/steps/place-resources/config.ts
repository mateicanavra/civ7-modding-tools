import { artifacts as resourceSiteArtifacts } from "@mapgen/domain/resources/modules/sites/artifacts/index.js";
import { artifacts as resourceSupportArtifacts } from "@mapgen/domain/resources/modules/support/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

import { PLACEMENT_PRODUCT_EFFECT_TAGS } from "../../../../tag-contracts.js";

/**
 * Materializes the final post-start resource plan without relocating or reselecting intent.
 *
 * The adapter owns Civ7 feasibility and exact readback. This step publishes
 * typed outcomes and closes the resource product boundary before discoveries.
 */
export const config = defineStep({
  id: "place-resources",
  engine: ["placeResourceIntent", "getResourceCatalog"] as const,
  requires: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.surfacePrepared],
  provides: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.resourcesPlaced],
  artifacts: {
    requires: [resourceSupportArtifacts.resourcePlanAdjusted],
    provides: [resourceSiteArtifacts.resourcePlacementOutcomes],
  },
});
