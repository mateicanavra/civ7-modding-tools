import { artifacts as morphologyArtifacts } from "@mapgen/domain/morphology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import { MAP_PROJECTION_EFFECT_TAGS } from "../../../../../tag-contracts.js";

/**
 * Defines the coast projection boundary from Morphology topography and shelf truth.
 * Engine readback remains invocation-local parity and visualization evidence.
 */
export const PlotCoastsStepContract = defineStep({
  id: "plot-coasts",
  engine: ["setTerrainType", "getTerrainType", "getElevation", "isWater"] as const,
  requires: [],
  provides: [MAP_PROJECTION_EFFECT_TAGS.map.coastsPlotted],
  artifacts: {
    requires: [morphologyArtifacts.topography, morphologyArtifacts.shelf],
  },
  schema: Type.Object({}),
});
