import morphology from "@mapgen/domain/morphology";
import { artifacts as morphologyCoastsArtifacts } from "@mapgen/domain/morphology/modules/coasts/artifacts/index.js";
import { artifacts as morphologyErosionArtifacts } from "@mapgen/domain/morphology/modules/erosion/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { artifacts as morphologyRoutingArtifacts } from "@mapgen/domain/morphology/modules/routing/artifacts/index.js";
import { artifacts as morphologyTerrainArtifacts } from "@mapgen/domain/morphology/modules/terrain/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Mountain planning is Morphology truth, not map projection.
 *
 * Ridges, foothills, and rough-land hills are planned from belt-driver,
 * topography, substrate, routing, and coastline fields so downstream projection
 * can stamp terrain without deciding where rough terrain should exist.
 */
export const config = defineStep({
  id: "mountains",
  description: "Plans Morphology mountain intent from admitted physical evidence.",
  requires: [],
  provides: [],
  artifacts: {
    requires: [
      morphologyTerrainArtifacts.beltDrivers,
      morphologyLandformsArtifacts.topography,
      morphologyErosionArtifacts.substrate,
      morphologyRoutingArtifacts.routing,
      morphologyCoastsArtifacts.carvedCoastline,
    ],
    provides: [morphologyLandformsArtifacts.mountains],
  },
  ops: {
    ridges: morphology.landforms.ops.planRidges,
    foothills: morphology.landforms.ops.planFoothills,
    roughLands: morphology.landforms.ops.planRoughLands,
  },
});
