import { Type, defineStep } from "@swooper/mapgen-core/authoring";

import { M10_EFFECT_TAGS } from "../../../tags.js";
import { mapArtifacts } from "../../../map-artifacts.js";
import { morphologyArtifacts } from "../../morphology/artifacts.js";

const BuildElevationStepContract = defineStep({
  id: "build-elevation",
  phase: "gameplay",
  requires: [M10_EFFECT_TAGS.map.mountainsPlotted, M10_EFFECT_TAGS.map.volcanoesPlotted],
  provides: [M10_EFFECT_TAGS.map.elevationBuilt, M10_EFFECT_TAGS.map.morphologyParityCaptured],
  artifacts: {
    requires: [morphologyArtifacts.topography],
    provides: [mapArtifacts.morphologyEngineTerrainSnapshot],
  },
  schema: Type.Object({}),
});

export default BuildElevationStepContract;
