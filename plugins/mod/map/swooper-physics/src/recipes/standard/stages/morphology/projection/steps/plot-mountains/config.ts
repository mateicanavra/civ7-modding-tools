import { artifacts as hydrographyArtifacts } from "../../../../../../../domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "../../../../../../../domain/morphology/modules/landforms/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";
import { STANDARD_COMPLETIONS } from "../../../../../completions.js";

/**
 * Defines mountain projection after continent terrain is stable, requiring Morphology's authored
 * mask and topography while owning no mountain-generation policy.
 */
export const config = defineStep({
  id: "plot-mountains",
  description: "Projects admitted Morphology mountain intent onto the current Civ7 map.",
  engine: ["setTerrainType", "readCurrentMapWaterMask"] as const,
  requires: [
    STANDARD_COMPLETIONS.continentsPlotted,
    morphologyLandformsArtifacts.mountains,
    hydrographyArtifacts.hydrography,
  ],
  provides: [STANDARD_COMPLETIONS.mountainsPlotted],
});
