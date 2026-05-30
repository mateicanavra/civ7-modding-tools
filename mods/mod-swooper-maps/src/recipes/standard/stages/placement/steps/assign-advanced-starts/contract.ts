import { Type, defineStep } from "@swooper/mapgen-core/authoring";

import { PLACEMENT_PRODUCT_EFFECT_TAGS } from "../../../../tags.js";
import { placementArtifacts } from "../../artifacts.js";

const AssignAdvancedStartsStepContract = defineStep({
  id: "assign-advanced-starts",
  phase: "placement",
  requires: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.discoveriesPlaced],
  provides: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.advancedStartsAssigned],
  artifacts: {
    requires: [placementArtifacts.discoveryPlacementOutcomes],
    provides: [placementArtifacts.advancedStartAssignment],
  },
  schema: Type.Object({}, { additionalProperties: false }),
});

export default AssignAdvancedStartsStepContract;
