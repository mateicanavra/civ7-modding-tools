import { Type, defineStep } from "@swooper/mapgen-core/authoring";

import { PLACEMENT_PRODUCT_EFFECT_TAGS } from "../../../../tags.js";
import { placementArtifacts } from "../../artifacts.js";

/**
 * Natural wonders are a placement product boundary, not a maintenance helper.
 *
 * The upstream planner owns intent and this step owns the materialized Civ7
 * effect. It publishes reconciliation evidence for target shortfalls and
 * adapter rejections instead of letting optional wonder misses abort the map.
 */
const PlaceNaturalWondersStepContract = defineStep({
  id: "place-natural-wonders",
  phase: "placement",
  requires: [],
  provides: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.naturalWondersPlaced],
  artifacts: {
    requires: [placementArtifacts.placementInputs, placementArtifacts.naturalWonderPlan],
    provides: [placementArtifacts.naturalWonderPlacement],
  },
  schema: Type.Object({}, { additionalProperties: false }),
});

export default PlaceNaturalWondersStepContract;
