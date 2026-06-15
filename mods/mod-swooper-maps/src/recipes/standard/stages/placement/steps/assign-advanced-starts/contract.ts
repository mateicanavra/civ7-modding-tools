import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

import { PLACEMENT_PRODUCT_EFFECT_TAGS } from "../../../../tag-contracts.js";
import { placementArtifacts } from "../../artifacts.js";

/**
 * Engine-owned advanced-start pass. Ordering after discoveries is carried by
 * the `discoveriesPlaced` effect tag alone — this step consumes no artifact
 * data (S6: no read-and-discard artifacts).
 */
const AssignAdvancedStartsStepContract = defineStep({
  id: "assign-advanced-starts",
  phase: "placement",
  requires: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.discoveriesPlaced],
  provides: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.advancedStartsAssigned],
  artifacts: {
    provides: [placementArtifacts.advancedStartAssignment],
  },
  schema: Type.Object({}, { additionalProperties: false }),
});

export default AssignAdvancedStartsStepContract;
