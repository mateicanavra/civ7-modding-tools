import { CIV7_DEFAULT_RIVER_MODELING_ARGS } from "@civ7/map-policy";
import {
  HYDROLOGY_FLOW_INTERMITTENT,
  HYDROLOGY_FLOW_PERENNIAL,
  HYDROLOGY_MOUTH_CLOSED_BASIN,
  HYDROLOGY_MOUTH_OCEAN,
  HYDROLOGY_MOUTH_SPILL_PATH,
} from "@mapgen/domain/hydrology/model/policy/river-network-metrics.js";
import {
  HILL_TERRAIN,
  MOUNTAIN_TERRAIN,
  NAVIGABLE_RIVER_TERRAIN,
  snapshotEngineHeightfield,
} from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { restoreProjectedCoastTerrain } from "../../../../projection-policies/coastProjectionParity.js";
import { PlotRiversStepContract } from "./config.js";
import {
  NAVIGABLE_RIVER_PROJECTION_POLICY,
  type NavigableRiverDensityKnob,
} from "./navigable-river-projection-policy.js";
import { buildPlotRiversVizProjections, type PlotRiversVizEvidence } from "./viz.js";

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

/**
 * Projects Hydrology river truth after elevation, selects navigable terrain,
 * and publishes planned-versus-engine readbacks for parity diagnostics.
 */
export const PlotRiversStep = createStep(PlotRiversStepContract, {
  normalize: (config, ctx) => {
    if (config.selectNavigableRiverTerrain.strategy !== "default") return config;
    const { navigableRiverDensity } = ctx.knobs as {
      navigableRiverDensity: NavigableRiverDensityKnob;
    };

    return {
      ...config,
      selectNavigableRiverTerrain: {
        ...config.selectNavigableRiverTerrain,
        config: {
          ...config.selectNavigableRiverTerrain.config,
          ...NAVIGABLE_RIVER_PROJECTION_POLICY[navigableRiverDensity],
        },
      },
    };
  },
  run: (context, config, ops, deps) => {
    const hydrography = deps.artifacts.hydrography.read(context);
    const lakePlan = deps.artifacts.lakePlan.read(context);
    const riverNetworkMetrics = deps.artifacts.riverNetworkMetrics.read(context);
    const coastClassification = deps.artifacts.coastClassification.read(context);
    const { width, height } = context.dimensions;

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
        mouthType: riverNetworkMetrics.mouthType,
        lakeMask: lakePlan.lakeMask,
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
    context.trace.event(() => ({
      type: "map.rivers.authoredTerrainMaterialization",
      policy: "hydrology.authoredNavigableTerrain.v0",
      selectedTileCount: materialized.selectedTileCount,
      reason:
        "MapGen stamps the Hydrology-selected navigable terrain mask before asking Civ to build native river objects.",
    }));
    logStats("POST-AUTHORED-RIVERS");
    // Stock Civ map scripts run TerrainBuilder.modelRivers before validation
    // and named-river definition. Keep Hydrology as source truth, but use the
    // adapter-owned native boundary so Civ creates river metadata/model objects
    // rather than terrain-only rows.
    context.adapter.modelRivers(
      CIV7_DEFAULT_RIVER_MODELING_ARGS.minLength,
      CIV7_DEFAULT_RIVER_MODELING_ARGS.maxLength,
      NAVIGABLE_RIVER_TERRAIN
    );
    context.trace.event(() => ({
      type: "map.rivers.officialCivRiverModeling",
      policy: "civ7.stockRiverMaterialization.v0",
      minLength: CIV7_DEFAULT_RIVER_MODELING_ARGS.minLength,
      maxLength: CIV7_DEFAULT_RIVER_MODELING_ARGS.maxLength,
    }));
    logStats("POST-MODEL-RIVERS");
    context.adapter.validateAndFixTerrain();
    restoreProjectedCoastTerrain(context, coastClassification, "map-rivers/plot-rivers");
    logStats("POST-VALIDATE");
    context.adapter.defineNamedRivers();

    // River modeling and validation can rewrite terrain after elevation. Refresh
    // area and water caches here so ecology and placement read the final engine
    // topology rather than the pre-river projection surface.
    context.adapter.recalculateAreas();
    context.adapter.storeWaterData();

    const physics = context.buffers.heightfield;
    const engine = snapshotEngineHeightfield(context);
    let engineEvidence: PlotRiversVizEvidence["engineEvidence"];
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
      engineEvidence = { engineLandMask: engine.landMask, riverReadback };
    }
    return {
      riverClass: hydrography.riverClass,
      discharge: hydrography.discharge,
      materialized,
      physicsLandMask: physics.landMask,
      engineEvidence,
    } satisfies PlotRiversVizEvidence;
  },
  viz: ({ result, dimensions }) => buildPlotRiversVizProjections(result, dimensions),
});
