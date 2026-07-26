import { artifacts as resourceSiteArtifacts } from "@mapgen/domain/resources/modules/sites/artifacts/index.js";
import { artifacts as resourceSupportArtifacts } from "@mapgen/domain/resources/modules/support/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

import { PLACEMENT_PRODUCT_EFFECT_TAGS } from "../../../../tag-contracts.js";

/**
 * Thin resource stamp (S3, reordered by S5/D3): stamps the ADJUSTED intent
 * set produced by the post-starts support pass. Stamping is the last
 * resource authority point — post-stamp mutation is rejected (no engine
 * resource-removal capability; the plan is adjusted pre-stamp instead).
 */
export const config = defineStep({
  id: "place-resources",
  engine: ["placeResourceIntent", "getResourceCatalog"] as const,
  requires: [
    PLACEMENT_PRODUCT_EFFECT_TAGS.placement.surfacePrepared,
    PLACEMENT_PRODUCT_EFFECT_TAGS.placement.resourcesAdjusted,
  ],
  provides: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.resourcesPlaced],
  artifacts: {
    requires: [resourceSupportArtifacts.resourcePlanAdjusted],
    provides: [resourceSiteArtifacts.resourcePlacementOutcomes],
  },
});
