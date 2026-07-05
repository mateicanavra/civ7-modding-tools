import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

import { PLACEMENT_PRODUCT_EFFECT_TAGS } from "../../../../tag-contracts.js";
import { artifacts as placementArtifacts } from "../../artifacts/index.js";

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
