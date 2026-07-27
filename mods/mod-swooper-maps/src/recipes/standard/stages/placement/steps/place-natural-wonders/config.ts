import { artifacts as placementWonderArtifacts } from "@mapgen/domain/placement/modules/wonders/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

import { PLACEMENT_PRODUCT_EFFECT_TAGS } from "../../../../tag-contracts.js";

/**
 * Natural wonders are a placement product boundary, not a maintenance helper.
 *
 * The upstream planner owns intent and this step owns the materialized Civ7
 * effect. It emits terminal recipe evidence for target shortfalls and
 * adapter rejections instead of letting optional wonder misses abort the map.
 */
export const config = defineStep({
  id: "place-natural-wonders",
  engine: ["placeNaturalWonder"] as const,
  requires: [placementWonderArtifacts.naturalWonderPlan],
  provides: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.naturalWondersPlaced],
});
