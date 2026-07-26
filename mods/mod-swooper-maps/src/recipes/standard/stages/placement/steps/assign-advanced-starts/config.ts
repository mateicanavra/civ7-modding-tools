import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

import { PLACEMENT_PRODUCT_EFFECT_TAGS } from "../../../../tag-contracts.js";

/**
 * Engine-owned advanced-start pass. Ordering after discoveries is carried by
 * the `discoveriesPlaced` effect tag alone — this step consumes no artifact
 * data (S6: no read-and-discard artifacts).
 */
export const config = defineStep({
  id: "assign-advanced-starts",
  engine: ["recalculateFertility", "assignAdvancedStartRegions"] as const,
  requires: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.discoveriesPlaced],
  provides: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.advancedStartsAssigned],
});
