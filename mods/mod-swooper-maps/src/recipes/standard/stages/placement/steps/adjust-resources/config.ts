import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import resources from "@mapgen/domain/resources";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import { PLACEMENT_PRODUCT_EFFECT_TAGS } from "../../../../tag-contracts.js";
import { artifacts as placementArtifacts } from "../../artifacts/index.js";

/**
 * Defines the post-start resource support boundary. It publishes the only
 * adjusted plan; place-resources remains the sole owner of engine stamping.
 */
export const AdjustResourcesStepContract = defineStep({
  id: "adjust-resources",
  requires: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.startsAssigned],
  provides: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.resourcesAdjusted],
  artifacts: {
    requires: [
      placementArtifacts.resourcePlan,
      placementArtifacts.resourceEligibility,
      placementArtifacts.startAssignment,
      placementArtifacts.landmassRegionSlotByTile,
      morphologyLandformsArtifacts.landmasses,
    ],
    provides: [placementArtifacts.resourcePlanAdjusted],
  },
  ops: {
    support: resources.support.ops.adjustResourceSupport,
  },
  schema: Type.Object({}),
});
