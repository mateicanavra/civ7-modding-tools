import {
  HILL_TERRAIN,
  MOUNTAIN_TERRAIN,
  NAVIGABLE_RIVER_TERRAIN,
  defineVizMeta,
  snapshotEngineHeightfield,
} from "@swooper/mapgen-core";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import { clampInt } from "@swooper/mapgen-core/lib/math";
import PlotRiversStepContract from "./plotRivers.contract.js";
import { HYDROLOGY_RIVER_DENSITY_LENGTH_BOUNDS } from "@mapgen/domain/hydrology/config.js";
import type { HydrologyRiverDensityKnob } from "@mapgen/domain/hydrology/config.js";
import { mapRiversArtifacts } from "../artifacts.js";
import { materializeNavigableRiverMask } from "../../../projection-policies/navigableRiverMaterialization.js";

const GROUP_MAP_RIVERS = "Map / Rivers (Engine)";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

export default createStep(PlotRiversStepContract, {
  artifacts: implementArtifacts(
    [
      mapRiversArtifacts.projectedNavigableRivers,
      mapRiversArtifacts.engineProjectionRivers,
      mapRiversArtifacts.riversEngineTerrainSnapshot,
    ],
    {
      projectedNavigableRivers: {},
      engineProjectionRivers: {},
      riversEngineTerrainSnapshot: {},
    }
  ),
  normalize: (config, ctx) => {
    const { riverDensity = "normal" as HydrologyRiverDensityKnob } = ctx.knobs as {
      riverDensity?: HydrologyRiverDensityKnob;
    };
    const normalBounds = HYDROLOGY_RIVER_DENSITY_LENGTH_BOUNDS.normal;
    const bounds = HYDROLOGY_RIVER_DENSITY_LENGTH_BOUNDS[riverDensity];
    const minLengthDelta = bounds.minLength - normalBounds.minLength;
    const maxLengthDelta = bounds.maxLength - normalBounds.maxLength;

    const minLength = clampInt(config.minLength + minLengthDelta, 1, 40);
    let maxLength = clampInt(config.maxLength + maxLengthDelta, 1, 80);
    if (maxLength < minLength) maxLength = minLength;

    return {
      ...config,
      minLength,
      maxLength,
    };
  },
  run: (context, config, _ops, deps) => {
    const hydrography = deps.artifacts.hydrography.read(context);
    const { width, height } = context.dimensions;

    // Map-stage visualization: hydrology river fields are inputs to engine river modeling (not 1:1 with engine results).
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "map.rivers.riverClass",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "u8",
      values: hydrography.riverClass,
      meta: defineVizMeta("map.rivers.riverClass", {
        label: "River Class (Hydrology)",
        group: GROUP_MAP_RIVERS,
        palette: "categorical",
      }),
    });
    context.viz?.dumpGrid(context.trace, {
      dataTypeKey: "map.rivers.discharge",
      spaceId: TILE_SPACE_ID,
      dims: { width, height },
      format: "f32",
      values: hydrography.discharge,
      meta: defineVizMeta("map.rivers.discharge", {
        label: "River Discharge (Hydrology)",
        group: GROUP_MAP_RIVERS,
        visibility: "debug",
      }),
    });

    const logStats = (label: string) => {
      if (!context.trace.isVerbose) return;
      let flat = 0,
        hill = 0,
        mtn = 0,
        water = 0;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (context.adapter.isWater(x, y)) {
            water++;
            continue;
          }
          const t = context.adapter.getTerrainType(x, y);
          if (t === MOUNTAIN_TERRAIN) mtn++;
          else if (t === HILL_TERRAIN) hill++;
          else flat++;
        }
      }
      const total = width * height;
      const land = Math.max(1, flat + hill + mtn);
      context.trace.event(() => ({
        type: "rivers.terrainStats",
        label,
        totals: {
          land,
          water,
          landShare: Number(((land / total) * 100).toFixed(1)),
        },
        shares: {
          mountains: Number(((mtn / land) * 100).toFixed(1)),
          hills: Number(((hill / land) * 100).toFixed(1)),
          flat: Number(((flat / land) * 100).toFixed(1)),
        },
      }));
    };

    const size = width * height;
    const projectableLandMask = new Uint8Array(size);
    let landTileCount = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (context.adapter.isWater(x, y)) continue;
        landTileCount += 1;
        if (context.adapter.getTerrainType(x, y) === MOUNTAIN_TERRAIN) continue;
        projectableLandMask[idx] = 1;
      }
    }

    const materialized = materializeNavigableRiverMask({
      width,
      height,
      riverClass: hydrography.riverClass,
      discharge: hydrography.discharge,
      flowDir: hydrography.flowDir,
      projectableLandMask,
      minLength: config.minLength,
      maxLength: config.maxLength,
      targetTileCount: Math.round(landTileCount / (config.minLength + 2 * config.maxLength)),
    });

    deps.artifacts.projectedNavigableRivers.publish(context, {
      width,
      height,
      riverMask: materialized.riverMask,
      selectedTileCount: materialized.selectedTileCount,
      eligibleTileCount: materialized.eligibleTileCount,
      candidateEndpointCount: materialized.candidateEndpointCount,
      selectedChainCount: materialized.selectedChainCount,
      targetTileCount: materialized.targetTileCount,
      minLength: materialized.minLength,
      maxLength: materialized.maxLength,
    });

    context.trace.event(() => ({
      type: "map.rivers.materialization",
      policy: "mapgen.navigableRiverMaterialization.v0",
      selectedTileCount: materialized.selectedTileCount,
      targetTileCount: materialized.targetTileCount,
      selectedChainCount: materialized.selectedChainCount,
      candidateEndpointCount: materialized.candidateEndpointCount,
      eligibleTileCount: materialized.eligibleTileCount,
      minLength: materialized.minLength,
      maxLength: materialized.maxLength,
    }));

    logStats("PRE-RIVERS");
    for (let i = 0; i < size; i++) {
      if (materialized.riverMask[i] !== 1) continue;
      context.adapter.setTerrainType(i % width, Math.floor(i / width), NAVIGABLE_RIVER_TERRAIN);
    }
    logStats("POST-STAMP-RIVERS");
    context.adapter.validateAndFixTerrain();
    logStats("POST-VALIDATE");
    context.adapter.defineNamedRivers();

    // River modeling and validation can rewrite terrain after elevation. Refresh
    // area and water caches here so ecology and placement read the final engine
    // topology rather than the pre-river projection surface.
    context.adapter.recalculateAreas();
    context.adapter.storeWaterData();

    const physics = context.buffers.heightfield;
    const engine = snapshotEngineHeightfield(context);
    if (engine) {
      const lakeMask = new Uint8Array(size);
      const riverMask = new Uint8Array(size);
      const riverMismatchMask = new Uint8Array(size);
      let riverMismatchCount = 0;
      let selectedRiverRejectedCount = 0;
      let extraEngineRiverCount = 0;
      for (let i = 0; i < size; i++) {
        const terrain = engine.terrain[i] ?? 0;
        const isRiver = terrain === NAVIGABLE_RIVER_TERRAIN;
        const isWater = (engine.landMask[i] ?? 1) === 0;
        if (isRiver) riverMask[i] = 1;
        if (isWater) lakeMask[i] = 1;
        if ((materialized.riverMask[i] ?? 0) !== (isRiver ? 1 : 0)) {
          riverMismatchMask[i] = 1;
          riverMismatchCount += 1;
          if ((materialized.riverMask[i] ?? 0) === 1) selectedRiverRejectedCount += 1;
          else extraEngineRiverCount += 1;
        }
      }

      const sinkMismatchCount = lakeMask.reduce((acc, _v, idx) => {
        if ((hydrography.sinkMask[idx] ?? 0) === 1 && lakeMask[idx] === 0) return acc + 1;
        return acc;
      }, 0);

      deps.artifacts.engineProjectionRivers.publish(context, {
        width,
        height,
        lakeMask,
        riverMask,
        sinkMismatchCount,
        riverMismatchCount,
        selectedRiverRejectedCount,
        extraEngineRiverCount,
      });

      deps.artifacts.riversEngineTerrainSnapshot.publish(context, {
        stage: "map-rivers/plot-rivers",
        width,
        height,
        landMask: engine.landMask,
        terrain: engine.terrain,
        elevation: engine.elevation,
      });

      context.trace.event(() => ({
        type: "map.rivers.parity",
        riverMismatchCount,
        selectedRiverRejectedCount,
        extraEngineRiverCount,
        riverMismatchShare: Number((riverMismatchCount / Math.max(1, width * height)).toFixed(4)),
      }));

      context.viz?.dumpGrid(context.trace, {
        dataTypeKey: "map.rivers.projectedRiverMask",
        spaceId: TILE_SPACE_ID,
        dims: { width, height },
        format: "u8",
        values: materialized.riverMask,
        meta: defineVizMeta("map.rivers.projectedRiverMask", {
          label: "Navigable River Mask (Projected)",
          group: GROUP_MAP_RIVERS,
          palette: "categorical",
          role: "engine",
        }),
      });
      context.viz?.dumpGrid(context.trace, {
        dataTypeKey: "map.rivers.engineRiverMask",
        spaceId: TILE_SPACE_ID,
        dims: { width, height },
        format: "u8",
        values: riverMask,
        meta: defineVizMeta("map.rivers.engineRiverMask", {
          label: "Navigable River Mask (Engine)",
          group: GROUP_MAP_RIVERS,
          palette: "categorical",
          role: "engine",
        }),
      });
      context.viz?.dumpGrid(context.trace, {
        dataTypeKey: "map.rivers.riverMismatchMask",
        spaceId: TILE_SPACE_ID,
        dims: { width, height },
        format: "u8",
        values: riverMismatchMask,
        meta: defineVizMeta("map.rivers.riverMismatchMask", {
          label: "River Mismatch Mask",
          group: GROUP_MAP_RIVERS,
          palette: "categorical",
          visibility: "debug",
        }),
      });

      context.viz?.dumpGrid(context.trace, {
        dataTypeKey: "debug.heightfield.landMask",
        spaceId: TILE_SPACE_ID,
        dims: { width, height },
        format: "u8",
        values: physics.landMask,
        meta: defineVizMeta("debug.heightfield.landMask", {
          label: "Land Mask (Physics Truth)",
          group: GROUP_MAP_RIVERS,
          palette: "categorical",
          role: "physics",
          visibility: "debug",
        }),
      });
      context.viz?.dumpGrid(context.trace, {
        dataTypeKey: "debug.heightfield.landMask",
        spaceId: TILE_SPACE_ID,
        dims: { width, height },
        format: "u8",
        values: engine.landMask,
        meta: defineVizMeta("debug.heightfield.landMask", {
          label: "Land Mask (Engine After Rivers)",
          group: GROUP_MAP_RIVERS,
          palette: "categorical",
          role: "engine",
          visibility: "debug",
        }),
      });
    }
  },
});
