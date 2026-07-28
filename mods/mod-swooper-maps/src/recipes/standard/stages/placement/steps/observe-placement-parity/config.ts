import { artifacts as hydrographyArtifacts } from "@mapgen/domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
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
    "readCurrentMapElevations",
    "readCurrentMapWaterMask",
    "readCurrentMapLakeMask",
  ] as const,
  requires: [
    STANDARD_COMPLETIONS.surfacePrepared,
    morphologyLandformsArtifacts.topography,
    hydrographyArtifacts.projectedLakes,
  ],
  provides: [],
});
