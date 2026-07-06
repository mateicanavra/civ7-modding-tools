import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

import { MAP_PROJECTION_EFFECT_TAGS } from "../../../tag-contracts.js";
import { artifacts as mapHydrologyArtifacts } from "../../map-hydrology/artifacts/index.js";
import { artifacts as morphologyArtifacts } from "../../morphology/artifacts/index.js";
import { artifacts as mapElevationArtifacts } from "../artifacts/index.js";

const BuildElevationStepContract = defineStep({
  id: "build-elevation",
  phase: "morphology",
  requires: [
    MAP_PROJECTION_EFFECT_TAGS.map.mountainsPlotted,
    MAP_PROJECTION_EFFECT_TAGS.map.volcanoesPlotted,
    MAP_PROJECTION_EFFECT_TAGS.map.lakesPlotted,
  ],
  provides: [
    MAP_PROJECTION_EFFECT_TAGS.map.elevationBuilt,
    MAP_PROJECTION_EFFECT_TAGS.map.elevationParityCaptured,
  ],
  artifacts: {
    requires: [morphologyArtifacts.topography, mapHydrologyArtifacts.engineProjectionLakes],
    provides: [mapElevationArtifacts.elevationEngineTerrainSnapshot],
  },
  schema: Type.Object({}),
});

export default BuildElevationStepContract;
