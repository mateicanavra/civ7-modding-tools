import { artifacts as placementWonderArtifacts } from "@mapgen/domain/placement/modules/wonders/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

import { STANDARD_COMPLETIONS } from "../../../../completions.js";

/**
 * Natural wonders are a placement product boundary, not a maintenance helper.
 *
 * The upstream planner owns intent and this step owns the materialized Civ7
 * transaction. It emits terminal recipe evidence for target shortfalls and
 * adapter rejections instead of letting optional wonder misses abort the map.
 */
export const config = defineStep({
  id: "place-natural-wonders",
  engine: ["placeNaturalWonder"] as const,
  requires: [placementWonderArtifacts.naturalWonderPlan],
  provides: [STANDARD_COMPLETIONS.naturalWondersPlaced],
});
