import { artifacts as morphologyLandformsArtifacts } from "../../../../../../../domain/morphology/modules/landforms/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";
import { STANDARD_COMPLETIONS } from "../../../../../completions.js";

/**
 * Defines volcano projection after continent terrain is stable. Its completion
 * dependency declares a finished projection transaction, not ownership of volcano truth.
 */
export const config = defineStep({
  id: "plot-volcanoes",
  engine: [
    "setTerrainType",
    "setFeatureType",
    "readCurrentMapWaterMask",
    "readCurrentMapTerrainTypes",
    "readCurrentMapFeatureTypes",
  ] as const,
  requires: [
    STANDARD_COMPLETIONS.continentsPlotted,
    morphologyLandformsArtifacts.topography,
    morphologyLandformsArtifacts.volcanoes,
  ],
  provides: [STANDARD_COMPLETIONS.volcanoesPlotted],
});
