import { FLAT_TERRAIN, OCEAN_TERRAIN, defineVizMeta, logLandmassAscii } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import PlotCoastsStepContract from "./plotCoasts.contract.js";
import { assertNoWaterDrift } from "./assertions.js";

const GROUP_MAP_PROJECTION = "Morphology / Map Projection";

export default createStep(PlotCoastsStepContract, {
  run: (context, _config, _ops, deps) => {
    const topography = deps.artifacts.topography.read(context);
    const coastlineMetrics = deps.artifacts.coastlineMetrics.read(context);
    const { width, height } = context.dimensions;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const terrain = topography.landMask[idx] === 1 ? FLAT_TERRAIN : OCEAN_TERRAIN;
        context.adapter.setTerrainType(x, y, terrain);
      }
    }

    context.adapter.expandCoasts(width, height);

    // NOTE: Projection layers use morphology coastline metrics pre-expandCoasts (not 1:1 with engine terrain).
    context.viz?.dumpGrid(context.trace, {
      layerId: "map.morphology.coasts.coastalLand",
      dims: { width, height },
      format: "u8",
      values: coastlineMetrics.coastalLand,
      meta: defineVizMeta("map.morphology.coasts.coastalLand", {
        label: "Coastal Land (Projection)",
        group: GROUP_MAP_PROJECTION,
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      layerId: "map.morphology.coasts.coastalWater",
      dims: { width, height },
      format: "u8",
      values: coastlineMetrics.coastalWater,
      meta: defineVizMeta("map.morphology.coasts.coastalWater", {
        label: "Coastal Water (Projection)",
        group: GROUP_MAP_PROJECTION,
      }),
    });

    logLandmassAscii(context.trace, context.adapter, width, height);
    assertNoWaterDrift(context, topography.landMask, "map-morphology/plot-coasts");
  },
});
