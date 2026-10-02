import morphology from "../../../../../../../domain/morphology/index.js";
import { artifacts as hydrographyArtifacts } from "../../../../../../../domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyErosionArtifacts } from "../../../../../../../domain/morphology/modules/erosion/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "../../../../../../../domain/morphology/modules/landforms/artifacts/index.js";
import { artifacts as morphologyShelfArtifacts } from "../../../../../../../domain/morphology/modules/shelf/artifacts/index.js";
import { artifacts as morphologyTerrainArtifacts } from "../../../../../../../domain/morphology/modules/terrain/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Mountain planning is Morphology truth, not map projection.
 *
 * Ridges, foothills, and rough-land hills are planned from belt-driver,
 * sealed topography, substrate, certified contributing area, and post-island coastline fields so downstream projection
 * can stamp terrain without deciding where rough terrain should exist.
 */
export const config = defineStep({
  id: "mountains",
  description: "Plans Morphology mountain intent from admitted physical evidence.",
  requires: [
    morphologyTerrainArtifacts.beltDrivers,
    morphologyErosionArtifacts.topography,
    morphologyErosionArtifacts.substrate,
    hydrographyArtifacts.riverNetwork,
    morphologyShelfArtifacts.shelf,
    hydrographyArtifacts.hydrography,
  ],
  provides: [morphologyLandformsArtifacts.mountains],

  ops: {
    ridges: morphology.landforms.ops.planRidges,
    foothills: morphology.landforms.ops.planFoothills,
    roughLands: morphology.landforms.ops.planRoughLands,
  },
});
