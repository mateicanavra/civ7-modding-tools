import { artifacts as placementStartArtifacts } from "@mapgen/domain/placement/modules/starts/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

import { PLACEMENT_PRODUCT_EFFECT_TAGS } from "../../../../tag-contracts.js";

/**
 * Defines discovery placement after starts and resources are stamped, requiring the exclusion
 * assignment and declaring observed outcomes rather than a precomputed discovery plan.
 */
export const config = defineStep({
  id: "place-discoveries",
  engine: ["generateOfficialDiscoveries"] as const,
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
    requires: [placementStartArtifacts.startAssignment],
  },
});
