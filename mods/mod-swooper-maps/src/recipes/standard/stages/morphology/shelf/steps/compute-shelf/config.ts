import morphology from "@mapgen/domain/morphology";
import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { artifacts as morphologyTerrainArtifacts } from "@mapgen/domain/morphology/modules/terrain/artifacts/index.js";
import { artifacts as morphologyShelfArtifacts } from "@mapgen/domain/morphology/modules/shelf/artifacts/index.js";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Computes the continental shelf from POST-island morphology truth.
 *
 * Runs after morphology-features (islands + mountains), so the shelf and the
 * post-island coastline reflect final land — island peaks get real shelves, and
 * downstream ocean-geometry / reef / coast consumers see one coherent vintage.
 */
export const ComputeShelfStepContract = defineStep({
  id: "compute-shelf",
  requires: [],
  provides: [],
  artifacts: {
    requires: [morphologyLandformsArtifacts.topography, morphologyTerrainArtifacts.beltDrivers],
    provides: [morphologyShelfArtifacts.shelf],
  },
  ops: {
    coastalAdjacency: morphology.coasts.ops.computeCoastalAdjacency,
    distanceToCoast: morphology.coasts.ops.computeDistanceToCoast,
    shelfMask: morphology.shelf.ops.computeShelfMask,
  },
  schema: Type.Object({}),
});
