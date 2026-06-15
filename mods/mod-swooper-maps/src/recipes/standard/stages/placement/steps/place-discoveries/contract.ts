import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

import { PLACEMENT_PRODUCT_EFFECT_TAGS } from "../../../../tag-contracts.js";
import { placementArtifacts } from "../../artifacts.js";

const PlaceDiscoveriesStepContract = defineStep({
  id: "place-discoveries",
  phase: "placement",
  // S5 chain: discoveries follow the resource stamp — resourcesPlaced now
  // lands after startsAssigned + the support pass (D3 reorder). Ordering
  // after starts is carried by the effect tags alone; the discovery plan is
  // the only data this step consumes (S6: no read-and-discard artifacts).
  requires: [
    PLACEMENT_PRODUCT_EFFECT_TAGS.placement.startsAssigned,
    PLACEMENT_PRODUCT_EFFECT_TAGS.placement.resourcesPlaced,
  ],
  provides: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.discoveriesPlaced],
  artifacts: {
    requires: [placementArtifacts.discoveryPlan],
    provides: [placementArtifacts.discoveryPlacementOutcomes],
  },
  schema: Type.Object({}, { additionalProperties: false }),
});

export default PlaceDiscoveriesStepContract;
