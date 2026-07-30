import { artifacts as morphologyLandformsArtifacts } from "../../../../../../../domain/morphology/modules/landforms/artifacts/index.js";
import { artifacts as morphologyShelfArtifacts } from "../../../../../../../domain/morphology/modules/shelf/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";
import { STANDARD_COMPLETIONS } from "../../../../../completions.js";

/**
 * Defines the coast projection boundary from Morphology topography and shelf truth.
 * Engine readback remains invocation-local parity and visualization evidence.
 */
export const config = defineStep({
  id: "plot-coasts",
  engine: ["setTerrainType", "readCurrentMapWaterMask"] as const,
  requires: [morphologyLandformsArtifacts.topography, morphologyShelfArtifacts.shelf],
  provides: [STANDARD_COMPLETIONS.coastsPlotted],
});
