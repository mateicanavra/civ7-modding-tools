/// <reference types="@civ7/types" />

/**
 * Placement metrics harness (placement-realignment S0).
 *
 * Runs the standard recipe headlessly with the mock adapter over a stable seed
 * and computes the E1/E2/E3 expectation metrics
 * (docs/projects/placement-realignment/expectations.md) plus the
 * resource-distribution-policy step-1 metrics (E2.9) from placement artifacts.
 *
 * This is observability tooling: it REPORTS metrics, it never gates them and
 * it must not change recipe behavior. Metrics that cannot be computed without
 * the live engine (or until a later slice lands its data) are reported with an
 * explicit non-"computed" status instead of being silently omitted.
 */

import { createMockAdapter } from "@civ7/adapter";
import type { GameMapAdapter } from "@civ7/adapter";
import { VOLCANO_FEATURE, createExtendedMapContext, createLabelRng } from "@swooper/mapgen-core";
import {
  getHexNeighborIndicesOddQ,
  getHexRadiusIndicesOddQ,
  hexDistanceOddQPeriodicX,
} from "@swooper/mapgen-core/lib/grid";

import { canonicalRecipeConfig, isPlainObject as isCanonicalMapConfigObject } from "../../maps/configs/canonical.js";
import standardRecipe from "../../recipes/standard/recipe.js";
import { initializeStandardRuntime } from "../../recipes/standard/runtime.js";
import swooperEarthlikeConfigRaw from "../../maps/configs/swooper-earthlike.config.json";
import { placementArtifacts } from "../../recipes/standard/stages/placement/artifacts.js";
import { morphologyArtifacts } from "../../recipes/standard/stages/morphology/artifacts.js";
import { ecologyArtifacts } from "../../recipes/standard/stages/ecology/artifacts.js";
import { hydrologyHydrographyArtifacts } from "../../recipes/standard/stages/hydrology-hydrography/artifacts.js";
import { hydrologyClimateRefineArtifacts } from "../../recipes/standard/stages/hydrology-climate-refine/artifacts.js";

export const PLACEMENT_METRICS_SCHEMA_VERSION = 1;

export type PlacementMetricStatus =
  | "computed"
  | "pending-s2"
  | "pending-s3"
  | "pending-s4"
  | "requires-live-engine"
  | "requires-studio-dump";

export type PlacementMetricResult = {
  id: string;
  expectation: string;
  status: PlacementMetricStatus;
  /** Flat numeric/boolean headline values; aggregated across seeds generically. */
  summary: Record<string, number | boolean | null>;
  /** Optional structured detail (per-type rows, per-band rows, ...). */
  detail?: unknown;
  note?: string;
};

export type PlacementMetricsRunOptions = {
  seed: number;
  width: number;
  height: number;
  /** Player count requested for the west/primary landmass slot. */
  playersLandmass1: number;
  /** Player count requested for the east/secondary landmass slot. */
  playersLandmass2: number;
  /**
   * The player count the author intended to seat. Defaults to
   * playersLandmass1 + playersLandmass2. Pass the single playerCount when
   * reproducing the studio worker's duplicated-slot mapInfo (E1.2 doubling).
   */
  intendedPlayerCount?: number;
  minLatitude?: number;
  maxLatitude?: number;
  label?: string;
};

export type PlacementMetricsRun = {
  schemaVersion: typeof PLACEMENT_METRICS_SCHEMA_VERSION;
  options: Required<Omit<PlacementMetricsRunOptions, "label">> & { label?: string };
  metrics: Record<string, PlacementMetricResult>;
};

export type PlacementMetricsAggregate = {
  schemaVersion: typeof PLACEMENT_METRICS_SCHEMA_VERSION;
  runCount: number;
  seeds: number[];
  metrics: Record<
    string,
    {
      id: string;
      expectation: string;
      status: PlacementMetricStatus;
      note?: string;
      summary: Record<string, { mean: number | null; min: number | null; max: number | null; trueCount?: number }>;
    }
  >;
};

const START_SUPPORT_RADIUS_TILES = 4;
const START_SUPPORT_FLOOR = 2;
const LATITUDE_BAND_DEGREES = 15;
const LANDMASS_MIN_LAND_SHARE = 0.1;
const SECTOR_ROWS = 4;
const SECTOR_COLS = 4;

type StartAssignmentArtifact = {
  positions: number[];
  assigned: number;
  regionalAssigned: number;
  openPoolAssigned: number;
  openPoolUsed: boolean;
  desperationAssigned: number;
  candidateCount: number;
};

type ResourcePlanArtifact = {
  minSpacingTiles: number;
  plannedCount: number;
  placements: ReadonlyArray<{ plotIndex: number; preferredResourceType: number; priority: number }>;
};

