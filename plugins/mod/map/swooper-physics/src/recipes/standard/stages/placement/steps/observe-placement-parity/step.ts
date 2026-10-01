import { CIV7_BROWSER_TABLES_V0 } from "@civ7/map-policy";
import { createStep } from "@swooper/mapgen-core/authoring";
import { encodeBoundedJsonLogLines } from "@swooper/mapgen-core/lib/log";
import { projectStandardElevation } from "../../../../elevation-projection.js";
import {
  measureStandardElevationProjection,
  STANDARD_ELEVATION_FINAL_METRIC_KEY,
} from "../../../../metrics/families/elevation-projection.js";
import { measureStandardPlacementParity } from "../../../../metrics/families/placement-parity.js";
import {
  measureStandardFinalRiverParity,
  STANDARD_FINAL_RIVER_PARITY_METRIC_KEY,
} from "../../../../metrics/families/hydrology/final-river-parity.js";
import { emitStandardPlacementParityExactLog } from "../../../../parity/placement-exact-log.js";
import { landMaskFromWaterMask } from "../../../../water-surface-parity.js";
import { config } from "./config.js";
import { projectPlacementParityViz } from "./viz.js";

/**
 * Observes one terminal Civ7 surface after placement and compares its water and
 * lake classifications with immutable Morphology and Hydrology evidence.
 */
export const ObservePlacementParityStep = createStep(config, {
  run: (context, _stepConfig, _ops, deps) => {
    const topography = deps.artifacts.topography.read();
    const hydrography = deps.artifacts.hydrography.read();
    const projectedLakes = deps.artifacts.projectedLakes.read();
    const projectedRivers = deps.artifacts.projectedRivers.read();
    const { width, height } = context.setup.dimensions;
    const terminalSnapshot = {
      width,
      height,
      terrain: deps.engine.readCurrentMapTerrainTypes(context),
      elevation: deps.engine.readCurrentMapElevationSnapshot(context),
      waterMask: deps.engine.readCurrentMapWaterMask(context),
      lakeMask: deps.engine.readCurrentMapLakeMask(context),
    };
    if (
      terminalSnapshot.elevation.width !== width ||
      terminalSnapshot.elevation.height !== height
    ) {
      throw new Error("Final elevation readback dimensions differ from the current map.");
    }
    // Compare the final projected land classification with the engine surface
    // after all placement product work has completed. Accepted lakes are
    // intentionally water even though they began as Morphology land.
    const engineObservation = {
      terrain: terminalSnapshot.terrain,
      landMask: landMaskFromWaterMask(terminalSnapshot.waterMask),
      ...(terminalSnapshot.elevation.status === "available"
        ? { elevation: terminalSnapshot.elevation.values }
        : {}),
    };
    let waterDriftCount = 0;
    let acceptedLakeTileCount = 0;
    let finalLakeWaterDriftCount = 0;
    let finalLakeClassificationDriftCount = 0;
    const waterDrift = new Uint8Array(engineObservation.landMask.length);
    for (let i = 0; i < engineObservation.landMask.length; i++) {
      const acceptedLake = (projectedLakes.lakeMask[i] ?? 0) === 1;
      const expectedWater = hydrography.exposedLandMask[i] !== 1;
      const engineWater = (terminalSnapshot.waterMask[i] ?? 0) === 1;
      if (engineWater !== expectedWater) {
        waterDriftCount++;
        // 1 = engine land where projection says water; 2 = engine water where projection says land.
        waterDrift[i] = engineWater ? 2 : 1;
      }
      if (!acceptedLake) continue;
      acceptedLakeTileCount++;
      if (!engineWater) finalLakeWaterDriftCount++;
      if ((terminalSnapshot.lakeMask[i] ?? 0) !== 1) finalLakeClassificationDriftCount++;
    }
    const placementParity = measureStandardPlacementParity({
      waterDriftCount,
      acceptedLakeTileCount,
      finalLakeWaterDriftCount,
      finalLakeClassificationDriftCount,
    });
    context.trace.event(() => ({
      type: "placement.parity",
      ...placementParity,
    }));
    emitStandardPlacementParityExactLog(placementParity);

    const finalRiverParity = measureStandardFinalRiverParity({
      width,
      height,
      intendedMinor: projectedRivers.nativeMinorRiverMask,
      intendedNavigable: projectedRivers.riverMask,
      readback: (() => {
        try {
          return {
            status: "available" as const,
            value: deps.engine.readRiverProjection(context, width, height, projectedRivers.riverMask),
          };
        } catch (error) {
          return {
            status: "unavailable" as const,
            reason: `Final river read failed: ${String(error).slice(0, 500)}`,
          };
        }
      })(),
    });
    for (const line of encodeBoundedJsonLogLines({
      prefix: "[SWOOPER_MOD]",
      marker: "FINAL_RIVER_PARITY_V1",
      payload: {
        mapSeed: context.setup.mapSeed,
        dimensions: { width, height },
        ...finalRiverParity,
      },
    })) console.log(line);

    // Recreate intent from immutable physics plus accepted lakes, never from an earlier engine
    // observation. Final numeric drift remains evidence while native preservation is calibrated.
    const intended = projectStandardElevation({
      elevation: topography.elevation,
      landMask: hydrography.exposedLandMask,
      seaLevel: topography.seaLevel,
      acceptedLakeMask: projectedLakes.lakeMask,
    });
    const elevationProjection = measureStandardElevationProjection({
      phase: "final",
      intended,
      snapshot: terminalSnapshot.elevation,
      acceptedLakeMask: projectedLakes.lakeMask,
      observedLakeMask: terminalSnapshot.lakeMask,
      observedSurface: {
        waterMask: terminalSnapshot.waterMask,
        terrain: terminalSnapshot.terrain,
        coastTerrain: CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_COAST,
      },
    });
    if (
      terminalSnapshot.elevation.source === "native" &&
      terminalSnapshot.elevation.status === "available"
    ) {
      for (const line of encodeBoundedJsonLogLines({
        marker: "[elevation-projection]",
        payload: {
          phase: "final",
          mapSeed: context.setup.mapSeed,
          dimensions: context.setup.dimensions,
          intended,
          observed: Array.from(terminalSnapshot.elevation.values),
          acceptedLakeMask: Array.from(projectedLakes.lakeMask),
          observedLakeMask: Array.from(terminalSnapshot.lakeMask),
          measurements: elevationProjection,
        },
      }))
        console.log(line);
    }

    return {
      engineObservation,
      waterDrift,
      placementParity,
      elevationProjection,
      finalRiverParity,
    };
  },
  metrics: ({ observation }) => ({
    "placement.parity": observation.placementParity,
    [STANDARD_ELEVATION_FINAL_METRIC_KEY]: observation.elevationProjection,
    [STANDARD_FINAL_RIVER_PARITY_METRIC_KEY]: observation.finalRiverParity,
  }),
  viz: ({ observation, dimensions }) => projectPlacementParityViz(observation, dimensions),
});
