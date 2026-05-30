import { Type, defineStep } from "@swooper/mapgen-core/authoring";

import { PLACEMENT_PRODUCT_EFFECT_TAGS } from "../../../../tags.js";
import { mapArtifacts } from "../../../../map-artifacts.js";
import { placementArtifacts } from "../../artifacts.js";

const AssignStartsStepContract = defineStep({
  id: "assign-starts",
  phase: "placement",
  requires: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.resourcesPlaced],
  provides: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.startsAssigned],
  artifacts: {
    requires: [
      placementArtifacts.placementInputs,
      placementArtifacts.placementSurfacePreparation,
      mapArtifacts.landmassRegionSlotByTile,
    ],
    provides: [placementArtifacts.startAssignment],
  },
  schema: Type.Object({}, { additionalProperties: false }),
});

export default AssignStartsStepContract;
