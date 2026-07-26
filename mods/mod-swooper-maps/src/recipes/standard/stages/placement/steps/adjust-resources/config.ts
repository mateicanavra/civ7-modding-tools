import resources from "@mapgen/domain/resources";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import { PLACEMENT_PRODUCT_EFFECT_TAGS } from "../../../../tag-contracts.js";
import { artifacts as morphologyArtifacts } from "@mapgen/domain/morphology";
import {
  artifactModules as placementArtifactModules,
  artifacts as placementArtifacts,
} from "../../artifacts/index.js";

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
      morphologyArtifacts.landmasses,
    ],
    provides: [placementArtifactModules.resourcePlanAdjusted],
  },
  ops: {
    support: resources.ops.adjustResourceSupport,
  },
  schema: Type.Object({}),
});
