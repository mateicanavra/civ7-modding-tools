import { defineVizMeta, logElevationSummary, logLandmassAscii, snapshotEngineHeightfield } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import BuildElevationStepContract from "./buildElevation.contract.js";
import { assertNoWaterDrift } from "./assertions.js";

const GROUP_MAP_MORPHOLOGY = "Map / Morphology (Engine)";
const TILE_SPACE_ID = "tile.hexOddR" as const;

export default createStep(BuildElevationStepContract, {
  run: (context, _config, _ops, deps) => {
    const topography = deps.artifacts.topography.read(context);
    const { width, height } = context.dimensions;

    const size = Math.max(0, (width | 0) * (height | 0));
    const terrainBefore = new Int32Array(size);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        terrainBefore[idx] = context.adapter.getTerrainType(x, y) | 0;
      }
    }

    // Base-standard ordering: do not call validateAndFixTerrain/stampContinents here.
    // We have already stamped land/water + coasts from Morphology truth and verified
    // no drift earlier (plot-coasts/plot-continents/plot-mountains/plot-volcanoes).
    //
    // Calling validateAndFixTerrain here can reclassify coastal tiles (engine coast/lake
    // repair) and violate our "landMask is authoritative" invariant.
    context.adapter.recalculateAreas();
    context.adapter.buildElevation();
    context.adapter.recalculateAreas();

    // Repair pass: if the engine's post-buildElevation water classification drifted away
    // from Morphology truth (landMask), restore the pre-buildElevation terrain for those tiles.
    //
    // This is conservative: it preserves mountains/hills/coasts while ensuring buildElevation
    // cannot "grow lakes" or otherwise flip land/water in a way that violates our truth tensors.
    //
    // Note: we intentionally do NOT call validateAndFixTerrain here; that can reintroduce drift.
    //
    // Important: GameplayMap.isWater is not guaranteed to be derived from TerrainBuilder.getTerrainType
    // after buildElevation; it can be backed by cached water tables. So repairing only the drift tiles
    // is not sufficient in the engine.
    //
    // Our invariant is: Morphology landMask is authoritative. So after buildElevation has populated
    // engine elevation internals, we restore the full plotted terrain snapshot, then run the engine's
    // own bookkeeping to sync water caches back to that plotted truth.
    let driftCount = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        context.adapter.setTerrainType(x, y, terrainBefore[idx] | 0);
        const wantsLand = topography.landMask[idx] === 1;
        const isWater = context.adapter.isWater(x, y);
        const isLand = !isWater;
        if (wantsLand !== isLand) driftCount += 1;
      }
    }

    // Sync engine continent/area/water caches to match the restored plotted terrain.
    // These calls are engine-owned, and are no-ops in the MockAdapter.
    context.adapter.stampContinents();
    context.adapter.recalculateAreas();
    context.adapter.storeWaterData();
    context.adapter.recalculateAreas();

    if (driftCount > 0) {
      context.trace.event(() => ({
        kind: "map.morphology.buildElevation.driftRepair",
        driftTiles: driftCount,
      }));
    }

    const physics = context.buffers.heightfield;
    const engine = snapshotEngineHeightfield(context);
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "map.morphology.elevation.elevation",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "i16",
      values: physics.elevation,
      meta: defineVizMeta("map.morphology.elevation.elevation", {
        label: "Elevation (Physics Truth)",
        group: GROUP_MAP_MORPHOLOGY,
        role: "physics",
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "map.morphology.elevation.landMask",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: physics.landMask,
      meta: defineVizMeta("map.morphology.elevation.landMask", {
        label: "Land Mask (Physics Truth)",
        group: GROUP_MAP_MORPHOLOGY,
        palette: "categorical",
        role: "physics",
        visibility: "debug",
      }),
    });
    if (engine) {
      context.viz?.dumpGrid(context.trace, {
        dataTypeKey: "map.morphology.elevation.elevation",
        spaceId: TILE_SPACE_ID,
        dims: { width, height },
        format: "i16",
      values: engine.elevation,
      meta: defineVizMeta("map.morphology.elevation.elevation", {
        label: "Elevation (Engine)",
        group: GROUP_MAP_MORPHOLOGY,
        role: "engine",
      }),
    });
      context.viz?.dumpGrid(context.trace, {
        dataTypeKey: "map.morphology.elevation.landMask",
        spaceId: TILE_SPACE_ID,
        dims: { width, height },
        format: "u8",
      values: engine.landMask,
      meta: defineVizMeta("map.morphology.elevation.landMask", {
        label: "Land Mask (Engine)",
        group: GROUP_MAP_MORPHOLOGY,
        palette: "categorical",
        role: "engine",
        visibility: "debug",
      }),
    });
    }

    logElevationSummary(context.trace, context.adapter, width, height, "map-morphology/build-elevation");
    logLandmassAscii(context.trace, context.adapter, width, height);
    assertNoWaterDrift(context, topography.landMask, "map-morphology/build-elevation");
  },
});
