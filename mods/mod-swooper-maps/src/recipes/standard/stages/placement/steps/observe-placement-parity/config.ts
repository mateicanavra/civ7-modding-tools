import { artifacts as hydrographyArtifacts } from "@mapgen/domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";
import { PLACEMENT_PRODUCT_EFFECT_TAGS } from "../../../../tag-contracts.js";

/**
 * Declares the final Placement observation boundary. The step compares
 * Morphology topography plus accepted Hydrology lakes with exact current Civ7
 * layers after every placement product has completed; it does not aggregate or
 * re-own those products.
 */
export const config = defineStep({
  id: "observe-placement-parity",
  engine: [
    "readCurrentMapTerrainTypes",
    "readCurrentMapElevations",
    "readCurrentMapWaterMask",
  ] as const,
  requires: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.advancedStartsAssigned],
  provides: [],
  artifacts: {
    requires: [morphologyLandformsArtifacts.topography, hydrographyArtifacts.projectedLakes],
  },
});
