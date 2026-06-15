import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import { mapArtifacts } from "../../../../map-artifacts.js";
import { MAP_PROJECTION_EFFECT_TAGS } from "../../../../tag-contracts.js";
import { morphologyArtifacts } from "../../../morphology/artifacts.js";

const PlotLandmassRegionsStepContract = defineStep({
  id: "plot-landmass-regions",
  phase: "placement",
  requires: [],
  provides: [MAP_PROJECTION_EFFECT_TAGS.map.landmassRegionsPlotted],
  artifacts: {
    requires: [morphologyArtifacts.topography, morphologyArtifacts.landmasses],
    provides: [mapArtifacts.projectionMeta, mapArtifacts.landmassRegionSlotByTile],
  },
  schema: Type.Object({}, { additionalProperties: false }),
});

export default PlotLandmassRegionsStepContract;
