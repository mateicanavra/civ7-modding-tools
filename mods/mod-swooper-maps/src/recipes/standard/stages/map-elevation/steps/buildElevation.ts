import {
  defineVizMeta,
  logElevationSummary,
  logLandmassAscii,
  snapshotEngineHeightfield,
} from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { assertWaterDriftWithinPolicy } from "../../../projection-policies/noWaterDrift.js";
import BuildElevationStepContract from "./buildElevation.contract.js";

const GROUP_MAP_ELEVATION = "Map / Elevation (Engine)";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

/**
 * Builds Civ7 elevation only after mountains, volcanoes, and accepted lakes,
 * then captures terrain readback for physics-to-engine parity checks.
 */
export default createStep(BuildElevationStepContract, {
  run: (context, _config, _ops, deps) => {
    const topography = deps.artifacts.topography.read(context);
    const projectedLakes = deps.artifacts.engineProjectionLakes.read(context);
    const { width, height } = context.dimensions;

    const size = Math.max(0, (width | 0) * (height | 0));
    const expectedLandMask = new Uint8Array(topography.landMask);
    for (let idx = 0; idx < size; idx++) {
      if (projectedLakes.lakeMask[idx] === 1) expectedLandMask[idx] = 0;
    }

    /**
     * Civ7 builds visual elevation from the terrain surface already in the engine.
     * We therefore run after static lake projection, matching Firaxis' map-script
     * lifecycle: coasts/continents/mountains/volcanoes, accepted lakes, elevation, rivers.
     * The expected water surface comes from map-hydrology readback, not raw lake
     * intent, because rejected lake tiles cannot be treated as engine water.
     * If the engine no longer matches that projected land/water surface, this step
     * fails instead of restoring terrain after the fact; terrain restoration cannot
     * repair engine-owned cliff/elevation state.
     */
    context.adapter.recalculateAreas();
    context.adapter.buildElevation();
    context.adapter.recalculateAreas();
    assertWaterDriftWithinPolicy(context, expectedLandMask, "map-elevation/build-elevation");

    const physics = context.buffers.heightfield;
    const engine = snapshotEngineHeightfield(context);
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "map.elevation.elevation",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "i16",
      values: physics.elevation,
      meta: defineVizMeta("map.elevation.elevation", {
        label: "Elevation (Physics Truth)",
        group: GROUP_MAP_ELEVATION,
        role: "physics",
        visibility: "debug",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "map.elevation.landMask",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: expectedLandMask,
      meta: defineVizMeta("map.elevation.landMask", {
        label: "Land Mask (Projected Surface)",
        group: GROUP_MAP_ELEVATION,
        palette: "categorical",
        role: "physics",
        visibility: "debug",
      }),
    });
    if (engine) {
      const driftMask = new Uint8Array(width * height);
      let mismatchCount = 0;
      for (let i = 0; i < driftMask.length; i++) {
        const mismatched = (expectedLandMask[i] ?? 0) !== (engine.landMask[i] ?? 0);
        if (mismatched) {
          driftMask[i] = 1;
          mismatchCount += 1;
        }
      }

      deps.artifacts.elevationEngineTerrainSnapshot.publish(context, {
        stage: "map-elevation/build-elevation",
        width,
        height,
        landMask: engine.landMask,
        terrain: engine.terrain,
        elevation: engine.elevation,
      });

      context.trace.event(() => ({
        type: "map.elevation.parity",
        step: "build-elevation",
        landMaskMismatchCount: mismatchCount,
        landMaskMismatchShare: Number((mismatchCount / Math.max(1, width * height)).toFixed(4)),
      }));

      context.viz?.dumpGrid(context.trace, {
        dataTypeKey: "map.elevation.elevation",
        spaceId: TILE_SPACE_ID,
        dims: { width, height },
        format: "i16",
        values: engine.elevation,
        meta: defineVizMeta("map.elevation.elevation", {
          label: "Elevation (Engine)",
          group: GROUP_MAP_ELEVATION,
          role: "engine",
        }),
      });
      context.viz?.dumpGrid(context.trace, {
        dataTypeKey: "map.elevation.landMask",
        spaceId: TILE_SPACE_ID,
        dims: { width, height },
        format: "u8",
        values: engine.landMask,
        meta: defineVizMeta("map.elevation.landMask", {
          label: "Land Mask (Engine)",
          group: GROUP_MAP_ELEVATION,
          palette: "categorical",
          role: "engine",
          visibility: "debug",
        }),
      });

      context.viz?.dumpGrid(context.trace, {
        dataTypeKey: "map.elevation.driftMask",
        spaceId: TILE_SPACE_ID,
        dims: { width, height },
        format: "u8",
        values: driftMask,
        meta: defineVizMeta("map.elevation.driftMask", {
          label: "Land/Water Drift Mask",
          group: GROUP_MAP_ELEVATION,
          palette: "categorical",
          visibility: "debug",
        }),
      });
    }

    logElevationSummary(
      context.trace,
      context.adapter,
      width,
      height,
      "map-elevation/build-elevation"
    );
    logLandmassAscii(context.trace, context.adapter, width, height);
  },
});
