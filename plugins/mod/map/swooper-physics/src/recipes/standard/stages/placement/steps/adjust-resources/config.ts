import { artifacts as morphologyLandformsArtifacts } from "../../../../../../domain/morphology/modules/landforms/artifacts/index.js";
import { artifacts as placementRegionArtifacts } from "../../../../../../domain/placement/modules/regions/artifacts/index.js";
import { artifacts as placementStartArtifacts } from "../../../../../../domain/placement/modules/starts/artifacts/index.js";
import resources from "../../../../../../domain/resources/index.js";
import { artifacts as resourceDemandArtifacts } from "../../../../../../domain/resources/modules/demand/artifacts/index.js";
import { artifacts as resourceSiteArtifacts } from "../../../../../../domain/resources/modules/sites/artifacts/index.js";
import { artifacts as resourceSupportArtifacts } from "../../../../../../domain/resources/modules/support/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";
import { STANDARD_INITIAL_SETUP } from "../../../../initial-setup.js";

/**
 * Defines the post-start resource support boundary. It publishes the only
 * adjusted plan; place-resources remains the sole owner of engine stamping.
 */
export const config = defineStep({
  id: "adjust-resources",
  initialSetup: STANDARD_INITIAL_SETUP,
  engine: ["emitRuntimeWarning"] as const,
  requires: [
    resourceSiteArtifacts.resourcePlan,
    resourceDemandArtifacts.resourceDemandPlan,
    placementStartArtifacts.startAssignment,
    placementRegionArtifacts.landmassRegionSlotByTile,
    morphologyLandformsArtifacts.landmasses,
  ],
  provides: [resourceSupportArtifacts.resourcePlanAdjusted],

  ops: {
    support: resources.support.ops.adjustResourceSupport,
  },
});
