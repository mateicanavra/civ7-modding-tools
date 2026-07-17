import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

import { MAP_PROJECTION_EFFECT_TAGS } from "../../../tag-contracts.js";
import { artifacts as morphologyArtifacts } from "../../morphology/artifacts/index.js";
import { artifacts as mapMorphologyArtifacts } from "../artifacts/index.js";

/**
 * Defines continent projection after `coastsPlotted`, preventing the implementation from
 * classifying a pre-coast engine surface and declaring its validation snapshot.
 */
const PlotContinentsStepContract = defineStep({
  id: "plot-continents",
  phase: "morphology",
  requires: [MAP_PROJECTION_EFFECT_TAGS.map.coastsPlotted],
  provides: [MAP_PROJECTION_EFFECT_TAGS.map.continentsPlotted],
  artifacts: {
    requires: [morphologyArtifacts.topography, mapMorphologyArtifacts.coastClassification],
    provides: [mapMorphologyArtifacts.continentValidationTerrainSnapshot],
  },
  schema: Type.Object({}),
});

export default PlotContinentsStepContract;
