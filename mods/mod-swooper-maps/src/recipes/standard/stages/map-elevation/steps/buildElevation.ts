import {
  COAST_TERRAIN,
  defineVizMeta,
  logElevationSummary,
  logLandmassAscii,
  snapshotEngineHeightfield,
} from "@swooper/mapgen-core";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import BuildElevationStepContract from "./buildElevation.contract.js";
import {
  assertNoWaterDrift,
  formatWaterDriftError,
  summarizeWaterDrift,
} from "../../../projection-policies/noWaterDrift.js";
import {
  CIV7_BUILD_ELEVATION_BOUNDARY_POLICY_V0,
  applyCiv7BuildElevationBoundaryPolicy,
} from "../../../projection-policies/elevationBoundaryClassification.js";
import { mapElevationArtifacts } from "../artifacts.js";

const GROUP_MAP_ELEVATION = "Map / Elevation (Engine)";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

export default createStep(BuildElevationStepContract, {
  artifacts: implementArtifacts([mapElevationArtifacts.elevationEngineTerrainSnapshot], {
    elevationEngineTerrainSnapshot: {},
  }),
  run: (context, _config, _ops, deps) => {
    const topography = deps.artifacts.topography.read(context);
    const mountains = deps.artifacts.mountains.read(context);
    const projectedLakes = deps.artifacts.engineProjectionLakes.read(context);
    const hydrologySnapshot = deps.artifacts.hydrologyLakesEngineTerrainSnapshot.read(context);
    const { width, height } = context.dimensions;

    const size = Math.max(0, (width | 0) * (height | 0));
    const expectedLandMask = new Uint8Array(topography.landMask);
    if (expectedLandMask.length !== size) {
      throw new Error(
        `[map-elevation/build-elevation] morphology landMask length ${expectedLandMask.length} does not match ${size}.`
      );
    }
    if (projectedLakes.lakeMask.length !== size) {
      throw new Error(
        `[map-elevation/build-elevation] lake projection mask length ${projectedLakes.lakeMask.length} does not match ${size}.`
      );
    }
    if (
      mountains.mountainMask.length !== size ||
      mountains.mountainRegionMask.length !== size ||
      mountains.hillMask.length !== size
    ) {
      throw new Error(`[map-elevation/build-elevation] mountain masks must all match ${size}.`);
    }
    if (hydrologySnapshot.landMask.length !== size) {
      throw new Error(
        `[map-elevation/build-elevation] hydrology engine landMask length ${hydrologySnapshot.landMask.length} does not match ${size}.`
      );
    }
    for (let idx = 0; idx < size; idx++) {
      if (projectedLakes.lakeMask[idx] === 1) expectedLandMask[idx] = 0;
    }
    let hydrologyBoundaryMismatchCount = 0;
    for (let idx = 0; idx < size; idx++) {
      if ((hydrologySnapshot.landMask[idx] ?? 0) !== (expectedLandMask[idx] ?? 0)) {
        hydrologyBoundaryMismatchCount += 1;
      }
    }
    if (hydrologyBoundaryMismatchCount > 0) {
      context.trace.event(() => ({
        type: "map.elevation.hydrologyBoundaryDrift",
        step: "build-elevation",
        landMaskMismatchCount: hydrologyBoundaryMismatchCount,
        landMaskMismatchShare: Number((hydrologyBoundaryMismatchCount / Math.max(1, size)).toFixed(4)),
      }));
    }

    const boundaryPolicy = applyCiv7BuildElevationBoundaryPolicy({
      width,
      height,
      landMask: expectedLandMask,
      mountainMask: mountains.mountainMask,
      mountainRegionMask: mountains.mountainRegionMask,
      hillMask: mountains.hillMask,
      elevation: topography.elevation,
      seaLevel: topography.seaLevel,
    });
    for (let idx = 0; idx < size; idx++) {
      if (boundaryPolicy.policyCoastMask[idx] !== 1) continue;
      const y = (idx / width) | 0;
      const x = idx - y * width;
      context.adapter.setTerrainType(x, y, COAST_TERRAIN);
    }
    expectedLandMask.set(boundaryPolicy.landMask);
    context.trace.event(() => ({
      type: "map.elevation.boundaryPolicy",
      policy: "civ7.buildElevationBoundary.v0",
      polarWaterRows: boundaryPolicy.polarWaterRows,
      saddleElevationCeiling: boundaryPolicy.saddleElevationCeiling,
      promotedLandToCoast: boundaryPolicy.promotedLandToCoast,
      source: CIV7_BUILD_ELEVATION_BOUNDARY_POLICY_V0.source,
    }));

    /**
     * Civ7 builds visual elevation from the terrain surface already in the engine.
     * We therefore run after static lake projection, matching Firaxis' map-script
     * lifecycle: coasts/continents/mountains/volcanoes, accepted lakes, elevation, rivers.
     * The expected land/water surface remains MapGen-owned: Morphology land plus
     * accepted Hydrology lake projection plus static Civ7 build-elevation boundary
     * policies. The adjacent engine snapshot is diagnostic evidence only; it must
     * not redefine terrain truth. If the engine surface differs before or after
     * buildElevation, this step fails instead of letting downstream stages inherit
     * hidden terrain drift.
     */
    assertNoWaterDrift(context, expectedLandMask, "map-elevation/build-elevation:pre");
    context.adapter.recalculateAreas();
    context.adapter.buildElevation();
    context.adapter.recalculateAreas();
    const postElevationDrift = summarizeWaterDrift(context, expectedLandMask, "map-elevation/build-elevation");
    if (postElevationDrift.driftCount > 0) {
      context.trace.event(() => ({
        type: "map.elevation.postBuildWaterDrift",
        step: "build-elevation",
        driftCount: postElevationDrift.driftCount,
        expectedLandButWater: postElevationDrift.expectedLandButWater,
        expectedWaterButLand: postElevationDrift.expectedWaterButLand,
        examples: postElevationDrift.examples,
      }));
      throw new Error(formatWaterDriftError("map-elevation/build-elevation:post", postElevationDrift));
    }

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
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "map.elevation.boundaryPolicyCoastMask",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: boundaryPolicy.policyCoastMask,
      meta: defineVizMeta("map.elevation.boundaryPolicyCoastMask", {
        label: "Boundary Policy Coast Mask",
        group: GROUP_MAP_ELEVATION,
        description:
          "Land tiles preprojected to coast by MapGen's static Civ7 build-elevation compliance policy.",
        role: "membership",
        palette: "categorical",
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
        expectedLandButWater: postElevationDrift.expectedLandButWater,
        expectedWaterButLand: postElevationDrift.expectedWaterButLand,
        examples: postElevationDrift.examples,
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

    logElevationSummary(context.trace, context.adapter, width, height, "map-elevation/build-elevation");
    logLandmassAscii(context.trace, context.adapter, width, height);
  },
});
