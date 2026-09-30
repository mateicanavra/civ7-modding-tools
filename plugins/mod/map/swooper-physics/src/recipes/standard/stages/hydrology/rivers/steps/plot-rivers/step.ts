import {
  CIV7_BROWSER_TABLES_V0,
  deriveCiv7CoastProjection,
} from "@civ7/map-policy";
import { createStep } from "@swooper/mapgen-core/authoring";
import { assertAcceptedLakeFootprint, restoreProjectedCoastTerrain } from "../../../../../water-surface-parity.js";
import { projectAuthoredRiverNetwork } from "../../model/policy/authored-river-projection.js";
import { config } from "./config.js";
import { buildPlotRiversVizProjections, type PlotRiversVizEvidence } from "./viz.js";

/**
 * Projects the authored physical network after elevation and observes native realization.
 */
export const PlotRiversStep = createStep(config, {
  run: (context, _stepConfig, _ops, deps) => {
    const hydrography = deps.artifacts.hydrography.read();
    const lakePlan = deps.artifacts.lakePlan.read();
    const shelf = deps.artifacts.shelf.read();
    const topography = deps.artifacts.topography.read();
    const { width, height } = context.setup.dimensions;
    const terrain = CIV7_BROWSER_TABLES_V0.terrainTypeIndices;
    const coastProjection = deriveCiv7CoastProjection({
      width,
      height,
      landMask: topography.landMask,
      shelfMask: shelf.shelfMask,
      coastalWater: shelf.coastalWater,
    });
    const acceptedLakeMask = deps.artifacts.projectedLakes.read().lakeMask;
    const materialized = projectAuthoredRiverNetwork({
      width, height, landMask: topography.landMask, lakePlan, acceptedLakeMask,
      riverClass: hydrography.riverClass, flowDir: hydrography.flowDir,
    });
    const capabilities = deps.engine.getRiverCapabilities(context);
    for (const key of ["setRiverInfo", "finalizeRivers", "riverTypeReadback"] as const) {
      const capability = capabilities[key];
      if (capability.status !== "available") throw new Error(`Authored rivers require ${key}: ${capability.reason}`);
    }
    // Preflight the complete plan before the first mutation; never drop a blocked channel.
    assertAcceptedLakeFootprint(
      context.setup.dimensions, acceptedLakeMask,
      deps.engine.readCurrentMapWaterMask(context),
      deps.engine.readCurrentMapTerrainTypes(context),
      "map-rivers/plot-rivers/preflight"
    );
    for (const write of materialized.writes) {
      const x = write.sourceCell % width;
      const y = Math.floor(write.sourceCell / width);
      if (deps.engine.isWater(context, x, y) || deps.engine.getTerrainType(context, x, y) === terrain.TERRAIN_MOUNTAIN) {
        throw new Error(`Authored river source ${write.sourceCell} is blocked by native terrain.`);
      }
      const receiverX = write.receiverCell % width;
      const receiverY = Math.floor(write.receiverCell / width);
      if (deps.engine.getTerrainType(context, receiverX, receiverY) === terrain.TERRAIN_MOUNTAIN) {
        throw new Error(`Authored river receiver ${write.receiverCell} is blocked by native terrain.`);
      }
    }
    for (const write of materialized.wetTransitionWrites) {
      const x = write.sourceCell % width;
      const y = Math.floor(write.sourceCell / width);
      const receiverX = write.receiverCell % width;
      const receiverY = Math.floor(write.receiverCell / width);
      if (!deps.engine.isWater(context, x, y) || deps.engine.isWater(context, receiverX, receiverY)
        || deps.engine.getTerrainType(context, receiverX, receiverY) === terrain.TERRAIN_MOUNTAIN) {
        throw new Error(`Authored wet outlet ${write.sourceCell}->${write.receiverCell} is blocked by native terrain.`);
      }
    }
    deps.artifacts.projectedRivers.publish(materialized);
    for (const write of [...materialized.writes, ...materialized.wetTransitionWrites]) {
      deps.engine.setRiverInfo(context, {
        x: write.sourceCell % width, y: Math.floor(write.sourceCell / width),
        direction: write.direction, riverClass: write.riverClass,
      });
    }
    deps.engine.finalizeRivers(context, [false, 25, 2, 2]);
    deps.engine.validateAndFixTerrain(context);
    restoreProjectedCoastTerrain(context.setup.dimensions, context.trace, {
      getTerrainType: (x, y) => deps.engine.getTerrainType(context, x, y),
      setTerrainType: (x, y, value) => deps.engine.setTerrainType(context, x, y, value),
      storeWaterData: () => deps.engine.storeWaterData(context),
    }, coastProjection, "map-rivers/plot-rivers");
    // Cliffs consume finalized native river terrain, not the earlier dry channel substrate.
    deps.engine.generateCliffsFromElevation(context);
    deps.engine.recalculateAreas(context);
    deps.engine.storeWaterData(context);
    assertAcceptedLakeFootprint(
      context.setup.dimensions,
      acceptedLakeMask,
      deps.engine.readCurrentMapWaterMask(context),
      deps.engine.readCurrentMapTerrainTypes(context),
      "map-rivers/plot-rivers/post-maintenance"
    );
    const riverReadback = deps.engine.readRiverProjection(context, width, height, materialized.riverMask);
    context.trace.event(() => ({
      type: "map.rivers.authoredNetworkMaterialization",
      model: materialized.model,
      authoredSourceCount: materialized.authoredSourceCount,
      wetTransitionWriteCount: materialized.wetTransitionWrites.length,
      plannedMinorRiverTileCount: materialized.plannedMinorRiverTileCount,
      plannedMajorRiverTileCount: materialized.plannedMajorRiverTileCount,
      navigableTerrainMismatchCount: riverReadback.navigableRiverMismatchTileCount,
      nativeMinorMismatchCount: Array.from(materialized.nativeMinorRiverMask).reduce((count, value, cell) => count + Number(value !== riverReadback.engineMinorRiverMask[cell]), 0),
      nativeNavigableMismatchCount: Array.from(materialized.riverMask).reduce((count, value, cell) => count + Number(value !== riverReadback.engineNavigableRiverMask[cell]), 0),
    }));
    return {
      riverClass: hydrography.riverClass,
      discharge: Float32Array.from(hydrography.discharge), // Visualization only; the physical ledger stays Number-precision.
      materialized, topographyLandMask: topography.landMask, engineEvidence: { riverReadback },
    } satisfies PlotRiversVizEvidence;
},
  viz: ({ observation, dimensions }) => buildPlotRiversVizProjections(observation, dimensions),
});
