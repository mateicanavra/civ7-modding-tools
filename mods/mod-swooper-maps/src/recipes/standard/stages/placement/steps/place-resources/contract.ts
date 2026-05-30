import { Type, defineStep } from "@swooper/mapgen-core/authoring";

import { PLACEMENT_PRODUCT_EFFECT_TAGS } from "../../../../tags.js";
import { placementArtifacts } from "../../artifacts.js";

const PlaceResourcesStepContract = defineStep({
  id: "place-resources",
  phase: "placement",
  requires: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.surfacePrepared],
  provides: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.resourcesPlaced],
  artifacts: {
    requires: [placementArtifacts.resourcePlan, placementArtifacts.placementSurfacePreparation],
    provides: [placementArtifacts.resourcePlacementOutcomes],
  },
  schema: Type.Object({}, { additionalProperties: false }),
});

export default PlaceResourcesStepContract;
