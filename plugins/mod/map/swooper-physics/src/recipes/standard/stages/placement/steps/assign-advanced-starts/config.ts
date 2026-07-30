import { artifacts as placementStartArtifacts } from "../../../../../../domain/placement/modules/starts/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";
import { STANDARD_COMPLETIONS } from "../../../../completions.js";

/**
 * Engine-owned advanced-start pass. It consumes the admitted major-start
 * assignment, recalculates fertility after discovery placement, and then runs
 * Civ7's official advanced-region assignment.
 */
export const config = defineStep({
  id: "assign-advanced-starts",
  engine: ["recalculateFertility", "assignAdvancedStartRegions"] as const,
  requires: [STANDARD_COMPLETIONS.discoveriesPlaced, placementStartArtifacts.startAssignment],
  provides: [],
});
