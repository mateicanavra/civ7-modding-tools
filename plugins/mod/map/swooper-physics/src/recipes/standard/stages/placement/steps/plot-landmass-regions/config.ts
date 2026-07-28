import { artifacts as morphologyLandformsArtifacts } from "../../../../../../domain/morphology/modules/landforms/artifacts/index.js";
import placement from "../../../../../../domain/placement/index.js";
import { artifacts as placementRegionArtifacts } from "../../../../../../domain/placement/modules/regions/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Defines the single landmass-region projection from admitted topology,
 * publishing the per-tile slot evidence consumed by placement.
 */
export const config = defineStep({
  id: "plot-landmass-regions",
  engine: ["getLandmassId", "setLandmassRegionId"] as const,
  requires: [morphologyLandformsArtifacts.topography, morphologyLandformsArtifacts.landmasses],
  provides: [placementRegionArtifacts.landmassRegionSlotByTile],

  ops: {
    regions: placement.regions.ops.projectLandmassRegions,
  },
});
