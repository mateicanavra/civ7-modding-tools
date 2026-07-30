import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { artifacts as placementRegionArtifacts } from "@mapgen/domain/placement/modules/regions/artifacts/index.js";
import { artifacts as placementStartArtifacts } from "@mapgen/domain/placement/modules/starts/artifacts/index.js";
import resources from "@mapgen/domain/resources";
import { artifacts as resourceDemandArtifacts } from "@mapgen/domain/resources/modules/demand/artifacts/index.js";
import { artifacts as resourceSiteArtifacts } from "@mapgen/domain/resources/modules/sites/artifacts/index.js";
import { artifacts as resourceSupportArtifacts } from "@mapgen/domain/resources/modules/support/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";
import { PLACEMENT_PRODUCT_EFFECT_TAGS } from "../../../../tag-contracts.js";

/**
 * Defines the post-start resource support boundary. It publishes the only
 * adjusted plan; place-resources remains the sole owner of engine stamping.
 */
export const config = defineStep({
  id: "adjust-resources",
  engine: ["emitRuntimeWarning"] as const,
  requires: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.startsAssigned],
  provides: [],
  artifacts: {
    requires: [
      resourceSiteArtifacts.resourcePlan,
      resourceDemandArtifacts.resourceDemandPlan,
      placementStartArtifacts.startAssignment,
      placementRegionArtifacts.landmassRegionSlotByTile,
      morphologyLandformsArtifacts.landmasses,
    ],
    provides: [resourceSupportArtifacts.resourcePlanAdjusted],
  },
  ops: {
    support: resources.support.ops.adjustResourceSupport,
  },
});
