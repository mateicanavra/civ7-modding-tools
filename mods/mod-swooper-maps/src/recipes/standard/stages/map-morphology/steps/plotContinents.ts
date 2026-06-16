import { defineVizMeta, logLandmassAscii, snapshotEngineHeightfield } from "@swooper/mapgen-core";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import { restoreProjectedCoastTerrain } from "../../../projection-policies/coastProjectionParity.js";
import { assertWaterDriftWithinPolicy } from "../../../projection-policies/noWaterDrift.js";
import { mapMorphologyArtifacts } from "../artifacts.js";
import PlotContinentsStepContract from "./plotContinents.contract.js";

const GROUP_MAP_MORPHOLOGY = "Map / Morphology (Engine)";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

export default createStep(PlotContinentsStepContract, {
  artifacts: implementArtifacts([mapMorphologyArtifacts.continentValidationTerrainSnapshot], {
    continentValidationTerrainSnapshot: {},
  }),
  run: (context, _config, _ops, deps) => {
    const topography = deps.artifacts.topography.read(context);
    const coastClassification = deps.artifacts.coastClassification.read(context);
    const { width, height } = context.dimensions;

    context.adapter.validateAndFixTerrain();
    context.adapter.recalculateAreas();
    context.adapter.stampContinents();
    restoreProjectedCoastTerrain(context, coastClassification, "map-morphology/plot-continents");

    const physics = context.buffers.heightfield;
    const engine = snapshotEngineHeightfield(context);
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "map.morphology.continents.landMask",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: physics.landMask,
      meta: defineVizMeta("map.morphology.continents.landMask", {
        label: "Land Mask (Physics Truth)",
        group: GROUP_MAP_MORPHOLOGY,
        palette: "categorical",
        role: "physics",
      }),
    });
    if (engine) {
      context.viz?.dumpGrid(context.trace, {
        dataTypeKey: "map.morphology.continents.landMask",
        spaceId: TILE_SPACE_ID,
        dims: { width, height },
        format: "u8",
        values: engine.landMask,
        meta: defineVizMeta("map.morphology.continents.landMask", {
          label: "Land Mask (Engine After Stamp Continents)",
          group: GROUP_MAP_MORPHOLOGY,
          palette: "categorical",
          role: "engine",
        }),
      });
    }
    if (engine) {
      deps.artifacts.continentValidationTerrainSnapshot.publish(context, {
        stage: "map-morphology/plot-continents",
        width,
        height,
        landMask: engine.landMask,
        terrain: engine.terrain,
        elevation: engine.elevation,
      });
    }

    logLandmassAscii(context.trace, context.adapter, width, height);
    assertWaterDriftWithinPolicy(context, topography.landMask, "map-morphology/plot-continents");
  },
});
