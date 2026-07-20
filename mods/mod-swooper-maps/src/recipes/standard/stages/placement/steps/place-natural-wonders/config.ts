import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

import { PLACEMENT_PRODUCT_EFFECT_TAGS } from "../../../../tag-contracts.js";
import {
  artifactModules as placementArtifactModules,
  artifacts as placementArtifacts,
} from "../../artifacts/index.js";

/**
 * Natural wonders are a placement product boundary, not a maintenance helper.
 *
 * The upstream planner owns intent and this step owns the materialized Civ7
 * effect. It publishes reconciliation evidence for target shortfalls and
 * adapter rejections instead of letting optional wonder misses abort the map.
 */
export const PlaceNaturalWondersStepContract = defineStep({
  id: "place-natural-wonders",
  requires: [],
  provides: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.naturalWondersPlaced],
  artifacts: {
    requires: [placementArtifacts.placementInputs, placementArtifacts.naturalWonderPlan],
    provides: [placementArtifactModules.naturalWonderPlacement],
  },
  schema: Type.Object({}, { additionalProperties: false }),
});
