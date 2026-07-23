import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import { MAP_PROJECTION_EFFECT_TAGS } from "../../../../tag-contracts.js";
import { artifacts as morphologyArtifacts } from "@mapgen/domain/morphology";
import { artifactModules as placementArtifactModules } from "../../artifacts/index.js";

/**
 * Defines the pre-placement landmass-region projection from Morphology truth, declaring the
 * per-tile slot map and metadata used to interpret the engine-facing surface.
 */
export const PlotLandmassRegionsStepContract = defineStep({
  id: "plot-landmass-regions",
  engine: ["getLandmassId", "setLandmassRegionId"] as const,
  requires: [],
  provides: [MAP_PROJECTION_EFFECT_TAGS.map.landmassRegionsPlotted],
  artifacts: {
    requires: [morphologyArtifacts.topography, morphologyArtifacts.landmasses],
    provides: [placementArtifactModules.landmassRegionSlotByTile],
  },
  schema: Type.Object({}, { additionalProperties: false }),
});
