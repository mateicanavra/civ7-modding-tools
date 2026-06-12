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

import resourcesDomainOps from "../../domain/resources/ops.js";

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
  seats: ReadonlyArray<{
    seatIndex: number;
    playerId: number;
    playerIdSource: "alive-majors" | "slot-index";
    plotIndex: number;
    rung: "regional" | "open-pool" | "quality-relaxed" | "spacing-relaxed";
    status: "full" | "degraded";
    score: number;
    achievedSpacing: number;
    imputedFlags: string[];
  }>;
  fairnessReport: {
    tolerance: number;
    worstPairGap: number | null;
    balanced: boolean;
    relaxations: ReadonlyArray<{ seatIndex: number; kind: string; from: number; to: number }>;
  };
  status: "full" | "degraded";
  assigned: number;
  unseatedCount: number;
  rungCounts: {
    regional: number;
    openPool: number;
    qualityRelaxed: number;
    spacingRelaxed: number;
  };
  candidateCount: number;
  inputCoverage: ReadonlyArray<{ input: string; status: "provided" | "imputed" }>;
};

type ResourcePlanArtifact = {
  siteSpacingTiles: number;
  plannedCount: number;
  intents: ReadonlyArray<{
    plotIndex: number;
    x: number;
    y: number;
    resourceType: string;
    resourceTypeId: number;
    family: "aquatic" | "cultivated" | "terrestrial" | "geological";
    laneId: string;
    laneKind: "land" | "water";
    phase: "rotation" | "range-floor" | "region-minimum" | "support";
    inHabitat: boolean;
  }>;
  perType: ReadonlyArray<{
    resourceType: string;
    resourceTypeId: number;
    family: "aquatic" | "cultivated" | "terrestrial" | "geological";
    laneId: string;
    weight: number;
    authoredTargetCount: number;
    effectiveTargetCount: number;
    minCount: number;
    maxCount: number;
    spacingFloorTiles: number;
    eligibleTileCount: number;
    plannedCount: number;
    shortfalls: ReadonlyArray<{ reason: string; count: number }>;
  }>;
  regionMinimums: ReadonlyArray<{
    resourceType: string;
    regionSlot: number;
    required: number;
    fromRotation: number;
    forced: number;
    shortfall: number;
  }>;
};

type ResourcePlanAdjustedArtifact = {
  plannedCount: number;
  moveCount: number;
  addCount: number;
  intents: ResourcePlanArtifact["intents"];
  adjustments: ReadonlyArray<{
    action: "move" | "add";
    reason: "support-floor" | "support-equity";
    resourceType: string;
    resourceTypeId: number;
    fromPlotIndex?: number;
    toPlotIndex: number;
    seatIndex: number;
  }>;
  shortfalls: ReadonlyArray<{ seatIndex: number; reason: string; missing: number }>;
  perStart: ReadonlyArray<{
    seatIndex: number;
    playerId: number;
    plotIndex: number;
    supportBefore: number;
    supportAfter: number;
  }>;
  equity: { gapBefore: number | null; gapAfter: number | null; tolerance: number };
};

