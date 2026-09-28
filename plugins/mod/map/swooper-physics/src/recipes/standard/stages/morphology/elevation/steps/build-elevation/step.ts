import { CIV7_BROWSER_TABLES_V0 } from "@civ7/map-policy";
import { createStep } from "@swooper/mapgen-core/authoring";
import { encodeBoundedJsonLogLines } from "@swooper/mapgen-core/lib/log";
import type { VizProjection } from "@swooper/mapgen-viz";
import { projectStandardElevation } from "../../../../../elevation-projection.js";
import {
  measureStandardElevationProjection,
  STANDARD_ELEVATION_POST_WRITE_METRIC_KEY,
} from "../../../../../metrics/families/elevation-projection.js";
import { defineStandardVizMeta } from "../../../../../viz.js";
import {
  assertAcceptedLakeFootprint,
  assertWaterDriftWithinPolicy,
  landMaskFromWaterMask,
} from "../../../../../water-surface-parity.js";
import { config } from "./config.js";

const GROUP_MAP_ELEVATION = "Map / Elevation (Engine)";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

/**
 * Projects physical heights after accepted lakes, then observes the native numeric and water
 * surfaces without replacing Morphology truth or treating mock storage as native proof.
 */
export const BuildElevationStep = createStep(config, {
  run: (context, _stepConfig, _ops, deps) => {
    const topography = deps.artifacts.topography.read();
    const projectedLakes = deps.artifacts.projectedLakes.read();
    const certifiedLakes = deps.artifacts.lakePlan.read().model === "certified-sill-spill";
    const { width, height } = context.setup.dimensions;

    const expectedLandMask = Uint8Array.from(topography.landMask);
    for (let index = 0; index < expectedLandMask.length; index += 1) {
      if (projectedLakes.lakeMask[index] === 1) expectedLandMask[index] = 0;
    }
    const projectedWaterMask = deps.engine.readCurrentMapWaterMask(context);
    if (certifiedLakes) {
      assertAcceptedLakeFootprint(
        context.setup.dimensions, projectedLakes.lakeMask, projectedWaterMask,
        deps.engine.readCurrentMapTerrainTypes(context), "map-elevation/build-elevation/pre-build"
      );
    }
    assertWaterDriftWithinPolicy(
      context.setup.dimensions,
      context.trace,
      projectedWaterMask,
      expectedLandMask,
      "map-elevation/build-elevation/pre-build"
    );

    const intended = projectStandardElevation({
      elevation: topography.elevation,
      landMask: topography.landMask,
      seaLevel: topography.seaLevel,
      acceptedLakeMask: projectedLakes.lakeMask,
    });
    // Legacy cliffs consume this numeric write here. Certified cliffs wait for finalized
    // NAV terrain in PlotRivers; neither path calls stock buildElevation over authored heights.
    deps.engine.recalculateAreas(context);
    const beforeWaterMask = deps.engine.readCurrentMapWaterMask(context);
    const beforeLakeMask = deps.engine.readCurrentMapLakeMask(context);
    const beforeTerrain = deps.engine.readCurrentMapTerrainTypes(context);
    if (certifiedLakes) {
      assertAcceptedLakeFootprint(
        context.setup.dimensions, projectedLakes.lakeMask, beforeWaterMask, beforeTerrain,
        "map-elevation/build-elevation/pre-write-area"
      );
    }
    deps.engine.setElevation(context, intended);
    if (!certifiedLakes) deps.engine.generateCliffsFromElevation(context);
    deps.engine.recalculateAreas(context);

    const snapshot = deps.engine.readCurrentMapElevationSnapshot(context);
    const engineWaterMask = deps.engine.readCurrentMapWaterMask(context);
    const engineLakeMask = deps.engine.readCurrentMapLakeMask(context);
    const engineTerrain = deps.engine.readCurrentMapTerrainTypes(context);
    if (certifiedLakes) {
      assertAcceptedLakeFootprint(
        context.setup.dimensions, projectedLakes.lakeMask, engineWaterMask, engineTerrain,
        "map-elevation/build-elevation/post-build"
      );
    }
    if (snapshot.width !== width || snapshot.height !== height) {
      throw new Error("Elevation projection readback dimensions differ from the current map.");
    }
    const elevationProjection = measureStandardElevationProjection({
      phase: "post-write",
      intended,
      snapshot,
      acceptedLakeMask: projectedLakes.lakeMask,
      observedLakeMask: engineLakeMask,
      observedSurface: {
        waterMask: engineWaterMask,
        terrain: engineTerrain,
        coastTerrain: CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_COAST,
      },
    });
    if (snapshot.source === "native" && snapshot.status === "available") {
      for (const line of encodeBoundedJsonLogLines({
        marker: "[elevation-projection]",
        payload: {
          phase: "post-write",
          mapSeed: context.setup.mapSeed,
          dimensions: context.setup.dimensions,
          intended,
          observed: Array.from(snapshot.values),
          acceptedLakeMask: Array.from(projectedLakes.lakeMask),
          observedLakeMask: Array.from(engineLakeMask),
          measurements: elevationProjection,
        },
      }))
        console.log(line);
    }
    if (snapshot.status === "unavailable" || elevationProjection.status === "unavailable") {
      throw new Error(
        "Elevation projection requires available exact numeric readback after writing."
      );
    }
    if (elevationProjection.nonLakeMismatchCount > 0) {
      throw new Error(
        `Elevation projection has ${elevationProjection.nonLakeMismatchCount} non-lake numeric mismatches after writing.`
      );
    }
    for (let plotIndex = 0; plotIndex < intended.length; plotIndex += 1) {
      if (intended[plotIndex] === snapshot.values[plotIndex]) continue;
      // Accepted inland water may be native lake or coast water. The immutable footprint
      // alone grants no exception: require stable local water, COAST and native class.
      if (projectedLakes.lakeMask[plotIndex] === 1) {
        if (
          topography.landMask[plotIndex] !== 1 ||
          beforeWaterMask[plotIndex] !== 1 || engineWaterMask[plotIndex] !== 1 ||
          beforeTerrain[plotIndex] !== CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_COAST ||
          engineTerrain[plotIndex] !== CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_COAST ||
          beforeLakeMask[plotIndex] !== engineLakeMask[plotIndex]
        ) {
          throw new Error(
            `Elevation projection has an unqualified accepted inland-water numeric mismatch at plot ${plotIndex} after writing.`
          );
        }
        continue;
      }
      // Outside that footprint, only preexisting native lakes on original water qualify.
      if (
        topography.landMask[plotIndex] !== 0 ||
        beforeWaterMask[plotIndex] !== 1 ||
        beforeLakeMask[plotIndex] !== 1 ||
        engineLakeMask[plotIndex] !== 1 ||
        engineWaterMask[plotIndex] !== 1 ||
        beforeTerrain[plotIndex] !== engineTerrain[plotIndex]
      ) {
        throw new Error(
          `Elevation projection has an unqualified unplanned native-lake numeric mismatch at plot ${plotIndex} after writing.`
        );
      }
    }

    const engineLandMask = landMaskFromWaterMask(engineWaterMask);
    assertWaterDriftWithinPolicy(
      context.setup.dimensions,
      context.trace,
      engineWaterMask,
      expectedLandMask,
      "map-elevation/build-elevation/post-build"
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
      intended,
      elevationProjection,
      expectedLandMask,
      engine: {
        landMask: engineLandMask,
        terrain: engineTerrain,
        elevation: snapshot.values,
      },
      driftMask,
    };
  },
  metrics: ({ observation }) => ({
    [STANDARD_ELEVATION_POST_WRITE_METRIC_KEY]: observation.elevationProjection,
  }),
  viz: ({ observation, dimensions }) => {
    const projections: VizProjection[] = [
      {
        kind: "grid",
        dataTypeKey: "map.elevation.elevation",
        spaceId: TILE_SPACE_ID,
        dims: dimensions,
        field: { format: "i16", values: observation.physicsElevation },
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
        field: { format: "u8", values: observation.expectedLandMask },
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
        field: { format: "f32", values: Float32Array.from(observation.engine.elevation) },
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
        field: { format: "u8", values: observation.engine.landMask },
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
        field: { format: "u8", values: observation.driftMask },
        meta: defineStandardVizMeta("map.elevation.driftMask", "category.distinct", {
          label: "Land/Water Drift Mask",
          group: GROUP_MAP_ELEVATION,
          visibility: "debug",
        }),
      }
    );
    projections.push({
      kind: "grid",
      dataTypeKey: "map.elevation.nativeIntent",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "f32", values: Float32Array.from(observation.intended) },
      meta: defineStandardVizMeta("map.elevation.nativeIntent", "terrain.elevation", {
        label: "Elevation (Native Intent)",
        group: GROUP_MAP_ELEVATION,
        visibility: "debug",
      }),
    });
    return projections;
  },
});