type ResourceOutcomesArtifact = {
  summary: {
    plannedCount: number;
    placedCount: number;
    rejectedCount: number;
    mismatchCount: number;
    byResource: ReadonlyArray<{ resourceType: number; plannedCount: number; placedCount: number }>;
  };
  assignment: {
    requestedPlannedCount: number;
    assignedCount: number;
    minSpacingTiles: number;
    reassignedCount: number;
    unassignedPreferredCount: number;
  };
  assignmentTrace: ReadonlyArray<{
    plotIndex: number;
    x: number;
    y: number;
    resourceType: number;
    preferredResourceType: number | null;
    reassignedByRebalance: boolean;
  }>;
  outcomes: ReadonlyArray<{
    status: "placed" | "rejected" | "mismatch";
    plotIndex: number;
    x: number;
    y: number;
    resourceType: number;
  }>;
};

function mean(values: readonly number[]): number | null {
  if (!values.length) return null;
  let sum = 0;
  for (const value of values) sum += value;
  return sum / values.length;
}

function quantileSorted(sorted: readonly number[], q: number): number | null {
  if (!sorted.length) return null;
  const pos = (sorted.length - 1) * Math.min(1, Math.max(0, q));
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  const loValue = sorted[lo]!;
  const hiValue = sorted[hi]!;
  return loValue + (hiValue - loValue) * (pos - lo);
}

function coefficientOfVariation(values: readonly number[]): number | null {
  const m = mean(values);
  if (m == null || m === 0) return null;
  let varSum = 0;
  for (const value of values) varSum += (value - m) * (value - m);
  return Math.sqrt(varSum / values.length) / m;
}

function shannonEntropy(counts: readonly number[]): { entropy: number; maxEntropy: number } {
  const total = counts.reduce((a, b) => a + b, 0);
  const active = counts.filter((c) => c > 0);
  if (total <= 0 || counts.length <= 1) return { entropy: 0, maxEntropy: 0 };
  let entropy = 0;
  for (const count of active) {
    const p = count / total;
    entropy -= p * Math.log(p);
  }
  return { entropy, maxEntropy: Math.log(counts.length) };
}

function rowLatitude(y: number, height: number, topLatitude: number, bottomLatitude: number): number {
  if (height <= 1) return (topLatitude + bottomLatitude) / 2;
  return topLatitude + ((bottomLatitude - topLatitude) * y) / (height - 1);
}

function metric(
  id: string,
  expectation: string,
  status: PlacementMetricStatus,
  summary: Record<string, number | boolean | null>,
  extra?: { detail?: unknown; note?: string }
): PlacementMetricResult {
  return { id, expectation, status, summary, detail: extra?.detail, note: extra?.note };
}

/**
 * Runs the standard recipe with the shipped swooper-earthlike config on the
 * mock adapter and computes the placement metrics from the run's artifacts.
 */
export function runPlacementMetrics(options: PlacementMetricsRunOptions): PlacementMetricsRun {
  const width = Math.max(1, options.width | 0);
  const height = Math.max(1, options.height | 0);
  const seed = options.seed | 0;
  const playersLandmass1 = Math.max(0, options.playersLandmass1 | 0);
  const playersLandmass2 = Math.max(0, options.playersLandmass2 | 0);
  const intendedPlayerCount = options.intendedPlayerCount ?? playersLandmass1 + playersLandmass2;
  const minLatitude = options.minLatitude ?? -60;
  const maxLatitude = options.maxLatitude ?? 60;

  const mapInfo = {
    GridWidth: width,
    GridHeight: height,
    MinLatitude: minLatitude,
    MaxLatitude: maxLatitude,
    PlayersLandmass1: playersLandmass1,
    PlayersLandmass2: playersLandmass2,
    StartSectorRows: SECTOR_ROWS,
    StartSectorCols: SECTOR_COLS,
  } as const;

  const env = {
    seed,
    dimensions: { width, height },
    latitudeBounds: {
      topLatitude: maxLatitude,
      bottomLatitude: minLatitude,
    },
  } as const;

  const loadedConfig = swooperEarthlikeConfigRaw as unknown;
  const config =
    isCanonicalMapConfigObject(loadedConfig) && isCanonicalMapConfigObject(loadedConfig.config)
      ? canonicalRecipeConfig(loadedConfig)
      : loadedConfig;

  const adapter = createMockAdapter({ width, height, mapInfo, mapSizeId: 1, rng: createLabelRng(seed) });
  const context = createExtendedMapContext({ width, height }, adapter, env);
  initializeStandardRuntime(context, { mapInfo, logPrefix: "[placement-metrics]", storyEnabled: true });
  standardRecipe.run(context, env, config, { log: () => {} });

  const metrics = computePlacementMetricsFromRun({
    context,
    adapter,
    width,
    height,
    intendedPlayerCount,
    topLatitude: maxLatitude,
    bottomLatitude: minLatitude,
  });

  return {
    schemaVersion: PLACEMENT_METRICS_SCHEMA_VERSION,
    options: {
      seed,
      width,
      height,
      playersLandmass1,
      playersLandmass2,
      intendedPlayerCount,
      minLatitude,
      maxLatitude,
      ...(options.label ? { label: options.label } : {}),
    },
    metrics,
  };
}

