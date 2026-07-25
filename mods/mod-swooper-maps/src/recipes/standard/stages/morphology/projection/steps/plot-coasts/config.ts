import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { artifacts as morphologyShelfArtifacts } from "@mapgen/domain/morphology/modules/shelf/artifacts/index.js";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import { MAP_PROJECTION_EFFECT_TAGS } from "../../../../../tag-contracts.js";

/**
 * Defines the coast projection boundary from Morphology topography and shelf truth.
 * Engine readback remains invocation-local parity and visualization evidence.
 */
export const config = defineStep({
  id: "plot-coasts",
  engine: ["setTerrainType", "getTerrainType", "getElevation", "isWater"] as const,
  requires: [],
  provides: [MAP_PROJECTION_EFFECT_TAGS.map.coastsPlotted],
  artifacts: {
    requires: [morphologyLandformsArtifacts.topography, morphologyShelfArtifacts.shelf],
  },
  schema: Type.Object({}),
});
