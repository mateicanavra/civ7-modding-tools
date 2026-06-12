import {
  HILL_TERRAIN,
  MOUNTAIN_TERRAIN,
  NAVIGABLE_RIVER_TERRAIN,
  defineVizMeta,
  snapshotEngineHeightfield,
} from "@swooper/mapgen-core";
import { CIV7_DEFAULT_RIVER_MODELING_ARGS } from "@civ7/map-policy";
import {
  HYDROLOGY_FLOW_INTERMITTENT,
  HYDROLOGY_FLOW_PERENNIAL,
  HYDROLOGY_MOUTH_CLOSED_BASIN,
  HYDROLOGY_MOUTH_OCEAN,
  HYDROLOGY_MOUTH_SPILL_PATH,
} from "@mapgen/domain/hydrology/river-network-metrics.js";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import PlotRiversStepContract from "./plotRivers.contract.js";
import { mapRiversArtifacts } from "../artifacts.js";

const GROUP_MAP_RIVERS = "Map / Rivers (Engine)";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

type ProjectionSignalStatus =
  | "normal-signal"
  | "arid-low-signal"
  | "closed-basin-low-signal"
  | "terrain-constrained-low-signal";

function classifyProjectionSignal(input: {
  plannedMajorRiverTileCount: number;
  eligibleTileCount: number;
  selectedChainCount: number;
  longestSelectedChainLength: number;
  selectedEligibleMajorTileFraction: number;
  majorDurableTileCount: number;
  majorPerennialTileCount: number;
  majorClosedBasinTileCount: number;
  majorOceanMouthTileCount: number;
  nonProjectableMajorTileCount: number;
}): { status: ProjectionSignalStatus; reason: string } {
  const {
    plannedMajorRiverTileCount,
    eligibleTileCount,
    selectedChainCount,
    longestSelectedChainLength,
    selectedEligibleMajorTileFraction,
    majorDurableTileCount,
    majorPerennialTileCount,
    majorClosedBasinTileCount,
    majorOceanMouthTileCount,
    nonProjectableMajorTileCount,
  } = input;

  if (plannedMajorRiverTileCount === 0) {
    if (majorClosedBasinTileCount > 0 && majorOceanMouthTileCount === 0) {
      return {
        status: "closed-basin-low-signal",
        reason:
          "Hydrology major-river truth is dominated by closed-basin termini, so low visible navigable projection is expected.",
      };
    }
    return {
      status: "arid-low-signal",
      reason:
        "Hydrology major-river truth has low durable/perennial support at this map scale, so few visible navigable trunks are expected.",
    };
  }

  if (
    plannedMajorRiverTileCount < 32 &&
    selectedEligibleMajorTileFraction <= 0.3 &&
    longestSelectedChainLength <= 4
  ) {
    return {
      status: "arid-low-signal",
      reason:
        "Hydrology major-river truth exists, but the projected navigable subset stays sparse and short at this compact arid scale.",
    };
  }

  if (
    eligibleTileCount <= Math.max(1, Math.floor(plannedMajorRiverTileCount * 0.35)) &&
    nonProjectableMajorTileCount > eligibleTileCount &&
    selectedChainCount <= 2
  ) {
    return {
      status: "terrain-constrained-low-signal",
      reason:
        "Engine terrain/materialization constraints block most major-river truth from navigable projection on this run.",
    };
  }

  if (majorPerennialTileCount === 0 && plannedMajorRiverTileCount < 48) {
    return {
      status: "arid-low-signal",
      reason:
        "Hydrology major-river truth is present, but it remains non-perennial at this scale so visible navigable coverage is legitimately sparse.",
    };
  }

  return {
    status: "normal-signal",
    reason: "Hydrology major-river truth provides a normal Earthlike navigable-river signal.",
  };
}

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
  run: (context, config, ops, deps) => {
    const hydrography = deps.artifacts.hydrography.read(context);
    const riverNetworkMetrics = deps.artifacts.riverNetworkMetrics.read(context);
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
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (context.adapter.isWater(x, y)) continue;
        if (context.adapter.getTerrainType(x, y) === MOUNTAIN_TERRAIN) continue;
        projectableLandMask[idx] = 1;
      }
    }

    const materialized = ops.selectNavigableRiverTerrain(
      {
        width,
        height,
        riverClass: hydrography.riverClass,
        discharge: hydrography.discharge,
        flowDir: hydrography.flowDir,
        projectableLandMask,
      },
      config.selectNavigableRiverTerrain
    );

    let majorDurableTileCount = 0;
    let majorPerennialTileCount = 0;
    let majorClosedBasinTileCount = 0;
    let majorOceanMouthTileCount = 0;
    for (let i = 0; i < size; i++) {
      if (materialized.plannedMajorRiverMask[i] !== 1) continue;
      const permanence = riverNetworkMetrics.flowPermanenceProxy[i] ?? 0;
      if (permanence >= HYDROLOGY_FLOW_INTERMITTENT) majorDurableTileCount += 1;
      if (permanence >= HYDROLOGY_FLOW_PERENNIAL) majorPerennialTileCount += 1;
      const mouthType = riverNetworkMetrics.mouthType[i] ?? 0;
      if (mouthType === HYDROLOGY_MOUTH_CLOSED_BASIN) majorClosedBasinTileCount += 1;
      if (mouthType === HYDROLOGY_MOUTH_OCEAN || mouthType === HYDROLOGY_MOUTH_SPILL_PATH) {
        majorOceanMouthTileCount += 1;
      }
    }

    const selectedEligibleMajorTileFraction =
      materialized.eligibleTileCount === 0
        ? 0
        : materialized.selectedTileCount / materialized.eligibleTileCount;
    const projectionSignal = classifyProjectionSignal({
      plannedMajorRiverTileCount: materialized.plannedMajorRiverTileCount,
      eligibleTileCount: materialized.eligibleTileCount,
      selectedChainCount: materialized.selectedChainCount,
      longestSelectedChainLength: materialized.longestSelectedChainLength,
      selectedEligibleMajorTileFraction,
      majorDurableTileCount,
      majorPerennialTileCount,
      majorClosedBasinTileCount,
      majorOceanMouthTileCount,
      nonProjectableMajorTileCount: materialized.nonProjectableMajorTileCount,
    });

    deps.artifacts.projectedNavigableRivers.publish(context, {
      width,
      height,
      riverMask: materialized.riverMask,
      plannedMinorRiverMask: materialized.plannedMinorRiverMask,
      plannedMajorRiverMask: materialized.plannedMajorRiverMask,
      selectedTileCount: materialized.selectedTileCount,
      eligibleTileCount: materialized.eligibleTileCount,
      plannedMinorRiverTileCount: materialized.plannedMinorRiverTileCount,
      plannedMajorRiverTileCount: materialized.plannedMajorRiverTileCount,
      candidateEndpointCount: materialized.candidateEndpointCount,
      selectedChainCount: materialized.selectedChainCount,
      selectedChainLengths: materialized.selectedChainLengths,
      longestSelectedChainLength: materialized.longestSelectedChainLength,
      meanSelectedChainLength: materialized.meanSelectedChainLength,
      targetTileCount: materialized.targetTileCount,
      targetMajorTileFraction: materialized.targetMajorTileFraction,
      selectedEndpointDischargeFloor: materialized.selectedEndpointDischargeFloor,
      nonProjectableMajorTileCount: materialized.nonProjectableMajorTileCount,
      unselectedEligibleMajorTileCount: materialized.unselectedEligibleMajorTileCount,
      selectedEligibleMajorTileFraction,
      majorDurableTileCount,
      majorPerennialTileCount,
      majorClosedBasinTileCount,
      majorOceanMouthTileCount,
      projectionSignalStatus: projectionSignal.status,
      projectionSignalReason: projectionSignal.reason,
    });

    context.trace.event(() => ({
      type: "map.rivers.materialization",
      policy: "hydrology.selectNavigableRiverTerrain.v0",
      selectedTileCount: materialized.selectedTileCount,
      targetTileCount: materialized.targetTileCount,
      selectedChainCount: materialized.selectedChainCount,
      candidateEndpointCount: materialized.candidateEndpointCount,
      eligibleTileCount: materialized.eligibleTileCount,
      plannedMinorRiverTileCount: materialized.plannedMinorRiverTileCount,
      plannedMajorRiverTileCount: materialized.plannedMajorRiverTileCount,
      targetMajorTileFraction: materialized.targetMajorTileFraction,
      selectedEndpointDischargeFloor: materialized.selectedEndpointDischargeFloor,
      selectedChainLengths: Array.from(materialized.selectedChainLengths),
      longestSelectedChainLength: materialized.longestSelectedChainLength,
      meanSelectedChainLength: Number(materialized.meanSelectedChainLength.toFixed(2)),
      nonProjectableMajorTileCount: materialized.nonProjectableMajorTileCount,
      unselectedEligibleMajorTileCount: materialized.unselectedEligibleMajorTileCount,
      selectedEligibleMajorTileFraction: Number(selectedEligibleMajorTileFraction.toFixed(4)),
      majorDurableTileCount,
      majorPerennialTileCount,
      majorClosedBasinTileCount,
      majorOceanMouthTileCount,
      projectionSignalStatus: projectionSignal.status,
      projectionSignalReason: projectionSignal.reason,
    }));

    logStats("PRE-RIVERS");
    for (let i = 0; i < size; i++) {
      if (materialized.riverMask[i] !== 1) continue;
      context.adapter.setTerrainType(i % width, Math.floor(i / width), NAVIGABLE_RIVER_TERRAIN);
    }
    logStats("POST-STAMP-RIVERS");
    // Stock Civ map scripts run TerrainBuilder.modelRivers before validation
    // and named-river definition. Keep that native materialization sequence
    // local to projection; Hydrology remains the source of authored river truth.
    context.adapter.modelRivers(
      CIV7_DEFAULT_RIVER_MODELING_ARGS.minLength,
      CIV7_DEFAULT_RIVER_MODELING_ARGS.maxLength,
      NAVIGABLE_RIVER_TERRAIN
    );
    context.trace.event(() => ({
      type: "map.rivers.officialCivRiverModeling",
      minLength: CIV7_DEFAULT_RIVER_MODELING_ARGS.minLength,
      maxLength: CIV7_DEFAULT_RIVER_MODELING_ARGS.maxLength,
    }));
    logStats("POST-MODEL-RIVERS");
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
      const riverReadback = context.adapter.readRiverProjection(
        width,
        height,
        materialized.riverMask
      );
      const lakeMask = new Uint8Array(size);
      for (let i = 0; i < size; i++) {
        const isWater = (engine.landMask[i] ?? 1) === 0;
        if (isWater) lakeMask[i] = 1;
      }

      const sinkMismatchCount = lakeMask.reduce((acc, _v, idx) => {
        if ((hydrography.sinkMask[idx] ?? 0) === 1 && lakeMask[idx] === 0) return acc + 1;
        return acc;
      }, 0);

      deps.artifacts.engineProjectionRivers.publish(context, {
        width,
        height,
        lakeMask,
        riverMask: riverReadback.terrainNavigableRiverMask,
        engineRiverType: riverReadback.engineRiverType,
        engineIsRiverMask: riverReadback.engineIsRiverMask,
        engineNavigableRiverMask: riverReadback.engineNavigableRiverMask,
        engineMinorRiverMask: riverReadback.engineMinorRiverMask,
        terrainNavigableRiverMask: riverReadback.terrainNavigableRiverMask,
        rejectedNavigableRiverMask: riverReadback.rejectedNavigableRiverMask,
        sinkMismatchCount,
        riverMismatchCount: riverReadback.navigableRiverMismatchTileCount,
        selectedRiverRejectedCount: riverReadback.rejectedNavigableRiverTileCount,
        extraEngineRiverCount: riverReadback.extraNavigableRiverTileCount,
        engineRiverTileCount: riverReadback.engineRiverTileCount,
        engineNavigableRiverTileCount: riverReadback.engineNavigableRiverTileCount,
        engineMinorRiverTileCount: riverReadback.engineMinorRiverTileCount,
        terrainNavigableRiverTileCount: riverReadback.terrainNavigableRiverTileCount,
        minorRiverStampingSupported: riverReadback.minorRiverStampingSupported,
        minorRiverUnsupportedReason: riverReadback.minorRiverUnsupportedReason,
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
        riverMismatchCount: riverReadback.navigableRiverMismatchTileCount,
        selectedRiverRejectedCount: riverReadback.rejectedNavigableRiverTileCount,
        extraEngineRiverCount: riverReadback.extraNavigableRiverTileCount,
        engineRiverTileCount: riverReadback.engineRiverTileCount,
        engineNavigableRiverTileCount: riverReadback.engineNavigableRiverTileCount,
        engineMinorRiverTileCount: riverReadback.engineMinorRiverTileCount,
        minorRiverStampingSupported: riverReadback.minorRiverStampingSupported,
        riverMismatchShare: Number(
          (riverReadback.navigableRiverMismatchTileCount / Math.max(1, width * height)).toFixed(4)
        ),
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
          role: "projection",
        }),
      });
      context.viz?.dumpGrid(context.trace, {
        dataTypeKey: "map.rivers.plannedMinorRiverMask",
        spaceId: TILE_SPACE_ID,
        dims: { width, height },
        format: "u8",
        values: materialized.plannedMinorRiverMask,
        meta: defineVizMeta("map.rivers.plannedMinorRiverMask", {
          label: "Minor River Mask (Hydrology Intent)",
          group: GROUP_MAP_RIVERS,
          palette: "categorical",
          role: "physics",
        }),
      });
      context.viz?.dumpGrid(context.trace, {
        dataTypeKey: "map.rivers.plannedMajorRiverMask",
        spaceId: TILE_SPACE_ID,
        dims: { width, height },
        format: "u8",
        values: materialized.plannedMajorRiverMask,
        meta: defineVizMeta("map.rivers.plannedMajorRiverMask", {
          label: "Major River Mask (Hydrology Intent)",
          group: GROUP_MAP_RIVERS,
          palette: "categorical",
          role: "physics",
        }),
      });
      context.viz?.dumpGrid(context.trace, {
        dataTypeKey: "map.rivers.engineRiverMask",
        spaceId: TILE_SPACE_ID,
        dims: { width, height },
        format: "u8",
        values: riverReadback.terrainNavigableRiverMask,
        meta: defineVizMeta("map.rivers.engineRiverMask", {
          label: "Navigable River Terrain (Engine)",
          group: GROUP_MAP_RIVERS,
          palette: "categorical",
          role: "engine",
        }),
      });
      context.viz?.dumpGrid(context.trace, {
        dataTypeKey: "map.rivers.engineNavigableRiverMetadataMask",
        spaceId: TILE_SPACE_ID,
        dims: { width, height },
        format: "u8",
        values: riverReadback.engineNavigableRiverMask,
        meta: defineVizMeta("map.rivers.engineNavigableRiverMetadataMask", {
          label: "Navigable River Metadata (Engine)",
          group: GROUP_MAP_RIVERS,
          palette: "categorical",
          visibility: "debug",
          role: "engine",
        }),
      });
      context.viz?.dumpGrid(context.trace, {
        dataTypeKey: "map.rivers.riverMismatchMask",
        spaceId: TILE_SPACE_ID,
        dims: { width, height },
        format: "u8",
        values: riverReadback.navigableRiverMismatchMask,
        meta: defineVizMeta("map.rivers.riverMismatchMask", {
          label: "River Mismatch Mask",
          group: GROUP_MAP_RIVERS,
          palette: "categorical",
          visibility: "debug",
        }),
      });
      context.viz?.dumpGrid(context.trace, {
        dataTypeKey: "map.rivers.engineMinorRiverMask",
        spaceId: TILE_SPACE_ID,
        dims: { width, height },
        format: "u8",
        values: riverReadback.engineMinorRiverMask,
        meta: defineVizMeta("map.rivers.engineMinorRiverMask", {
          label: "Minor River Mask (Engine Readback)",
          group: GROUP_MAP_RIVERS,
          palette: "categorical",
          visibility: "debug",
          role: "engine",
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
