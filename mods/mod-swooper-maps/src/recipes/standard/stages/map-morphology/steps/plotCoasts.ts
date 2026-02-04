import { COAST_TERRAIN, FLAT_TERRAIN, OCEAN_TERRAIN, defineVizMeta, logLandmassAscii } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import PlotCoastsStepContract from "./plotCoasts.contract.js";
import { assertNoWaterDrift } from "./assertions.js";

const GROUP_MAP_MORPHOLOGY = "Map / Morphology (Engine)";
const TILE_SPACE_ID = "tile.hexOddR" as const;

export default createStep(PlotCoastsStepContract, {
  run: (context, _config, _ops, deps) => {
    const topography = deps.artifacts.topography.read(context);
    const coastlineMetrics = deps.artifacts.coastlineMetrics.read(context);
    const { width, height } = context.dimensions;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        // Coasts are shallow shelf water derived from Morphology truth (our analogue of Civ's
        // validateAndFixTerrain + expandCoasts pipeline). We intentionally avoid Civ's coast expansion.
        const terrain =
          topography.landMask[idx] === 1
            ? FLAT_TERRAIN
            : coastlineMetrics.coastalWater[idx] === 1 || coastlineMetrics.shelfMask[idx] === 1
              ? COAST_TERRAIN
              : OCEAN_TERRAIN;
        context.adapter.setTerrainType(x, y, terrain);
      }
    }

    // Map-stage layers: coastline metrics are computed from Morphology truth (tile-space) and should match
    // the engine terrain projection (land=flat, coastal water=coast, deep water=ocean).
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "map.morphology.coasts.coastalLand",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: coastlineMetrics.coastalLand,
      meta: defineVizMeta("map.morphology.coasts.coastalLand", {
        label: "Coastal Land (Coastline Metrics)",
        group: GROUP_MAP_MORPHOLOGY,
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "map.morphology.coasts.coastalWater",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: coastlineMetrics.coastalWater,
      meta: defineVizMeta("map.morphology.coasts.coastalWater", {
        label: "Coastal Water (Coastline Metrics)",
        group: GROUP_MAP_MORPHOLOGY,
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "map.morphology.coasts.shelfMask",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: coastlineMetrics.shelfMask,
      meta: defineVizMeta("map.morphology.coasts.shelfMask", {
        label: "Shelf Mask (Coastline Metrics)",
        group: GROUP_MAP_MORPHOLOGY,
      }),
    });

    logLandmassAscii(context.trace, context.adapter, width, height);
    assertNoWaterDrift(context, topography.landMask, "map-morphology/plot-coasts");
  },
});
