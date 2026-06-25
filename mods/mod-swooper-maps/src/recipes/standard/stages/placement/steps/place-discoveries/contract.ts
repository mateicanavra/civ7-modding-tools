import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

import { PLACEMENT_PRODUCT_EFFECT_TAGS } from "../../../../tag-contracts.js";
import { placementArtifacts } from "../../artifacts.js";

const PlaceDiscoveriesStepContract = defineStep({
  id: "place-discoveries",
  phase: "placement",
  // Discoveries run last (after natural wonders, resources, and starts), exactly
  // as Civ7's base maps run discovery generation: the official generator reads
  // engine state (isNaturalWonder / getResourceType / distance-from-start) that
  // must already be stamped. Ordering after starts/resources is carried by the
  // effect tags; the start plots are consumed from the startAssignment artifact
  // to gate discoveries away from majors (S6: no read-and-discard artifacts).
  requires: [
    PLACEMENT_PRODUCT_EFFECT_TAGS.placement.startsAssigned,
    PLACEMENT_PRODUCT_EFFECT_TAGS.placement.resourcesPlaced,
  ],
  provides: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.discoveriesPlaced],
  artifacts: {
    requires: [placementArtifacts.startAssignment],
    provides: [placementArtifacts.discoveryPlacementOutcomes],
  },
  schema: Type.Object({}, { additionalProperties: false }),
});

export default PlaceDiscoveriesStepContract;
