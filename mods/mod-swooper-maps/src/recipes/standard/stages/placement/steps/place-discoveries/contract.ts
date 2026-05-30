import { Type, defineStep } from "@swooper/mapgen-core/authoring";

import { PLACEMENT_PRODUCT_EFFECT_TAGS } from "../../../../tags.js";
import { placementArtifacts } from "../../artifacts.js";

const PlaceDiscoveriesStepContract = defineStep({
  id: "place-discoveries",
  phase: "placement",
  requires: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.startsAssigned],
  provides: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.discoveriesPlaced],
  artifacts: {
    requires: [placementArtifacts.discoveryPlan, placementArtifacts.startAssignment],
    provides: [placementArtifacts.discoveryPlacementOutcomes],
  },
  schema: Type.Object({}, { additionalProperties: false }),
});

export default PlaceDiscoveriesStepContract;
