import morphology from "../../../../../../../domain/morphology/index.js";
import { artifacts as morphologyLandformsArtifacts } from "../../../../../../../domain/morphology/modules/landforms/artifacts/index.js";
import { artifacts as morphologyShelfArtifacts } from "../../../../../../../domain/morphology/modules/shelf/artifacts/index.js";
import { artifacts as morphologyTerrainArtifacts } from "../../../../../../../domain/morphology/modules/terrain/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Computes the continental shelf from POST-island morphology truth.
 *
 * Runs after morphology-features (islands + mountains), so the shelf and the
 * post-island coastline include every formed island and microcontinent, and
 * downstream ocean-geometry / reef / coast consumers see one coherent vintage.
 */
export const config = defineStep({
  id: "compute-shelf",
  requires: [morphologyLandformsArtifacts.topography, morphologyTerrainArtifacts.beltDrivers],
  provides: [morphologyShelfArtifacts.shelf],

  ops: {
    coastalAdjacency: morphology.coasts.ops.computeCoastalAdjacency,
    distanceToCoast: morphology.coasts.ops.computeDistanceToCoast,
    shelfMask: morphology.shelf.ops.computeShelfMask,
  },
});
