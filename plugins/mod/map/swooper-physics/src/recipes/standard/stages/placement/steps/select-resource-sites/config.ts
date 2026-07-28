import { artifacts as hydrographyArtifacts } from "../../../../../../domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "../../../../../../domain/morphology/modules/landforms/artifacts/index.js";
import { artifacts as placementRegionArtifacts } from "../../../../../../domain/placement/modules/regions/artifacts/index.js";
import resources from "../../../../../../domain/resources/index.js";
import { artifacts as resourceDemandArtifacts } from "../../../../../../domain/resources/modules/demand/artifacts/index.js";
import { artifacts as resourceSiteArtifacts } from "../../../../../../domain/resources/modules/sites/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";
import { STANDARD_INITIAL_SETUP } from "../../../../initial-setup.js";

/**
 * Selects deterministic resource sites from the admitted demand ledger and placement topology.
 */
export const config = defineStep({
  id: "select-resource-sites",
  initialSetup: STANDARD_INITIAL_SETUP,
  requires: [
    resourceDemandArtifacts.resourceDemandPlan,
    morphologyLandformsArtifacts.topography,
    morphologyLandformsArtifacts.landmasses,
    hydrographyArtifacts.lakePlan,
    placementRegionArtifacts.landmassRegionSlotByTile,
  ],
  provides: [resourceSiteArtifacts.resourcePlan],

  ops: {
    selectSites: resources.sites.ops.selectResourceSites,
  },
});