type ComputeArgs = {
  context: { artifacts: { get(id: string): unknown } };
  adapter: GameMapAdapter;
  width: number;
  height: number;
  intendedPlayerCount: number;
  topLatitude: number;
  bottomLatitude: number;
};

export function computePlacementMetricsFromRun(args: ComputeArgs): Record<string, PlacementMetricResult> {
  const { context, adapter, width, height, intendedPlayerCount, topLatitude, bottomLatitude } = args;
  const size = width * height;

  const startAssignment = context.artifacts.get(placementArtifacts.startAssignment.id) as
    | StartAssignmentArtifact
    | undefined;
  const wonderPlacement = context.artifacts.get(placementArtifacts.naturalWonderPlacement.id) as
    | { coordinateRows?: ReadonlyArray<{ status: string; plotIndex: number; observedPlotIndex?: number }> }
    | undefined;
  const resourcePlan = context.artifacts.get(placementArtifacts.resourcePlan.id) as
    | ResourcePlanArtifact
    | undefined;
  const resourceOutcomes = context.artifacts.get(placementArtifacts.resourcePlacementOutcomes.id) as
    | ResourceOutcomesArtifact
    | undefined;
  const topography = context.artifacts.get(morphologyArtifacts.topography.id) as
    | { landMask?: Uint8Array }
    | undefined;
  const landmasses = context.artifacts.get(morphologyArtifacts.landmasses.id) as
    | {
        landmasses?: ReadonlyArray<{ tileCount: number }>;
        landmassIdByTile?: Int32Array;
      }
    | undefined;
  const pedology = context.artifacts.get(ecologyArtifacts.pedology.id) as
    | { fertility?: Float32Array }
    | undefined;
  const hydrography = context.artifacts.get(hydrologyHydrographyArtifacts.hydrography.id) as
    | { riverClass?: Uint8Array }
    | undefined;
  const climateIndices = context.artifacts.get(hydrologyClimateRefineArtifacts.climateIndices.id) as
    | { surfaceTemperatureC?: Float32Array; aridityIndex?: Float32Array }
    | undefined;

  if (!startAssignment) throw new Error("Missing artifact:placement.startAssignment.");
  if (!resourceOutcomes) throw new Error("Missing artifact:placement.resourcePlacementOutcomes.");
  if (!resourcePlan) throw new Error("Missing artifact:placement.resourcePlan.");
  const landMask = topography?.landMask;
  if (!(landMask instanceof Uint8Array) || landMask.length !== size) {
    throw new Error("Missing artifact:morphology.topography landMask.");
  }
  const fertility = pedology?.fertility;
  if (!(fertility instanceof Float32Array) || fertility.length !== size) {
    throw new Error("Missing artifact:ecology.soils fertility.");
  }
  const riverClass = hydrography?.riverClass;
  if (!(riverClass instanceof Uint8Array) || riverClass.length !== size) {
    throw new Error("Missing artifact:hydrology.hydrography riverClass.");
  }
  const aridityIndex = climateIndices?.aridityIndex;
  const surfaceTemperatureC = climateIndices?.surfaceTemperatureC;
  if (!(aridityIndex instanceof Float32Array) || !(surfaceTemperatureC instanceof Float32Array)) {
    throw new Error("Missing artifact:hydrology.climateIndices aridityIndex/surfaceTemperatureC.");
  }

  const startPlots = startAssignment.positions.filter((plotIndex) => plotIndex >= 0 && plotIndex < size);
  const placed = resourceOutcomes.outcomes.filter((outcome) => outcome.status === "placed");

  const wonderPlots = new Set<number>();
  for (const row of wonderPlacement?.coordinateRows ?? []) {
    if (row.status !== "placed") continue;
    wonderPlots.add(row.plotIndex);
    if (typeof row.observedPlotIndex === "number") wonderPlots.add(row.observedPlotIndex);
  }

  const metrics: Record<string, PlacementMetricResult> = {};

  // --- E1.1 starts on passable, settleable land -------------------------------------------------
  {
    let onMountain = 0;
    let onVolcano = 0;
    let onLake = 0;
    let onWater = 0;
    let onWonder = 0;
    let invalid = 0;
    const offenders: Array<{ plotIndex: number; reasons: string[] }> = [];
    for (const plotIndex of startPlots) {
      const y = (plotIndex / width) | 0;
      const x = plotIndex - y * width;
      const reasons: string[] = [];
      if (adapter.isMountain(x, y)) {
        onMountain++;
        reasons.push("mountain");
      }
      if (adapter.getFeatureType(x, y) === VOLCANO_FEATURE) {
        onVolcano++;
        reasons.push("volcano");
      }
      if (adapter.isLake(x, y)) {
        onLake++;
        reasons.push("lake");
      } else if (adapter.isWater(x, y)) {
        onWater++;
        reasons.push("water");
      }
      if (wonderPlots.has(plotIndex)) {
        onWonder++;
        reasons.push("natural-wonder");
      }
      if (reasons.length) {
        invalid++;
        offenders.push({ plotIndex, reasons });
      }
    }
    metrics["E1.1"] = metric(
      "E1.1",
      "Every start is on passable, settleable land (0% on mountain/volcano/wonder/lake)",
      "computed",
      {
        startsTotal: startPlots.length,
        onMountain,
        onVolcano,
        onLake,
        onWater,
        onWonder,
        invalidCount: invalid,
        invalidPct: startPlots.length ? invalid / startPlots.length : null,
      },
      { detail: offenders }
    );
  }

  // --- E1.2 seated count vs configured players --------------------------------------------------
  metrics["E1.2"] = metric(
    "E1.2",
    "Exactly the configured alive players are seated (no doubling)",
    "computed",
    {
      intendedPlayerCount,
      seatedCount: startAssignment.assigned,
      seatedMatchesIntended: startAssignment.assigned === intendedPlayerCount,
      doublingDetected: intendedPlayerCount > 0 && startAssignment.assigned === intendedPlayerCount * 2,
    },
    {
      note:
        "Mock-adapter run; live getAliveMajorIds() comparison requires the live engine (E1.2 engine half is requires-live-engine).",
    }
  );

  // --- E1.3 freshwater access --------------------------------------------------------------------
  {
    let freshwaterStarts = 0;
    for (const plotIndex of startPlots) {
      const y = (plotIndex / width) | 0;
      const x = plotIndex - y * width;
      const neighborhood = [plotIndex, ...getHexNeighborIndicesOddQ(x, y, width, height)];
      const hasFreshwater = neighborhood.some((idx) => {
        const ny = (idx / width) | 0;
        const nx = idx - ny * width;
        return (riverClass[idx] ?? 0) > 0 || adapter.isLake(nx, ny);
      });
      if (hasFreshwater) freshwaterStarts++;
    }
    metrics["E1.3"] = metric("E1.3", "Freshwater access (river/lake adjacency <=1 tile) >= 80%", "computed", {
      startsTotal: startPlots.length,
      freshwaterStarts,
      freshwaterPct: startPlots.length ? freshwaterStarts / startPlots.length : null,
    });
  }

  // --- E1.4 fertile neighborhood ------------------------------------------------------------------
  {
    const landFertility: number[] = [];
    for (let i = 0; i < size; i++) {
      if (landMask[i] === 1) landFertility.push(fertility[i] ?? 0);
    }
    const landMean = mean(landFertility);
    const startMeans: number[] = [];
    for (const plotIndex of startPlots) {
      const around = getHexRadiusIndicesOddQ(plotIndex, width, height, 2).filter((idx) => landMask[idx] === 1);
      const m = mean(around.map((idx) => fertility[idx] ?? 0));
      if (m != null) startMeans.push(m);
    }
    const startMean = mean(startMeans);
    metrics["E1.4"] = metric("E1.4", "Start radius-2 fertility mean >= 1.3x land mean", "computed", {
      startFertilityMean: startMean,
      landFertilityMean: landMean,
      fertilityRatio: startMean != null && landMean != null && landMean > 0 ? startMean / landMean : null,
    });
  }

  // --- E1.5 spacing --------------------------------------------------------------------------------
  {
    let minSpacing: number | null = null;
    for (let i = 0; i < startPlots.length; i++) {
      for (let j = i + 1; j < startPlots.length; j++) {
        const d = hexDistanceOddQPeriodicX(startPlots[i]!, startPlots[j]!, width);
        if (minSpacing == null || d < minSpacing) minSpacing = d;
      }
    }
    metrics["E1.5"] = metric("E1.5", "Min pairwise start spacing >= 6 tiles (score tapers to 12)", "computed", {
      minPairwiseStartSpacing: minSpacing,
      pairsBelow6:
        startPlots.length < 2
          ? 0
          : startPlots.reduce((acc, a, i) => {
              let below = 0;
              for (let j = i + 1; j < startPlots.length; j++) {
                if (hexDistanceOddQPeriodicX(a, startPlots[j]!, width) < 6) below++;
              }
              return acc + below;
            }, 0),
    });
  }

  // --- E1.6 fairness (pending S4) ------------------------------------------------------------------
  metrics["E1.6"] = metric("E1.6", "Worst-pair gap on StartRecord.score <= 0.3", "pending-s4", {}, {
    note: "Per-player StartRecord.score (fixed 0..1 normalization) is unbuilt until S4; no published per-seat score exists yet.",
  });

  // --- E1.7 fallback rates --------------------------------------------------------------------------
  metrics["E1.7"] = metric(
    "E1.7",
    "Desperation/openPool fallback rate <= 5% of seats; surfaced in artifact",
    "computed",
    {
      seatedCount: startAssignment.assigned,
      regionalAssigned: startAssignment.regionalAssigned,
      openPoolAssigned: startAssignment.openPoolAssigned,
      desperationAssigned: startAssignment.desperationAssigned,
      openPoolUsed: startAssignment.openPoolUsed,
      fallbackRate: startAssignment.assigned
        ? (startAssignment.openPoolAssigned + startAssignment.desperationAssigned) / startAssignment.assigned
        : null,
    }
  );

  // --- E1.8 climate extremes -------------------------------------------------------------------------
  {
    const landAridity: number[] = [];
    const landTemperature: number[] = [];
    for (let i = 0; i < size; i++) {
      if (landMask[i] !== 1) continue;
      landAridity.push(aridityIndex[i] ?? 0);
      landTemperature.push(surfaceTemperatureC[i] ?? 0);
    }
    landAridity.sort((a, b) => a - b);
    landTemperature.sort((a, b) => a - b);
    const aridityP90 = quantileSorted(landAridity, 0.9);
    const temperatureP10 = quantileSorted(landTemperature, 0.1);
    const temperatureP90 = quantileSorted(landTemperature, 0.9);
    let extremeStarts = 0;
    for (const plotIndex of startPlots) {
      const aridity = aridityIndex[plotIndex] ?? 0;
      const temperature = surfaceTemperatureC[plotIndex] ?? 0;
      const inExtreme =
        (aridityP90 != null && aridity >= aridityP90) ||
        (temperatureP10 != null && temperature <= temperatureP10) ||
        (temperatureP90 != null && temperature >= temperatureP90);
      if (inExtreme) extremeStarts++;
    }
    metrics["E1.8"] = metric(
      "E1.8",
      "Starts in top aridity decile or outer temperature deciles <= 10%",
      "computed",
      {
        startsTotal: startPlots.length,
        extremeStarts,
        extremePct: startPlots.length ? extremeStarts / startPlots.length : null,
        aridityP90,
        temperatureP10,
        temperatureP90,
      }
    );
  }

  // --- E2.1 rarity stratification ---------------------------------------------------------------------
  {
    const perType = resourceOutcomes.summary.byResource.map((row) => ({
      resourceType: row.resourceType,
      plannedCount: row.plannedCount,
      placedCount: row.placedCount,
    }));
    const placedCounts = perType.map((row) => row.placedCount).filter((count) => count > 0);
    metrics["E2.1"] = metric(
      "E2.1",
      "Rarity stratification: Spearman(count, Weight) <= -0.7; NOT uniform",
      "computed",
      {
        placedTypeCount: placedCounts.length,
        minPlacedPerType: placedCounts.length ? Math.min(...placedCounts) : null,
        maxPlacedPerType: placedCounts.length ? Math.max(...placedCounts) : null,
        perTypeCountCv: coefficientOfVariation(placedCounts),
        spearmanVsWeight: null,
      },
      {
        detail: perType,
        note:
          "Spearman vs official Weight is pending-s2: Weight rows are not in @civ7/map-policy tables until the S2 generator restoration. perTypeCountCv near 0 indicates the diagnosed force-uniform distribution.",
      }
    );
  }

  // --- E2.2 / E2.3 / E2.5 / E2.7 (pending later slices) ----------------------------------------------
  metrics["E2.2"] = metric("E2.2", "Region minimums honored (MinimumPerHemisphere)", "pending-s2", {}, {
    note: "MinimumPerHemisphere + MapResourceMinimumAmountModifier rows are absent from generated policy tables until S2.",
  });
  metrics["E2.3"] = metric("E2.3", "Habitat fidelity >= 90% inside type's habitat lane", "pending-s3", {}, {
    note: "Habitat lane masks are not derived by the live pipeline until S3 (the ~15 optional lane-mask inputs are unwired).",
  });
  metrics["E2.5"] = metric("E2.5", "Clustering matches genesis (Ripley's K above spacing floor)", "pending-s3", {}, {
    note: "Pair-correlation baseline is deferred until S3 introduces type-aware site selection; E2.6 nearest-neighbor floors are computed now.",
  });
  metrics["E2.7"] = metric("E2.7", "Per-type counts within expectedCountRange", "pending-s3", {}, {
    note: "domain/resources expectedCountRange uses symbolic ids whose runtime resolution is unverified (refactor-plan risk); wired in S3.",
  });

  // --- E2.4 marine resources -----------------------------------------------------------------------------
  {
    let marinePlaced = 0;
    const marineTypes = new Set<number>();
    for (const outcome of placed) {
      if (adapter.isWater(outcome.x, outcome.y)) {
        marinePlaced++;
        marineTypes.add(outcome.resourceType);
      }
    }
    metrics["E2.4"] = metric("E2.4", "Marine resources place on water (> 0 with coast)", "computed", {
      marinePlacedCount: marinePlaced,
      marinePlacedTypeCount: marineTypes.size,
      totalPlacedCount: placed.length,
    });
  }

  // --- E2.6 type-aware spacing -----------------------------------------------------------------------------
  {
    const plotsByType = new Map<number, number[]>();
    for (const outcome of placed) {
      const list = plotsByType.get(outcome.resourceType) ?? [];
      list.push(outcome.plotIndex);
      plotsByType.set(outcome.resourceType, list);
    }
    const perTypeMinNN: Array<{ resourceType: number; count: number; minSameTypeDistance: number | null }> = [];
    let globalMinNN: number | null = null;
    let typesBelowPlannedSpacing = 0;
    const plannedSpacing = resourcePlan.minSpacingTiles | 0;
    for (const [resourceType, plots] of plotsByType) {
      let minNN: number | null = null;
      for (let i = 0; i < plots.length; i++) {
        for (let j = i + 1; j < plots.length; j++) {
          const d = hexDistanceOddQPeriodicX(plots[i]!, plots[j]!, width);
          if (minNN == null || d < minNN) minNN = d;
        }
      }
      perTypeMinNN.push({ resourceType, count: plots.length, minSameTypeDistance: minNN });
      if (minNN != null) {
        if (globalMinNN == null || minNN < globalMinNN) globalMinNN = minNN;
        if (minNN < plannedSpacing) typesBelowPlannedSpacing++;
      }
    }
    metrics["E2.6"] = metric("E2.6", "Same-type min spacing honored; never decays to 0", "computed", {
      plannedMinSpacingTiles: plannedSpacing,
      globalMinSameTypeDistance: globalMinNN,
      typesBelowPlannedSpacing,
      typeCount: perTypeMinNN.length,
    }, { detail: perTypeMinNN });
  }

  // --- E2.8 regional equity ----------------------------------------------------------------------------------
  {
    const landmassIdByTile = landmasses?.landmassIdByTile;
    const landmassRows = landmasses?.landmasses ?? [];
    let summary: Record<string, number | boolean | null> = {
      qualifyingLandmassCount: null,
      maxDensityPer100Tiles: null,
      minDensityPer100Tiles: null,
      densitySpreadRatio: null,
    };
    let detail: unknown;
    if (landmassIdByTile instanceof Int32Array && landmassIdByTile.length === size && landmassRows.length) {
      const totalLand = landmassRows.reduce((acc, row) => acc + row.tileCount, 0);
      const counts = new Map<number, number>();
      for (const outcome of placed) {
        const id = landmassIdByTile[outcome.plotIndex] ?? -1;
        if (id < 0) continue;
        counts.set(id, (counts.get(id) ?? 0) + 1);
      }
      const qualifying = landmassRows
        .map((row, id) => ({ id, tileCount: row.tileCount }))
        .filter((row) => totalLand > 0 && row.tileCount / totalLand >= LANDMASS_MIN_LAND_SHARE);
      const densities = qualifying.map((row) => ({
        landmassId: row.id,
        tileCount: row.tileCount,
        placedCount: counts.get(row.id) ?? 0,
        densityPer100Tiles: row.tileCount > 0 ? ((counts.get(row.id) ?? 0) / row.tileCount) * 100 : 0,
      }));
      const densityValues = densities.map((row) => row.densityPer100Tiles);
      const maxDensity = densityValues.length ? Math.max(...densityValues) : null;
      const minDensity = densityValues.length ? Math.min(...densityValues) : null;
      summary = {
        qualifyingLandmassCount: densities.length,
        maxDensityPer100Tiles: maxDensity,
        minDensityPer100Tiles: minDensity,
        densitySpreadRatio: maxDensity != null && minDensity != null && minDensity > 0 ? maxDensity / minDensity : null,
      };
      detail = densities;
    }
    metrics["E2.8"] = metric(
      "E2.8",
      "Per-landmass density spread <= 2x (landmasses >= 10% of land)",
      "computed",
      summary,
      { detail }
    );
  }

  // --- E2.9 RDP step-1 metrics ----------------------------------------------------------------------------------
  {
    const trace = resourceOutcomes.assignmentTrace;
    const rowsWithPreferred = trace.filter((row) => row.preferredResourceType != null);
    const reassignedRows = rowsWithPreferred.filter((row) => row.resourceType !== row.preferredResourceType);
    const rebalancedRows = trace.filter((row) => row.reassignedByRebalance);

    let preferredLegalRows = 0;
    for (const placement of resourcePlan.placements) {
      const y = (placement.plotIndex / width) | 0;
      const x = placement.plotIndex - y * width;
      if (adapter.canHaveResource(x, y, placement.preferredResourceType)) preferredLegalRows++;
    }

    const plannedCount = resourcePlan.placements.length;
    const assignedCount = resourceOutcomes.assignment.assignedCount;
    const finalPlacedCount = resourceOutcomes.summary.placedCount;

    const bandCount = Math.ceil(180 / LATITUDE_BAND_DEGREES);
    const landByBand = new Array<number>(bandCount).fill(0);
    const placedByBand = new Array<number>(bandCount).fill(0);
    const bandIndexForY = (y: number): number => {
      const lat = rowLatitude(y, height, topLatitude, bottomLatitude);
      return Math.min(bandCount - 1, Math.max(0, Math.floor((lat + 90) / LATITUDE_BAND_DEGREES)));
    };
    for (let i = 0; i < size; i++) {
      if (landMask[i] === 1) landByBand[bandIndexForY((i / width) | 0)]!++;
    }
    for (const outcome of placed) {
      placedByBand[bandIndexForY(outcome.y)]!++;
    }
    const totalLand = landByBand.reduce((a, b) => a + b, 0);
    const bands = landByBand.map((landTiles, index) => {
      const landShare = totalLand > 0 ? landTiles / totalLand : 0;
      const resourceShare = placed.length > 0 ? (placedByBand[index] ?? 0) / placed.length : 0;
      return {
        band: `${-90 + index * LATITUDE_BAND_DEGREES}..${-90 + (index + 1) * LATITUDE_BAND_DEGREES}`,
        landTiles,
        landShare,
        placedCount: placedByBand[index] ?? 0,
        resourceShare,
        overrepresentation: landShare >= 0.02 ? resourceShare / landShare : null,
      };
    });
    const overrepresentationValues = bands
      .map((band) => band.overrepresentation)
      .filter((value): value is number => value != null);

    const sectorCounts = new Array<number>(SECTOR_ROWS * SECTOR_COLS).fill(0);
    const sectorHasLand = new Array<boolean>(SECTOR_ROWS * SECTOR_COLS).fill(false);
    const cellWidth = width / SECTOR_COLS;
    const cellHeight = height / SECTOR_ROWS;
    const sectorIndexFor = (x: number, y: number): number => {
      const col = Math.min(SECTOR_COLS - 1, Math.max(0, Math.floor(x / cellWidth)));
      const row = Math.min(SECTOR_ROWS - 1, Math.max(0, Math.floor(y / cellHeight)));
      return row * SECTOR_COLS + col;
    };
    for (let i = 0; i < size; i++) {
      if (landMask[i] !== 1) continue;
      const y = (i / width) | 0;
      sectorHasLand[sectorIndexFor(i - y * width, y)] = true;
    }
    for (const outcome of placed) {
      sectorCounts[sectorIndexFor(outcome.x, outcome.y)]!++;
    }
    const activeSectorCounts = sectorCounts.filter((_, index) => sectorHasLand[index]);
    const { entropy, maxEntropy } = shannonEntropy(activeSectorCounts);

    metrics["E2.9"] = metric(
      "E2.9",
      "RDP step-1 metrics: reassignment, preferred legality, drift, latitude bands, sector entropy",
      "computed",
      {
        reassignmentRate: rowsWithPreferred.length ? reassignedRows.length / rowsWithPreferred.length : null,
        rebalanceReassignedCount: rebalancedRows.length,
        preferredLegalityRate: plannedCount ? preferredLegalRows / plannedCount : null,
        plannedCount,
        assignedCount,
        finalPlacedCount,
        plannedToAssignedDrift: plannedCount ? (plannedCount - assignedCount) / plannedCount : null,
        assignedToFinalDrift: assignedCount ? (assignedCount - finalPlacedCount) / assignedCount : null,
        maxLatitudeBandOverrepresentation: overrepresentationValues.length
          ? Math.max(...overrepresentationValues)
          : null,
        sectorEntropy: entropy,
        sectorEntropyNormalized: maxEntropy > 0 ? entropy / maxEntropy : null,
      },
      {
        detail: { latitudeBands: bands.filter((band) => band.landTiles > 0 || band.placedCount > 0) },
        note:
          "preferredLegalityRate is evaluated with the mock adapter's static policy legality (Resource_ValidBiomes emulation) on the final surface.",
      }
    );
  }

  // --- E3.1 / E3.2 / E3.3 start support ----------------------------------------------------------------------------
  {
    const placedPlots = new Set(placed.map((outcome) => outcome.plotIndex));
    const perStartCounts: number[] = [];
    for (const plotIndex of startPlots) {
      const around = getHexRadiusIndicesOddQ(plotIndex, width, height, START_SUPPORT_RADIUS_TILES);
      let count = 0;
      for (const idx of around) if (placedPlots.has(idx)) count++;
      perStartCounts.push(count);
    }
    const minPerStart = perStartCounts.length ? Math.min(...perStartCounts) : null;
    const maxPerStart = perStartCounts.length ? Math.max(...perStartCounts) : null;
    metrics["E3.1"] = metric("E3.1", "Resources within radius 4 of each start >= 2", "computed", {
      minResourcesPerStart: minPerStart,
      meanResourcesPerStart: mean(perStartCounts),
      startsBelowFloor: perStartCounts.filter((count) => count < START_SUPPORT_FLOOR).length,
      startsTotal: perStartCounts.length,
    }, { detail: perStartCounts });
    metrics["E3.2"] = metric("E3.2", "Start support equity: max-min per-player count <= 2", "computed", {
      maxMinGap: minPerStart != null && maxPerStart != null ? maxPerStart - minPerStart : null,
    });
    metrics["E3.3"] = metric("E3.3", "Support guarantee holds across seeds (20/20)", "computed", {
      guaranteeHolds: minPerStart != null && minPerStart >= START_SUPPORT_FLOOR,
    }, { note: "Aggregate trueCount across seeds gives the N/N guarantee rate." });
  }

  // --- E3.4 / E4.* -----------------------------------------------------------------------------------------------------
  metrics["E3.4"] = metric("E3.4", "Sparsity expressible at knob max", "pending-s3", {}, {
    note: "Sparsity knob does not exist yet; declared in the S3 knob surface.",
  });
  metrics["E4.1"] = metric("E4.1", "Studio seats == live seats", "requires-live-engine", {}, {
    note: "Needs a same-seed live run via civ7 game (milestone boundary proof).",
  });
  metrics["E4.2"] = metric("E4.2", "Every placement product step has viz", "requires-studio-dump", {}, {
    note: "Measured by browser-runner dump inspection, not this harness.",
  });
  metrics["E4.3"] = metric("E4.3", "Viz shows decision substance", "requires-studio-dump", {}, {
    note: "Measured by browser-runner dump inspection, not this harness.",
  });
  metrics["E4.4"] = metric("E4.4", "Mock canHaveResource vs live engine >= 95% agreement", "requires-live-engine", {}, {
    note: "Needs live `civ7 game map` probes at a milestone boundary.",
  });

  return metrics;
}

