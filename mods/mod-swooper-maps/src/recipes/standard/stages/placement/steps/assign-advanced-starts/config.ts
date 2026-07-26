import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

import { PLACEMENT_PRODUCT_EFFECT_TAGS } from "../../../../tag-contracts.js";
import { artifacts as placementArtifacts } from "../../artifacts/index.js";

/**
 * Engine-owned advanced-start pass. Ordering after discoveries is carried by
 * the `discoveriesPlaced` effect tag alone — this step consumes no artifact
 * data (S6: no read-and-discard artifacts).
 */
export const AssignAdvancedStartsStepContract = defineStep({
  id: "assign-advanced-starts",
  engine: ["recalculateFertility", "assignAdvancedStartRegions"] as const,
  requires: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.discoveriesPlaced],
  provides: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.advancedStartsAssigned],
  artifacts: {
    provides: [placementArtifacts.advancedStartAssignment],
  },
  schema: Type.Object({}, { additionalProperties: false }),
});