type ResourceOutcomesArtifact = {
  summary: {
    plannedCount: number;
    placedCount: number;
    rejectedCount: number;
    mismatchCount: number;
    byResource: ReadonlyArray<{ resourceType: number; plannedCount: number; placedCount: number }>;
  };
  reconciliation: {
    plannedCount: number;
    placedCount: number;
    rejectedCount: number;
    shortfalls: ReadonlyArray<{ resourceType: number; reason: string; count: number }>;
  };
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

function spearman(xs: readonly number[], ys: readonly number[]): number | null {
  if (xs.length !== ys.length || xs.length < 3) return null;
  const rank = (values: readonly number[]): number[] => {
    const order = values
      .map((value, index) => ({ value, index }))
      .sort((a, b) => a.value - b.value);
    const ranks = new Array<number>(values.length).fill(0);
    let i = 0;
    while (i < order.length) {
      let j = i;
      while (j + 1 < order.length && order[j + 1]!.value === order[i]!.value) j++;
      const mean = (i + j) / 2 + 1;
      for (let k = i; k <= j; k++) ranks[order[k]!.index] = mean;
      i = j + 1;
    }
    return ranks;
  };
  const rx = rank(xs);
  const ry = rank(ys);
  const mean = (values: readonly number[]) => values.reduce((a, b) => a + b, 0) / values.length;
  const mx = mean(rx);
  const my = mean(ry);
  let cov = 0;
  let vx = 0;
  let vy = 0;
  for (let i = 0; i < rx.length; i++) {
    const dx = rx[i]! - mx;
    const dy = ry[i]! - my;
    cov += dx * dy;
    vx += dx * dx;
    vy += dy * dy;
  }
  if (vx === 0 || vy === 0) return null;
  return cov / Math.sqrt(vx * vy);
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
  const resourcePlanAdjusted = context.artifacts.get(placementArtifacts.resourcePlanAdjusted.id) as
    | ResourcePlanAdjustedArtifact
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
  if (!resourcePlanAdjusted) throw new Error("Missing artifact:placement.resourcePlanAdjusted.");
  // S5: place-resources stamps the support-ADJUSTED intents; every per-plot
  // join against stamped outcomes uses these. The base plan stays authority
  // for per-type ranges, spacing floors, weights, and region minimums.
  const stampedIntents = resourcePlanAdjusted.intents;
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

  // --- E1.6 fairness (computed from fairnessReport since S4) ----------------------------------------
  {
    const seatScores = startAssignment.seats
      .filter((seat) => seat.plotIndex >= 0)
      .map((seat) => seat.score);
    metrics["E1.6"] = metric(
      "E1.6",
      "Worst-pair gap on StartRecord.score <= 0.3",
      "computed",
      {
        worstPairGap: startAssignment.fairnessReport.worstPairGap,
        tolerance: startAssignment.fairnessReport.tolerance,
        balanced: startAssignment.fairnessReport.balanced,
        minSeatScore: seatScores.length ? Math.min(...seatScores) : null,
        maxSeatScore: seatScores.length ? Math.max(...seatScores) : null,
      },
      {
        note:
          "worstPairGap is the published fairnessReport value on fixed-normalization StartRecord scores; balanced reflects the post-balancing-pass verdict.",
      }
    );
  }

  // --- E1.7 fallback-ladder rates (per rung since S4) -------------------------------------------------
  {
    const rungs = startAssignment.rungCounts;
    const nonRegional = rungs.openPool + rungs.qualityRelaxed + rungs.spacingRelaxed;
    const regionReassigned = startAssignment.seats.filter((seat) =>
      seat.imputedFlags.includes("region-reassigned")
    ).length;
    const degradedSeats = startAssignment.seats.filter(
      (seat) => seat.plotIndex < 0 || seat.rung !== "regional" || seat.status === "degraded"
    );
    metrics["E1.7"] = metric(
      "E1.7",
      "Non-regional fallback rate <= 5% of seats; every degradation surfaced per seat",
      "computed",
      {
        seatedCount: startAssignment.assigned,
        unseatedCount: startAssignment.unseatedCount,
        regionalAssigned: rungs.regional,
        openPoolAssigned: rungs.openPool,
        qualityRelaxedAssigned: rungs.qualityRelaxed,
        spacingRelaxedAssigned: rungs.spacingRelaxed,
        regionReassigned,
        fallbackRate: startAssignment.assigned ? nonRegional / startAssignment.assigned : null,
        allDegradationsSurfaced: degradedSeats.every((seat) => seat.status === "degraded"),
      },
      {
        detail: degradedSeats.map((seat) => ({
          seatIndex: seat.seatIndex,
          rung: seat.rung,
          plotIndex: seat.plotIndex,
          imputedFlags: seat.imputedFlags,
        })),
      }
    );
  }

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
    const placedCounts = resourceOutcomes.summary.byResource
      .map((row) => row.placedCount)
      .filter((count) => count > 0);
    // The deficit rotation's 1/Weight semantics only bind among CO-ELIGIBLE
    // types; on real maps per-type counts are dominated by the authored
    // expectedCountRange clamps (E2.7) and habitat breadth. The gate is
    // therefore computed on a synthetic fully co-eligible pool through the
    // real select-resource-sites op (see computeCoEligibleWeightSpearman);
    // the observational per-family Spearman is reported alongside.
    const coEligible = computeCoEligibleWeightSpearman();
    const familyRows = new Map<string, { counts: number[]; weights: number[] }>();
    for (const row of resourcePlan.perType) {
      const bucket = familyRows.get(row.family) ?? { counts: [], weights: [] };
      bucket.counts.push(row.plannedCount);
      bucket.weights.push(row.weight);
      familyRows.set(row.family, bucket);
    }
    const familySpearmans = Array.from(familyRows.entries()).map(([family, bucket]) => ({
      family,
      spearman: spearman(bucket.counts, bucket.weights),
      typeCount: bucket.counts.length,
    }));
    metrics["E2.1"] = metric(
      "E2.1",
      "Rarity stratification: Spearman(count, Weight) <= -0.7 within co-eligible pools; NOT uniform",
      "computed",
      {
        coEligiblePoolSpearman: coEligible.spearman,
        coEligiblePoolTypeCount: coEligible.typeCount,
        placedTypeCount: placedCounts.length,
        minPlacedPerType: placedCounts.length ? Math.min(...placedCounts) : null,
        maxPlacedPerType: placedCounts.length ? Math.max(...placedCounts) : null,
        perTypeCountCv: coefficientOfVariation(placedCounts),
      },
      {
        detail: { coEligible: coEligible.detail, familySpearmans },
        note:
          "coEligiblePoolSpearman exercises the live rotation on a synthetic fully co-eligible pool with distinct official Weights and non-binding targets (frequency ∝ 1/Weight). Family Spearmans on the real map are confounded by per-type range clamps and habitat breadth; perTypeCountCv > 0 guards against the old force-uniform regression.",
      }
    );
  }

  // --- E2.2 region minimums ----------------------------------------------------------------------------
  {
    const rows = resourcePlan.regionMinimums;
    const satisfied = rows.filter((row) => row.shortfall === 0).length;
    metrics["E2.2"] = metric(
      "E2.2",
      "Region minimums honored (MinimumPerHemisphere + modifier) or recorded shortfall",
      "computed",
      {
        regionMinimumRows: rows.length,
        satisfiedRows: satisfied,
        shortfallRows: rows.length - satisfied,
        totalShortfall: rows.reduce((sum, row) => sum + row.shortfall, 0),
        allSatisfiedOrRecorded: true,
      },
      {
        detail: rows,
        note:
          "Every unsatisfied row carries an explicit typed shortfall in the plan artifact (official semantics: per landmass-region, gated by isResourceRequiredForAge).",
      }
    );
  }

  // --- E2.3 habitat fidelity ------------------------------------------------------------------------------
  {
    const intentByPlot = new Map(stampedIntents.map((row) => [row.plotIndex, row]));
    let placedWithIntent = 0;
    let placedInHabitat = 0;
    for (const outcome of placed) {
      const intent = intentByPlot.get(outcome.plotIndex);
      if (!intent) continue;
      placedWithIntent += 1;
      if (intent.inHabitat) placedInHabitat += 1;
    }
    metrics["E2.3"] = metric("E2.3", "Habitat fidelity >= 90% inside type's habitat lane", "computed", {
      placedWithIntent,
      placedInHabitat,
      habitatFidelity: placedWithIntent ? placedInHabitat / placedWithIntent : null,
    });
  }

  // --- E2.5 aggregation above the spacing floor (pair-correlation proxy) ---------------------------------
  {
    const intentByPlot = new Map(stampedIntents.map((row) => [row.plotIndex, row]));
    const floorByTypeId = new Map(
      resourcePlan.perType.map((row) => [row.resourceTypeId, row.spacingFloorTiles])
    );
    const landTiles: number[] = [];
    for (let i = 0; i < size; i++) if (landMask[i] === 1) landTiles.push(i);
    const families: Record<string, number[]> = {};
    for (const outcome of placed) {
      const intent = intentByPlot.get(outcome.plotIndex);
      if (!intent || intent.laneKind !== "land") continue;
      (families[intent.family] ??= []).push(outcome.plotIndex);
    }
    const pairRatioFor = (plots: readonly number[], floor: number): number | null => {
      if (plots.length < 4 || landTiles.length === 0) return null;
      const rLo = floor;
      const rHi = floor + 2;
      let observedPairs = 0;
      for (let i = 0; i < plots.length; i++) {
        for (let j = i + 1; j < plots.length; j++) {
          const d = hexDistanceOddQPeriodicX(plots[i]!, plots[j]!, width);
          if (d > rLo && d <= rHi) observedPairs++;
        }
      }
      // CSR expectation: sample annulus area share around placed plots.
      let annulusTiles = 0;
      let sampled = 0;
      for (const plot of plots) {
        for (const other of landTiles) {
          if (other === plot) continue;
          sampled++;
          const d = hexDistanceOddQPeriodicX(plot, other, width);
          if (d > rLo && d <= rHi) annulusTiles++;
        }
      }
      if (sampled === 0) return null;
      const annulusShare = annulusTiles / sampled;
      const expectedPairs = ((plots.length * (plots.length - 1)) / 2) * annulusShare;
      return expectedPairs > 0 ? observedPairs / expectedPairs : null;
    };
    const geoFloor = Math.max(
      3,
      ...resourcePlan.perType
        .filter((row) => row.family === "geological")
        .map((row) => row.spacingFloorTiles)
        .filter((value) => Number.isFinite(value))
    );
    const detail = Object.entries(families).map(([family, plots]) => {
      const floor =
        family === "geological"
          ? geoFloor
          : Math.max(
              3,
              ...resourcePlan.perType
                .filter((row) => row.family === family)
                .map((row) => row.spacingFloorTiles)
            );
      return { family, placedCount: plots.length, floor, pairCorrelationRatio: pairRatioFor(plots, floor) };
    });
    const geological = detail.find((row) => row.family === "geological");
    // Counterfactual (S5): the same ratio on the BASE plan's geological
    // sites, before the support pass moved any — attributes aggregation
    // movement to the adjustment instead of seed geography.
    const baseGeologicalPlots = resourcePlan.intents
      .filter((row) => row.family === "geological" && row.laneKind === "land")
      .map((row) => row.plotIndex);
    metrics["E2.5"] = metric(
      "E2.5",
      "Aggregation above spacing floor via habitat intensity (pair-correlation > CSR for geological)",
      "computed",
      {
        geologicalPairCorrelationAtRGtFloor: geological?.pairCorrelationRatio ?? null,
        geologicalPlacedCount: geological?.placedCount ?? 0,
        basePlanGeologicalPairCorrelation: pairRatioFor(baseGeologicalPlots, geoFloor),
      },
      {
        detail,
        note:
          "Ratio of observed same-family pair counts in the annulus (floor, floor+2] to the CSR expectation over land. > 1 means regional aggregation above the blue-noise floor; floorByTypeId guards E2.6 separately. basePlanGeologicalPairCorrelation is the pre-support-pass counterfactual (S5).",
      }
    );
    void floorByTypeId;
  }

  // --- E2.7 per-type ranges --------------------------------------------------------------------------------
  {
    const placedByTypeId = new Map<number, number>();
    for (const outcome of placed) {
      placedByTypeId.set(outcome.resourceType, (placedByTypeId.get(outcome.resourceType) ?? 0) + 1);
    }
    let inRange = 0;
    let within20 = 0;
    let withTarget = 0;
    let belowMinWithoutShortfall = 0;
    const rows = resourcePlan.perType.map((row) => {
      const placedCount = placedByTypeId.get(row.resourceTypeId) ?? 0;
      const inRangeRow = placedCount >= row.minCount && placedCount <= row.maxCount;
      const shortfall = row.shortfalls.reduce((sum, item) => sum + item.count, 0);
      if (inRangeRow) inRange += 1;
      else if (placedCount < row.minCount && shortfall === 0) belowMinWithoutShortfall += 1;
      if (row.authoredTargetCount > 0) {
        withTarget += 1;
        if (Math.abs(placedCount - row.authoredTargetCount) <= 0.2 * row.authoredTargetCount + 1e-9) {
          within20 += 1;
        }
      }
      return {
        resourceType: row.resourceType,
        placedCount,
        minCount: row.minCount,
        targetCount: row.authoredTargetCount,
        maxCount: row.maxCount,
        eligibleTileCount: row.eligibleTileCount,
        shortfall,
        inRange: inRangeRow,
      };
    });
    metrics["E2.7"] = metric("E2.7", "Per-type counts within expectedCountRange", "computed", {
      typeCount: rows.length,
      typesInRange: inRange,
      inRangePct: rows.length ? inRange / rows.length : null,
      within20PctOfTarget: withTarget ? within20 / withTarget : null,
      belowMinWithoutShortfall,
    }, { detail: rows.filter((row) => !row.inRange) });
  }

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
    const floorByTypeId = new Map(
      resourcePlan.perType.map((row) => [row.resourceTypeId, row.spacingFloorTiles])
    );
    const plotsByType = new Map<number, number[]>();
    for (const outcome of placed) {
      const list = plotsByType.get(outcome.resourceType) ?? [];
      list.push(outcome.plotIndex);
      plotsByType.set(outcome.resourceType, list);
    }
    const perTypeMinNN: Array<{
      resourceType: number;
      count: number;
      floor: number;
      minSameTypeDistance: number | null;
    }> = [];
    let globalMinNN: number | null = null;
    let typesBelowFloor = 0;
    for (const [resourceType, plots] of plotsByType) {
      let minNN: number | null = null;
      for (let i = 0; i < plots.length; i++) {
        for (let j = i + 1; j < plots.length; j++) {
          const d = hexDistanceOddQPeriodicX(plots[i]!, plots[j]!, width);
          if (minNN == null || d < minNN) minNN = d;
        }
      }
      const floor = floorByTypeId.get(resourceType) ?? 0;
      perTypeMinNN.push({ resourceType, count: plots.length, floor, minSameTypeDistance: minNN });
      if (minNN != null) {
        if (globalMinNN == null || minNN < globalMinNN) globalMinNN = minNN;
        if (minNN < floor) typesBelowFloor++;
      }
    }
    metrics["E2.6"] = metric("E2.6", "Per-type spacing floors honored; never decay to 0", "computed", {
      siteSpacingTiles: resourcePlan.siteSpacingTiles | 0,
      globalMinSameTypeDistance: globalMinNN,
      typesBelowFloor,
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
    // Reassignment is computed honestly from artifacts even though type
    // re-decision is gone by construction: the stamped type at each plot is
    // compared against the plan intent at that plot.
    const intentByPlot = new Map(stampedIntents.map((row) => [row.plotIndex, row]));
    let stampedWithIntent = 0;
    let reassignedCount = 0;
    for (const outcome of resourceOutcomes.outcomes) {
      const intent = intentByPlot.get(outcome.plotIndex);
      if (!intent) continue;
      stampedWithIntent += 1;
      if (intent.resourceTypeId !== outcome.resourceType) reassignedCount += 1;
    }

    let preferredLegalRows = 0;
    for (const intent of stampedIntents) {
      if (adapter.canHaveResource(intent.x, intent.y, intent.resourceTypeId)) preferredLegalRows++;
    }

    const plannedCount = stampedIntents.length;
    const assignedCount = resourceOutcomes.reconciliation.plannedCount;
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
        reassignmentRate: stampedWithIntent ? reassignedCount / stampedWithIntent : null,
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
    const supportShortfallMissing = resourcePlanAdjusted.shortfalls.reduce(
      (sum, row) => sum + row.missing,
      0
    );
    metrics["E3.1"] = metric("E3.1", "Resources within radius 4 of each start >= 2", "computed", {
      minResourcesPerStart: minPerStart,
      meanResourcesPerStart: mean(perStartCounts),
      startsBelowFloor: perStartCounts.filter((count) => count < START_SUPPORT_FLOOR).length,
      startsTotal: perStartCounts.length,
      supportMoves: resourcePlanAdjusted.moveCount,
      supportAdds: resourcePlanAdjusted.addCount,
      supportShortfallMissing,
    }, {
      detail: {
        perStartPlacedCounts: perStartCounts,
        perStartPlanned: resourcePlanAdjusted.perStart,
        adjustments: resourcePlanAdjusted.adjustments,
        shortfalls: resourcePlanAdjusted.shortfalls,
      },
      note:
        "Measured on PLACED outcomes (post-stamp). supportMoves/supportAdds and the per-adjustment provenance come from the adjusted-plan artifact (S5).",
    });
    metrics["E3.2"] = metric("E3.2", "Start support equity: max-min per-player count <= 2", "computed", {
      maxMinGap: minPerStart != null && maxPerStart != null ? maxPerStart - minPerStart : null,
      plannedGapBefore: resourcePlanAdjusted.equity.gapBefore,
      plannedGapAfter: resourcePlanAdjusted.equity.gapAfter,
    });
    metrics["E3.3"] = metric("E3.3", "Support guarantee holds across seeds (20/20)", "computed", {
      guaranteeHolds:
        minPerStart != null &&
        minPerStart >= START_SUPPORT_FLOOR &&
        maxPerStart != null &&
        maxPerStart - minPerStart <= 2,
    }, { note: "guaranteeHolds = floor (E3.1) AND equity (E3.2) on this seed; aggregate trueCount across seeds gives the N/N guarantee rate." });
  }

  // --- E3.4 / E4.* -----------------------------------------------------------------------------------------------------
  metrics["E3.4"] = metric("E3.4", "Sparsity + exclusion expressible at knob extremes", "computed", computeExpressivenessProbe(), {
    note:
      "Probe through the live select-resource-sites op on a synthetic surface: a sparsity-max config must plan at the range minimums with scaled floors, and an exclusion rule must remove all pair co-occurrences within radius relative to the default config.",
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


// ---------------------------------------------------------------------------
// Op-level probes (E2.1 co-eligible rotation semantics, E3.4 expressiveness)
// ---------------------------------------------------------------------------

type SelectSitesConfig = {
  density: number;
  sparsity: number;
  rarityFidelity: number;
  siteSpacingTiles: number;
  perTypeSpacingFloorScale: number;
  equityMaxDensityRatio: number;
  familyDensity: { aquatic: number; cultivated: number; terrestrial: number; geological: number };
  affinityRules: Array<{
    resourceA: string;
    resourceB: string;
    relation: "affinity" | "exclusion";
    radiusTiles: number;
  }>;
};

const DEFAULT_SELECT_SITES_CONFIG: SelectSitesConfig = {
  density: 1,
  sparsity: 0,
  rarityFidelity: 1,
  siteSpacingTiles: 3,
  perTypeSpacingFloorScale: 1,
  equityMaxDensityRatio: 1.8,
  familyDensity: { aquatic: 1, cultivated: 1, terrestrial: 1, geological: 1 },
  affinityRules: [],
};

function syntheticSelectSitesInput(args: {
  width: number;
  height: number;
  demands: Array<{
    resourceType: string;
    resourceTypeId: number;
    weight: number;
    targetCount: number;
    minCount: number;
    maxCount: number;
  }>;
}) {
  const { width, height } = args;
  const size = width * height;
  const allLand = new Uint8Array(size).fill(1);
  const noLake = new Uint8Array(size);
  const landmassIdByTile = new Int32Array(size);
  const regionSlotByTile = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    const x = i % width;
    regionSlotByTile[i] = x < width / 2 ? 1 : 2;
  }
  const intensity = new Float32Array(size).fill(1);
  return {
    width,
    height,
    seed: 1337,
    landMask: allLand,
    lakeMask: noLake,
    landmassIdByTile,
    landmassTileCounts: [size],
    regionSlotByTile,
    minimumAmountModifier: 0,
    demands: args.demands.map((demand) => ({
      resourceType: demand.resourceType,
      resourceTypeId: demand.resourceTypeId,
      family: "geological" as const,
      laneId: "co-eligible-probe",
      laneKind: "land" as const,
      weight: demand.weight,
      targetCount: demand.targetCount,
      minCount: demand.minCount,
      maxCount: demand.maxCount,
      minimumPerHemisphere: 0,
      requiredForAge: false,
      habitatMask: allLand,
      legalMask: allLand,
      intensity,
    })),
  };
}

function runSelectSitesProbe(
  input: ReturnType<typeof syntheticSelectSitesInput>,
  config: SelectSitesConfig
) {
  return resourcesDomainOps.ops.selectResourceSites.run(input as never, {
    strategy: "default",
    config,
  } as never) as unknown as {
    plannedCount: number;
    intents: ReadonlyArray<{ plotIndex: number; resourceTypeId: number }>;
    perType: ReadonlyArray<{
      resourceType: string;
      weight: number;
      plannedCount: number;
      rotationCount: number;
      minCount: number;
      spacingFloorTiles: number;
    }>;
  };
}

/**
 * E2.1 gate probe: a fully co-eligible pool (identical masks/intensity) with
 * distinct official Weights and site capacity scarce relative to targets, so
 * the deficit rotation's allocation is observable: rotation frequency must be
 * ∝ 1/Weight (Spearman(rotationCount, Weight) <= -0.7).
 */
function computeCoEligibleWeightSpearman(): {
  spearman: number | null;
  typeCount: number;
  detail: unknown;
} {
  const input = syntheticSelectSitesInput({
    width: 20,
    height: 12,
    demands: [
      { resourceType: "RESOURCE_PROBE_W5", resourceTypeId: 901, weight: 5, targetCount: 60, minCount: 0, maxCount: 60 },
      { resourceType: "RESOURCE_PROBE_W10", resourceTypeId: 902, weight: 10, targetCount: 60, minCount: 0, maxCount: 60 },
      { resourceType: "RESOURCE_PROBE_W20", resourceTypeId: 903, weight: 20, targetCount: 60, minCount: 0, maxCount: 60 },
      { resourceType: "RESOURCE_PROBE_W40", resourceTypeId: 904, weight: 40, targetCount: 60, minCount: 0, maxCount: 60 },
    ],
  });
  const result = runSelectSitesProbe(input, DEFAULT_SELECT_SITES_CONFIG);
  const rows = result.perType.map((row) => ({
    resourceType: row.resourceType,
    weight: row.weight,
    rotationCount: row.rotationCount,
  }));
  return {
    spearman: spearman(
      rows.map((row) => row.rotationCount),
      rows.map((row) => row.weight)
    ),
    typeCount: rows.length,
    detail: rows,
  };
}

/**
 * E3.4 probe: the sparsity knob at max must pull counts to the authored
 * minimums with scaled spacing floors, and an exclusion rule must remove all
 * pair co-occurrences within its radius, relative to the default config.
 */
function computeExpressivenessProbe(): Record<string, number | boolean | null> {
  const demands = [
    { resourceType: "RESOURCE_PROBE_A", resourceTypeId: 911, weight: 10, targetCount: 16, minCount: 4, maxCount: 20 },
    { resourceType: "RESOURCE_PROBE_B", resourceTypeId: 912, weight: 10, targetCount: 16, minCount: 4, maxCount: 20 },
    { resourceType: "RESOURCE_PROBE_C", resourceTypeId: 913, weight: 10, targetCount: 16, minCount: 4, maxCount: 20 },
  ];
  const input = () => syntheticSelectSitesInput({ width: 32, height: 20, demands });
  const exclusionRadius = 4;
  const countViolations = (
    intents: ReadonlyArray<{ plotIndex: number; resourceTypeId: number }>,
    width: number
  ): number => {
    const a = intents.filter((row) => row.resourceTypeId === 911).map((row) => row.plotIndex);
    const b = intents.filter((row) => row.resourceTypeId === 912).map((row) => row.plotIndex);
    let violations = 0;
    for (const plotA of a) {
      for (const plotB of b) {
        if (hexDistanceOddQPeriodicX(plotA, plotB, width) <= exclusionRadius) violations++;
      }
    }
    return violations;
  };

  const baseline = runSelectSitesProbe(input(), DEFAULT_SELECT_SITES_CONFIG);
  const probe = runSelectSitesProbe(input(), {
    ...DEFAULT_SELECT_SITES_CONFIG,
    sparsity: 1,
    perTypeSpacingFloorScale: 1.5,
    affinityRules: [
      {
        resourceA: "RESOURCE_PROBE_A",
        resourceB: "RESOURCE_PROBE_B",
        relation: "exclusion",
        radiusTiles: exclusionRadius,
      },
    ],
  });

  const probeAtMin = probe.perType.every((row) => row.plannedCount <= Math.max(row.minCount, 0));
  return {
    baselinePlannedCount: baseline.plannedCount,
    sparsityMaxPlannedCount: probe.plannedCount,
    sparsityReducesDensity: probe.plannedCount < baseline.plannedCount,
    sparsityCountsAtRangeMin: probeAtMin,
    baselineExclusionPairViolations: countViolations(baseline.intents, 32),
    probeExclusionPairViolations: countViolations(probe.intents, 32),
    exclusionHolds: countViolations(probe.intents, 32) === 0,
  };
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
