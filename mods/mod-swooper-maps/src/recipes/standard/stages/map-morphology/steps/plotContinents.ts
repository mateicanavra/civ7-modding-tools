import { defineVizMeta, logLandmassAscii, snapshotEngineHeightfield } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import PlotContinentsStepContract from "./plotContinents.contract.js";
import { assertNoWaterDrift } from "./assertions.js";

const GROUP_MAP_PROJECTION = "Morphology / Map Projection";
const TILE_SPACE_ID = "tile.hexOddR" as const;

export default createStep(PlotContinentsStepContract, {
  run: (context, _config, _ops, deps) => {
    const topography = deps.artifacts.topography.read(context);
    const { width, height } = context.dimensions;

    context.adapter.validateAndFixTerrain();
    context.adapter.recalculateAreas();
    context.adapter.stampContinents();

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
        group: GROUP_MAP_PROJECTION,
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
          group: GROUP_MAP_PROJECTION,
          palette: "categorical",
          role: "engine",
        }),
      });
    }

    logLandmassAscii(context.trace, context.adapter, width, height);
    assertNoWaterDrift(context, topography.landMask, "map-morphology/plot-continents");
  },
});
