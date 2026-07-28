import { artifacts as hydrographyArtifacts } from "@mapgen/domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

import { STANDARD_COMPLETIONS } from "../../../../../completions.js";

/**
 * Defines elevation materialization after mountains, volcanoes, and lakes are projected.
 * It composes Morphology land truth with the exact accepted-lake projection, while
 * current engine readback remains invocation-local continuity evidence.
 */
export const config = defineStep({
  id: "build-elevation",
  engine: [
    "recalculateAreas",
    "buildElevation",
    "readCurrentMapTerrainTypes",
    "readCurrentMapElevations",
    "readCurrentMapWaterMask",
  ] as const,
  requires: [
    STANDARD_COMPLETIONS.mountainsPlotted,
    STANDARD_COMPLETIONS.volcanoesPlotted,
    hydrographyArtifacts.projectedLakes,
    morphologyLandformsArtifacts.topography,
  ],
  provides: [STANDARD_COMPLETIONS.elevationBuilt],
});
