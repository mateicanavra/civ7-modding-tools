import { createStep } from "@swooper/mapgen-core/authoring";
import type { VizProjection } from "@swooper/mapgen-viz";
import { defineStandardVizMeta } from "../../../../../viz.js";
import {
  assertWaterDriftWithinPolicy,
  landMaskFromWaterMask,
} from "../../../../../water-surface-parity.js";
import { config } from "./config.js";

const GROUP_MAP_ELEVATION = "Map / Elevation (Engine)";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

/**
 * Builds Civ7 elevation only after mountains, volcanoes, and accepted lakes,
 * then captures terrain readback for physics-to-engine parity checks.
 */
export const BuildElevationStep = createStep(config, {
  run: (context, _stepConfig, _ops, deps) => {
    const topography = deps.artifacts.topography.read();
    const { width, height } = context.setup.dimensions;

    const projectedWaterMask = deps.engine.readCurrentMapWaterMask(context);
    const expectedLandMask = landMaskFromWaterMask(projectedWaterMask);

    /**
     * Civ7 builds visual elevation from the terrain surface already in the engine.
     * We therefore run after static lake projection, matching Firaxis' map-script
     * lifecycle: coasts/continents/mountains/volcanoes, accepted lakes, elevation, rivers.
     * The expected water surface is observed immediately before elevation, after
     * lake projection has completed. Rejected lake intent therefore cannot become
     * false water expectation, and no stale engine snapshot crosses the step boundary.
     * If the engine no longer matches that projected land/water surface, this step
     * fails instead of restoring terrain after the fact; terrain restoration cannot
     * repair engine-owned cliff/elevation state.
     */
    deps.engine.recalculateAreas(context);
    deps.engine.buildElevation(context);
    deps.engine.recalculateAreas(context);

    const engineWaterMask = deps.engine.readCurrentMapWaterMask(context);
    const engineLandMask = landMaskFromWaterMask(engineWaterMask);
    assertWaterDriftWithinPolicy(
      context.setup.dimensions,
      context.trace,
      engineWaterMask,
      expectedLandMask,
      "map-elevation/build-elevation"
    );
    const driftMask = new Uint8Array(width * height);
    let mismatchCount = 0;
    for (let i = 0; i < driftMask.length; i++) {
      const mismatched = (expectedLandMask[i] ?? 0) !== (engineLandMask[i] ?? 0);
      if (mismatched) {
        driftMask[i] = 1;
        mismatchCount += 1;
      }
    }

    context.trace.event(() => ({
      type: "map.elevation.parity",
      step: "build-elevation",
      landMaskMismatchCount: mismatchCount,
      landMaskMismatchShare: Number((mismatchCount / (width * height)).toFixed(4)),
    }));

    return {
      physicsElevation: topography.elevation,
      expectedLandMask,
      engine: {
        landMask: engineLandMask,
        terrain: deps.engine.readCurrentMapTerrainTypes(context),
        elevation: deps.engine.readCurrentMapElevations(context),
      },
      driftMask,
    };
  },
  viz: ({ result, dimensions }) => {
    const projections: VizProjection[] = [
      {
        kind: "grid",
        dataTypeKey: "map.elevation.elevation",
        spaceId: TILE_SPACE_ID,
        dims: dimensions,
        field: { format: "i16", values: result.physicsElevation },
        meta: defineStandardVizMeta("map.elevation.elevation", "terrain.elevation", {
          label: "Elevation (Physics Truth)",
          group: GROUP_MAP_ELEVATION,
          role: "physics",
          visibility: "debug",
        }),
      },
      {
        kind: "grid",
        dataTypeKey: "map.elevation.landMask",
        spaceId: TILE_SPACE_ID,
        dims: dimensions,
        field: { format: "u8", values: result.expectedLandMask },
        meta: defineStandardVizMeta("map.elevation.landMask", "category.distinct", {
          label: "Land Mask (Projected Surface)",
          group: GROUP_MAP_ELEVATION,
          role: "physics",
          visibility: "debug",
        }),
      },
    ];
    projections.push(
      {
        kind: "grid",
        dataTypeKey: "map.elevation.elevation",
        spaceId: TILE_SPACE_ID,
        dims: dimensions,
        field: { format: "i16", values: result.engine.elevation },
        meta: defineStandardVizMeta("map.elevation.elevation", "terrain.elevation", {
          label: "Elevation (Engine)",
          group: GROUP_MAP_ELEVATION,
          role: "engine",
        }),
      },
      {
        kind: "grid",
        dataTypeKey: "map.elevation.landMask",
        spaceId: TILE_SPACE_ID,
        dims: dimensions,
        field: { format: "u8", values: result.engine.landMask },
        meta: defineStandardVizMeta("map.elevation.landMask", "category.distinct", {
          label: "Land Mask (Engine)",
          group: GROUP_MAP_ELEVATION,
          role: "engine",
          visibility: "debug",
        }),
      },
      {
        kind: "grid",
        dataTypeKey: "map.elevation.driftMask",
        spaceId: TILE_SPACE_ID,
        dims: dimensions,
        field: { format: "u8", values: result.driftMask },
        meta: defineStandardVizMeta("map.elevation.driftMask", "category.distinct", {
          label: "Land/Water Drift Mask",
          group: GROUP_MAP_ELEVATION,
          visibility: "debug",
        }),
      }
    );
    return projections;
  },
});
