import { defineVizMeta, logLandmassAscii, syncHeightfield } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import PlotContinentsStepContract from "./plotContinents.contract.js";
import { assertNoWaterDrift } from "./assertions.js";

const GROUP_MAP_PROJECTION = "Morphology / Map Projection";

export default createStep(PlotContinentsStepContract, {
  run: (context, _config, _ops, deps) => {
    const topography = deps.artifacts.topography.read(context);
    const { width, height } = context.dimensions;

    context.adapter.validateAndFixTerrain();
    context.adapter.recalculateAreas();
    context.adapter.stampContinents();

    syncHeightfield(context);
    const heightfield = context.buffers.heightfield;
    context.viz?.dumpGrid(context.trace, {
      layerId: "map.morphology.continents.landMask",
      dims: { width, height },
      format: "u8",
      values: heightfield.landMask,
      meta: defineVizMeta("map.morphology.continents.landMask", {
        label: "Land Mask (After Stamp Continents)",
        group: GROUP_MAP_PROJECTION,
      }),
    });

    logLandmassAscii(context.trace, context.adapter, width, height);
    assertNoWaterDrift(context, topography.landMask, "map-morphology/plot-continents");
  },
});
