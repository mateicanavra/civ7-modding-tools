import { artifacts as morphologyArtifacts } from "@mapgen/domain/morphology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import { MAP_PROJECTION_EFFECT_TAGS } from "../../../../../tag-contracts.js";
import { artifactModules as mapMorphologyArtifactModules } from "../../artifacts/index.js";

/**
 * Defines the coast projection boundary from Morphology topography and shelf truth, declaring
 * only the engine snapshot consumed by later continent validation.
 */
export const PlotCoastsStepContract = defineStep({
  id: "plot-coasts",
  engine: ["setTerrainType", "getTerrainType", "getElevation", "isWater"] as const,
  requires: [],
  provides: [MAP_PROJECTION_EFFECT_TAGS.map.coastsPlotted],
  artifacts: {
    requires: [morphologyArtifacts.topography, morphologyArtifacts.shelf],
    provides: [mapMorphologyArtifactModules.coastEngineTerrainSnapshot],
  },
  schema: Type.Object({}),
});
