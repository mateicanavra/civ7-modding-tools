import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

import { MAP_PROJECTION_EFFECT_TAGS } from "../../../tag-contracts.js";
import { artifacts as morphologyArtifacts } from "../../morphology/artifacts/index.js";
import { artifacts as mapMorphologyArtifacts } from "../artifacts/index.js";

/**
 * Defines the coast projection boundary from Morphology topography and shelf truth, declaring
 * the coast classification and engine snapshot consumed by later continent validation.
 */
const PlotCoastsStepContract = defineStep({
  id: "plot-coasts",
  phase: "morphology",
  requires: [],
  provides: [MAP_PROJECTION_EFFECT_TAGS.map.coastsPlotted],
  artifacts: {
    requires: [morphologyArtifacts.topography, morphologyArtifacts.shelf],
    provides: [
      mapMorphologyArtifacts.coastClassification,
      mapMorphologyArtifacts.coastEngineTerrainSnapshot,
    ],
  },
  schema: Type.Object({}),
});

export default PlotCoastsStepContract;
