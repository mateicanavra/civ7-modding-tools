import { Type, defineStep } from "@swooper/mapgen-core/authoring";

import { PLACEMENT_PRODUCT_EFFECT_TAGS } from "../../../../tags.js";
import { placementArtifacts } from "../../artifacts.js";

/**
 * Thin resource stamp (S3, reordered by S5/D3): stamps the ADJUSTED intent
 * set produced by the post-starts support pass. Stamping is the last
 * resource authority point — post-stamp mutation is rejected (no engine
 * resource-removal capability; the plan is adjusted pre-stamp instead).
 */
const PlaceResourcesStepContract = defineStep({
  id: "place-resources",
  phase: "placement",
  requires: [
    PLACEMENT_PRODUCT_EFFECT_TAGS.placement.surfacePrepared,
    PLACEMENT_PRODUCT_EFFECT_TAGS.placement.resourcesAdjusted,
  ],
  provides: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.resourcesPlaced],
  artifacts: {
    requires: [
      placementArtifacts.resourcePlanAdjusted,
      placementArtifacts.placementSurfacePreparation,
    ],
    provides: [placementArtifacts.resourcePlacementOutcomes],
  },
  schema: Type.Object({}, { additionalProperties: false }),
});

export default PlaceResourcesStepContract;