export function aggregatePlacementMetrics(runs: readonly PlacementMetricsRun[]): PlacementMetricsAggregate {
  const metricIds = runs.length ? Object.keys(runs[0]!.metrics) : [];
  const metrics: PlacementMetricsAggregate["metrics"] = {};

  for (const id of metricIds) {
    const first = runs[0]!.metrics[id]!;
    const summary: PlacementMetricsAggregate["metrics"][string]["summary"] = {};
    for (const key of Object.keys(first.summary)) {
      const numericValues: number[] = [];
      let trueCount = 0;
      let sawBoolean = false;
      for (const run of runs) {
        const value = run.metrics[id]?.summary[key];
        if (typeof value === "number" && Number.isFinite(value)) numericValues.push(value);
        if (typeof value === "boolean") {
          sawBoolean = true;
          if (value) trueCount++;
        }
      }
      summary[key] = {
        mean: mean(numericValues),
        min: numericValues.length ? Math.min(...numericValues) : null,
        max: numericValues.length ? Math.max(...numericValues) : null,
        ...(sawBoolean ? { trueCount } : {}),
      };
    }
    metrics[id] = {
      id,
      expectation: first.expectation,
      status: first.status,
      ...(first.note ? { note: first.note } : {}),
      summary,
    };
  }

  return {
    schemaVersion: PLACEMENT_METRICS_SCHEMA_VERSION,
    runCount: runs.length,
    seeds: runs.map((run) => run.options.seed),
    metrics,
  };
}
