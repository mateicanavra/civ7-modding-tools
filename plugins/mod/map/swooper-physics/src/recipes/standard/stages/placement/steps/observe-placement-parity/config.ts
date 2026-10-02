import { artifacts as hydrographyArtifacts } from "../../../../../../domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyErosionArtifacts } from "../../../../../../domain/morphology/modules/erosion/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";
import { STANDARD_COMPLETIONS } from "../../../../completions.js";

/**
 * Declares the final Placement observation boundary. The step compares
 * Morphology topography plus accepted Hydrology lakes with exact current Civ7
 * layers as the terminal step in authored Placement order; it does not
 * aggregate or re-own those products.
 */
export const config = defineStep({
  id: "observe-placement-parity",
  engine: [
    "readCurrentMapTerrainTypes",
    "readCurrentMapElevationSnapshot",
    "readCurrentMapWaterMask",
    "readCurrentMapLakeMask",
    "readRiverProjection",
  ] as const,
  requires: [
    STANDARD_COMPLETIONS.surfacePrepared,
    morphologyErosionArtifacts.topography,
    hydrographyArtifacts.projectedLakes,
    hydrographyArtifacts.hydrography,
    hydrographyArtifacts.projectedRivers,
  ],
  provides: [],
});
