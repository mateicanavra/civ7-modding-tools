import { Type, defineStep } from "@swooper/mapgen-core/authoring";

import { MAP_PROJECTION_EFFECT_TAGS } from "../../../tags.js";
import { morphologyArtifacts } from "../../morphology/artifacts.js";
import { mapHydrologyArtifacts } from "../../map-hydrology/artifacts.js";
import { mapElevationArtifacts } from "../artifacts.js";

const BuildElevationStepContract = defineStep({
  id: "build-elevation",
  phase: "gameplay",
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
    requires: [
      morphologyArtifacts.topography,
      morphologyArtifacts.mountains,
      mapHydrologyArtifacts.engineProjectionLakes,
      mapHydrologyArtifacts.hydrologyLakesEngineTerrainSnapshot,
    ],
    provides: [mapElevationArtifacts.elevationEngineTerrainSnapshot],
  },
  schema: Type.Object({}),
});

export default BuildElevationStepContract;
