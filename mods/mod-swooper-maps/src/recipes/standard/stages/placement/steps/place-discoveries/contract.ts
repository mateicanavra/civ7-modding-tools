import { Type, defineStep } from "@swooper/mapgen-core/authoring";

import { PLACEMENT_PRODUCT_EFFECT_TAGS } from "../../../../tags.js";
import { placementArtifacts } from "../../artifacts.js";

const PlaceDiscoveriesStepContract = defineStep({
  id: "place-discoveries",
  phase: "placement",
  // S5 chain: discoveries follow the resource stamp — resourcesPlaced now
  // lands after startsAssigned + the support pass (D3 reorder).
  requires: [
    PLACEMENT_PRODUCT_EFFECT_TAGS.placement.startsAssigned,
    PLACEMENT_PRODUCT_EFFECT_TAGS.placement.resourcesPlaced,
  ],
  provides: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.discoveriesPlaced],
  artifacts: {
    requires: [placementArtifacts.discoveryPlan, placementArtifacts.startAssignment],
    provides: [placementArtifacts.discoveryPlacementOutcomes],
  },
  schema: Type.Object({}, { additionalProperties: false }),
});

export default PlaceDiscoveriesStepContract;
