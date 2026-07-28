import {
  CIV7_BROWSER_TABLES_V0,
  CIV7_DEFAULT_RIVER_MODELING_ARGS,
  deriveCiv7CoastProjection,
} from "@civ7/map-policy";
import {
  HYDROLOGY_FLOW_INTERMITTENT,
  HYDROLOGY_FLOW_PERENNIAL,
  HYDROLOGY_MOUTH_CLOSED_BASIN,
  HYDROLOGY_MOUTH_OCEAN,
  HYDROLOGY_MOUTH_SPILL_PATH,
} from "@mapgen/domain/hydrology/modules/hydrography/model/policy/river-network-classification.js";
import { createStep } from "@swooper/mapgen-core/authoring";
import { restoreProjectedCoastTerrain } from "../../../../../water-surface-parity.js";
import {
  NAVIGABLE_RIVER_PROJECTION_POLICY,
  type NavigableRiverDensityKnob,
  selectNavigableRiverTerrain,
} from "../../model/policy/navigable-river-projection.js";
import { config } from "./config.js";
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
export const PlotRiversStep = createStep(config, {
  normalize: (stepConfig, ctx) => {
    const { navigableRiverDensity } = ctx.knobs as Readonly<{
      navigableRiverDensity?: NavigableRiverDensityKnob | null;
    }>;
    return navigableRiverDensity === null || navigableRiverDensity === undefined
      ? stepConfig
      : {
          ...stepConfig,
          ...NAVIGABLE_RIVER_PROJECTION_POLICY[navigableRiverDensity],
        };
  },
  run: (context, stepConfig, _ops, deps) => {
    const hydrography = deps.artifacts.hydrography.read();
    const lakePlan = deps.artifacts.lakePlan.read();
    const riverNetwork = deps.artifacts.riverNetwork.read();
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

    const logStats = (label: string) => {
      context.trace.event(() => {
        let flat = 0,
          hill = 0,
          mtn = 0,
          water = 0;
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            if (deps.engine.isWater(context, x, y)) {
              water++;
              continue;
            }
            const t = deps.engine.getTerrainType(context, x, y);
            if (t === terrain.TERRAIN_MOUNTAIN) mtn++;
            else if (t === terrain.TERRAIN_HILL) hill++;
            else flat++;
          }
        }
        const total = width * height;
        const land = Math.max(1, flat + hill + mtn);
        return {
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
        };
      });
    };

    const size = width * height;
    const projectableLandMask = new Uint8Array(size);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (deps.engine.isWater(context, x, y)) continue;
        if (deps.engine.getTerrainType(context, x, y) === terrain.TERRAIN_MOUNTAIN) continue;
        projectableLandMask[idx] = 1;
      }
    }

    const materialized = selectNavigableRiverTerrain(
      {
        width,
        height,
        riverClass: hydrography.riverClass,
        discharge: hydrography.discharge,
        flowDir: hydrography.flowDir,
        mouthType: riverNetwork.mouthType,
        lakeMask: lakePlan.lakeMask,
        projectableLandMask,
      },
      stepConfig
    );

    let majorDurableTileCount = 0;
    let majorPerennialTileCount = 0;
    let majorClosedBasinTileCount = 0;
    let majorOceanMouthTileCount = 0;
    for (let i = 0; i < size; i++) {
      if (materialized.plannedMajorRiverMask[i] !== 1) continue;
      const permanence = riverNetwork.flowPermanenceProxy[i] ?? 0;
      if (permanence >= HYDROLOGY_FLOW_INTERMITTENT) majorDurableTileCount += 1;
      if (permanence >= HYDROLOGY_FLOW_PERENNIAL) majorPerennialTileCount += 1;
      const mouthType = riverNetwork.mouthType[i] ?? 0;
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

    deps.artifacts.projectedNavigableRivers.publish({
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
      policy: "map-rivers.selectNavigableRiverTerrain.v0",
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
      deps.engine.setTerrainType(
        context,
        i % width,
        Math.floor(i / width),
        terrain.TERRAIN_NAVIGABLE_RIVER
      );
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
    deps.engine.modelRivers(
      context,
      CIV7_DEFAULT_RIVER_MODELING_ARGS.minLength,
      CIV7_DEFAULT_RIVER_MODELING_ARGS.maxLength,
      terrain.TERRAIN_NAVIGABLE_RIVER
    );
    context.trace.event(() => ({
      type: "map.rivers.officialCivRiverModeling",
      policy: "civ7.stockRiverMaterialization.v0",
      minLength: CIV7_DEFAULT_RIVER_MODELING_ARGS.minLength,
      maxLength: CIV7_DEFAULT_RIVER_MODELING_ARGS.maxLength,
    }));
    logStats("POST-MODEL-RIVERS");
    deps.engine.validateAndFixTerrain(context);
    restoreProjectedCoastTerrain(
      context.setup.dimensions,
      context.trace,
      {
        getTerrainType: (x, y) => deps.engine.getTerrainType(context, x, y),
        setTerrainType: (x, y, terrainType) =>
          deps.engine.setTerrainType(context, x, y, terrainType),
        storeWaterData: () => deps.engine.storeWaterData(context),
      },
      coastProjection,
      "map-rivers/plot-rivers"
    );
    logStats("POST-VALIDATE");
    deps.engine.defineNamedRivers(context);

    // River modeling and validation can rewrite terrain after elevation. Refresh
    // area and water caches here so ecology and placement read the final engine
    // topology rather than the pre-river projection surface.
    deps.engine.recalculateAreas(context);
    deps.engine.storeWaterData(context);

    const riverReadback = deps.engine.readRiverProjection(
      context,
      width,
      height,
      materialized.riverMask
    );
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
        (riverReadback.navigableRiverMismatchTileCount / (width * height)).toFixed(4)
      ),
    }));
    const engineEvidence: PlotRiversVizEvidence["engineEvidence"] = {
      riverReadback,
    };
    return {
      riverClass: hydrography.riverClass,
      discharge: hydrography.discharge,
      materialized,
      topographyLandMask: topography.landMask,
      engineEvidence,
    } satisfies PlotRiversVizEvidence;
  },
  viz: ({ observation, dimensions }) => buildPlotRiversVizProjections(observation, dimensions),
});
