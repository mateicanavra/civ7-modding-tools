import { artifacts as placementStartArtifacts } from "../../../../../../domain/placement/modules/starts/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

import { STANDARD_COMPLETIONS } from "../../../../completions.js";

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
  // must already be stamped. The start assignment artifact gates discoveries
  // away from majors, while resource stamping is an explicit completion edge.
  requires: [STANDARD_COMPLETIONS.resourcesPlaced, placementStartArtifacts.startAssignment],
  provides: [STANDARD_COMPLETIONS.discoveriesPlaced],
});
