import { clamp01 } from "@swooper/mapgen-core";
import { createStrategy } from "@swooper/mapgen-core/authoring";
import {
  getHexNeighborIndicesOddQ,
  getHexRadiusIndicesOddQ,
  hexDistanceOddQPeriodicX,
} from "@swooper/mapgen-core/lib/grid";

import {
  RIVER_CLASS_MAJOR,
  RIVER_CLASS_NONE,
  isAnyRiverClass,
} from "../../../../hydrology/index.js";
import PlanStartsContract from "../contract.js";
import {
  climateComfortAt,
  computeClimateComfortThresholds,
  isClimateExtreme,
} from "../policy/climate-comfort.js";
import { balanceFairness } from "../policy/fairness.js";
import { buildSeatIdentities } from "../policy/seat-identity.js";
import {
  compareSelectableTiles,
  runSelectionLadder,
  type RelaxationEntry,
  type SeatSelection,
  type SelectableTile,
  type StartComponents,
} from "../policy/selection-ladder.js";
import { indexSeatBiases, type SeatBiasContext } from "../policy/start-bias.js";

type StartTier = "primary" | "islandCluster" | "marginal";
type RejectionReason =
  | "water"
  | "lake"
  | "mountain"
  | "volcano"
  | "natural-wonder"
  | "single-tile-island"
  | "insufficient-landmass"
  | "insufficient-expansion"
  | "insufficient-island-cluster";

type InputCoverageRow = {
  input: string;
  status: "provided" | "imputed";
  affectsComponent: string;
};

type StartCandidate = SelectableTile & {
  landmassTiles: number;
  expansionLandTiles: number;
  nearbyClusterLandTiles: number;
  coastDistance: number;
};

const ZERO_COMPONENTS: StartComponents = {
  freshwater: 0,
  fertility: 0,
  expansion: 0,
  climate: 0,
  resource: 0,
  roughness: 0,
};

function emptyPlan(args: {
  playersLandmass1: number;
  playersLandmass2: number;
  spacingFloorTiles: number;
  desiredSpacingTiles: number;
  fairnessTolerance: number;
}) {
  const seats = buildSeatIdentities({
    playersWest: Math.max(0, args.playersLandmass1 | 0),
    playersEast: Math.max(0, args.playersLandmass2 | 0),
  }).map((seat) => ({
    seatIndex: seat.seatIndex,
    playerId: seat.playerId,
    playerIdSource: seat.playerIdSource,
    regionSlot: seat.regionSlot as number,
    plotIndex: -1,
    rung: "spacing-relaxed" as const,
    status: "degraded" as const,
    tier: "none" as const,
    score: 0,
    components: { ...ZERO_COMPONENTS },
    achievedSpacing: -1,
    imputedFlags: ["unseated"],
  }));
  return {
    playersLandmass1: args.playersLandmass1,
    playersLandmass2: args.playersLandmass2,
    spacingFloorTiles: args.spacingFloorTiles,
    desiredSpacingTiles: args.desiredSpacingTiles,
    width: 0,
    height: 0,
    candidateCount: 0,
    settleableTileCount: 0,
    rejectionCounts: [],
    tierCounts: { primary: 0, islandCluster: 0, marginal: 0 },
    scoreByTile: new Float32Array(0),
    tierByTile: new Uint8Array(0),
    candidates: [],
    seats,
    fairnessReport: {
      tolerance: args.fairnessTolerance,
      parity: [],
      worstPairGap: null,
      balanced: true,
      swaps: [],
      relaxations: [],
    },
    status: seats.length ? ("degraded" as const) : ("full" as const),
    inputCoverage: [],
  };
}

function requireLength<T extends { length: number }>(
  value: T | undefined,
  expected: number,
  label: string
): T {
  if (!value || value.length !== expected) {
    throw new Error(`[Placement] Invalid ${label} for placement/plan-starts.`);
  }
  return value;
}

function addRejection(counts: Map<RejectionReason, number>, reason: RejectionReason): void {
  counts.set(reason, (counts.get(reason) ?? 0) + 1);
}

function getLandmassTiles(
  landmassIdByTile: Int32Array,
  landmassTileCounts: readonly number[] | undefined,
  plotIndex: number
): number {
  const landmassId = landmassIdByTile[plotIndex] ?? -1;
  if (landmassId < 0) return 0;
  const count = landmassTileCounts?.[landmassId];
  return typeof count === "number" && Number.isFinite(count) ? Math.max(0, count | 0) : 0;
}

function countSameLandWithinRadius(args: {
  center: number;
  width: number;
  height: number;
  radius: number;
  landMask: Uint8Array;
  landmassIdByTile: Int32Array;
}): number {
  const targetLandmass = args.landmassIdByTile[args.center] ?? -1;
  if (targetLandmass < 0) return 0;
  let count = 0;
  for (const idx of getHexRadiusIndicesOddQ(args.center, args.width, args.height, args.radius)) {
    if ((args.landMask[idx] ?? 0) !== 1) continue;
    if ((args.landmassIdByTile[idx] ?? -1) !== targetLandmass) continue;
    count++;
  }
  return count;
}

function countLandWithinRadius(args: {
  center: number;
  width: number;
  height: number;
  radius: number;
  landMask: Uint8Array;
}): number {
  let count = 0;
  for (const idx of getHexRadiusIndicesOddQ(args.center, args.width, args.height, args.radius)) {
    if ((args.landMask[idx] ?? 0) === 1) count++;
  }
  return count;
}

function averageFloatWithinRadius(args: {
  center: number;
  width: number;
  height: number;
  radius: number;
  values?: Float32Array;
  fallback: number;
  /** When provided, only tiles with mask==1 contribute (e.g. land-only fertility, the E1.4 frame). */
  mask?: Uint8Array;
}): number {
  if (!args.values) return args.fallback;
  let sum = 0;
  let count = 0;
  for (const idx of getHexRadiusIndicesOddQ(args.center, args.width, args.height, args.radius)) {
    if (args.mask && (args.mask[idx] ?? 0) !== 1) continue;
    sum += args.values[idx] ?? args.fallback;
    count++;
  }
  return count > 0 ? sum / count : args.fallback;
}

function freshwaterScore(args: {
  plotIndex: number;
  width: number;
  height: number;
  riverClass?: Uint8Array;
  lakeMask?: Uint8Array;
}): number {
  const riverHere = clamp01(
    (args.riverClass?.[args.plotIndex] ?? RIVER_CLASS_NONE) / RIVER_CLASS_MAJOR
  );
  let adjacentWater = 0;
  const y = (args.plotIndex / args.width) | 0;
  const x = args.plotIndex - y * args.width;
  for (const neighbor of getHexNeighborIndicesOddQ(x, y, args.width, args.height)) {
    if (isAnyRiverClass(args.riverClass?.[neighbor])) adjacentWater = Math.max(adjacentWater, 0.8);
    if ((args.lakeMask?.[neighbor] ?? 0) === 1) adjacentWater = Math.max(adjacentWater, 0.7);
  }
  return clamp01(Math.max(riverHere, adjacentWater));
}

function roughnessPenalty(args: {
  plotIndex: number;
  width: number;
  height: number;
  elevation?: Int16Array;
  roughnessDivisor: number;
}): number {
  if (!args.elevation) return 0;
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const idx of getHexRadiusIndicesOddQ(args.plotIndex, args.width, args.height, 1)) {
    const elevation = args.elevation[idx] ?? 0;
    if (elevation < min) min = elevation;
    if (elevation > max) max = elevation;
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return 0;
  return clamp01((max - min) / Math.max(1, args.roughnessDivisor));
}

function buildResourceSupport(args: {
  width: number;
  height: number;
  radius: number;
  plannedResourcePlotIndices?: readonly number[];
}): Uint8Array | undefined {
  if (!args.plannedResourcePlotIndices?.length || args.radius <= 0) return undefined;
  const size = Math.max(0, args.width * args.height);
  const counts = new Uint16Array(size);
  let maxCount = 0;
  for (const raw of args.plannedResourcePlotIndices) {
    const plotIndex = raw | 0;
    if (plotIndex < 0 || plotIndex >= size) continue;
    for (const idx of getHexRadiusIndicesOddQ(plotIndex, args.width, args.height, args.radius)) {
      counts[idx] += 1;
      if (counts[idx] > maxCount) maxCount = counts[idx];
    }
  }
  if (maxCount <= 0) return undefined;
  const support = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    support[i] = Math.round(clamp01((counts[i] ?? 0) / maxCount) * 255);
  }
  return support;
}

function classifyCandidate(args: {
  landmassTiles: number;
  expansionLandTiles: number;
  nearbyClusterLandTiles: number;
  coastDistance: number;
  minContiguousLandTiles: number;
  minExpansionLandTiles: number;
  minIslandClusterLandTiles: number;
  maxIslandStartCoastDistance: number;
  marginalLandRatio: number;
  marginalExpansionRatio: number;
}): StartTier | null {
  if (args.landmassTiles <= 1) return null;
  if (
    args.landmassTiles >= args.minContiguousLandTiles &&
    args.expansionLandTiles >= args.minExpansionLandTiles
  ) {
    return "primary";
  }
  if (
    args.nearbyClusterLandTiles >= args.minIslandClusterLandTiles &&
    args.coastDistance <= args.maxIslandStartCoastDistance
  ) {
    return "islandCluster";
  }
  if (
    args.landmassTiles >= Math.ceil(args.minContiguousLandTiles * args.marginalLandRatio) &&
    args.expansionLandTiles >= Math.ceil(args.minExpansionLandTiles * args.marginalExpansionRatio)
  ) {
    return "marginal";
  }
  return null;
}

function rejectReason(args: {
  landmassTiles: number;
  expansionLandTiles: number;
  nearbyClusterLandTiles: number;
  minContiguousLandTiles: number;
  minExpansionLandTiles: number;
  minIslandClusterLandTiles: number;
}): RejectionReason {
  if (args.landmassTiles <= 1) return "single-tile-island";
  if (args.landmassTiles < args.minContiguousLandTiles) {
    return args.nearbyClusterLandTiles < args.minIslandClusterLandTiles
      ? "insufficient-island-cluster"
      : "insufficient-landmass";
  }
  if (args.expansionLandTiles < args.minExpansionLandTiles) return "insufficient-expansion";
  return "insufficient-island-cluster";
}

/**
 * Percentile rank of each value among all values (average rank for ties),
 * used to spread fertility into a discriminating 0..1 component
 * (land-rank-relative, the S3 precedent for uncalibrated pipeline fields).
 */
function percentileRanks(values: readonly number[]): number[] {
  const order = values
    .map((value, index) => ({ value, index }))
    .sort((a, b) => a.value - b.value || a.index - b.index);
  const ranks = new Array<number>(values.length).fill(0.5);
  if (values.length <= 1) return ranks;
  let i = 0;
  while (i < order.length) {
    let j = i;
    while (j + 1 < order.length && order[j + 1]!.value === order[i]!.value) j++;
    const rank = ((i + j) / 2) / (order.length - 1);
    for (let k = i; k <= j; k++) ranks[order[k]!.index] = rank;
    i = j + 1;
  }
  return ranks;
}

export const defaultStrategy = createStrategy(PlanStartsContract, "default", {
  run: (input, config) => {
    const playersLandmass1 = Math.max(
      0,
      (config.overrides?.playersLandmass1 ?? input.baseStarts.playersLandmass1) | 0
    );
    const playersLandmass2 = Math.max(
      0,
      (config.overrides?.playersLandmass2 ?? input.baseStarts.playersLandmass2) | 0
    );
    const spacingFloorTiles = Math.max(0, config.spacingFloorTiles | 0);
    const desiredSpacingTiles = Math.max(spacingFloorTiles, config.desiredSpacingTiles | 0);

    const width = Math.max(0, input.width ?? 0) | 0;
    const height = Math.max(0, input.height ?? 0) | 0;
    const size = Math.max(0, width * height);
    if (width <= 0 || height <= 0 || size <= 0) {
      return emptyPlan({
        playersLandmass1,
        playersLandmass2,
        spacingFloorTiles,
        desiredSpacingTiles,
        fairnessTolerance: config.fairnessTolerance,
      });
    }

    const landMask = requireLength(input.landMask, size, "landMask");
    const slotByTile = requireLength(input.slotByTile, size, "slotByTile");
    const landmassIdByTile = requireLength(input.landmassIdByTile, size, "landmassIdByTile");

    // --- input coverage assertions (never silently neutral-defaulted) ---------------------
    const inputCoverage: InputCoverageRow[] = [];
    const imputedComponents = new Set<string>();
    const covered = <T extends { length: number }>(
      value: T | undefined,
      inputName: string,
      affectsComponent: string
    ): T | undefined => {
      const ok = Boolean(value && value.length === size);
      inputCoverage.push({
        input: inputName,
        status: ok ? "provided" : "imputed",
        affectsComponent,
      });
      if (!ok) imputedComponents.add(affectsComponent);
      return ok ? value : undefined;
    };

    const lakeMask = covered(input.lakeMask, "lakeMask", "freshwater");
    const coastalLand = covered(input.coastalLand, "coastalLand", "expansion");
    const distanceToCoast = covered(input.distanceToCoast, "distanceToCoast", "expansion");
    const elevation = covered(input.elevation, "elevation", "roughness");
    const fertility = covered(input.fertility, "fertility", "fertility");
    const effectiveMoisture = covered(input.effectiveMoisture, "effectiveMoisture", "climate");
    const surfaceTemperature = covered(input.surfaceTemperature, "surfaceTemperature", "climate");
    const aridityIndex = covered(input.aridityIndex, "aridityIndex", "climate");
    const riverClass = covered(input.riverClass, "riverClass", "freshwater");
    const mountainMask = covered(input.mountainMask, "mountainMask", "expansion");
    const volcanoMask = covered(input.volcanoMask, "volcanoMask", "expansion");
    void effectiveMoisture;

    const naturalWonderPlots = new Set<number>();
    for (const raw of input.naturalWonderPlotIndices ?? []) {
      const plotIndex = raw | 0;
      if (plotIndex >= 0 && plotIndex < size) naturalWonderPlots.add(plotIndex);
    }
    const resourceSupport =
      (input.resourceSupport && input.resourceSupport.length === size
        ? input.resourceSupport
        : undefined) ??
      buildResourceSupport({
        width,
        height,
        radius: Math.max(0, config.resourceSupportRadiusTiles | 0),
        plannedResourcePlotIndices: input.plannedResourcePlotIndices,
      });

    const climateThresholds = computeClimateComfortThresholds({
      landMask,
      aridityIndex,
      surfaceTemperature,
    });
    if (!climateThresholds) imputedComponents.add("climate");

    const scoreByTile = new Float32Array(size);
    const tierByTile = new Uint8Array(size);
    const rejectionCounts = new Map<RejectionReason, number>();
    const tierCounts = { primary: 0, islandCluster: 0, marginal: 0 };

    const minContiguousLandTiles = Math.max(1, config.minContiguousLandTiles | 0);
    const minExpansionLandTiles = Math.max(1, config.minExpansionLandTiles | 0);
    const minIslandClusterLandTiles = Math.max(1, config.minIslandClusterLandTiles | 0);
    const expansionRadiusTiles = Math.max(1, config.expansionRadiusTiles | 0);
    const islandClusterRadiusTiles = Math.max(1, config.islandClusterRadiusTiles | 0);
    const maxIslandStartCoastDistance = Math.max(0, config.maxIslandStartCoastDistance | 0);

    // --- pass 1: hard screens, envelope measurement, tier classification ------------------
    type SettleableTile = {
      plotIndex: number;
      regionSlot: 1 | 2;
      tier: StartTier | null;
      landmassTiles: number;
      expansionLandTiles: number;
      nearbyClusterLandTiles: number;
      coastDistance: number;
      fertilityRaw: number;
    };
    const settleable: SettleableTile[] = [];

    for (let plotIndex = 0; plotIndex < size; plotIndex++) {
      if ((landMask[plotIndex] ?? 0) !== 1) {
        addRejection(rejectionCounts, "water");
        continue;
      }
      if ((lakeMask?.[plotIndex] ?? 0) === 1) {
        addRejection(rejectionCounts, "lake");
        tierByTile[plotIndex] = 1;
        continue;
      }
      if ((mountainMask?.[plotIndex] ?? 0) === 1) {
        addRejection(rejectionCounts, "mountain");
        tierByTile[plotIndex] = 1;
        continue;
      }
      if ((volcanoMask?.[plotIndex] ?? 0) === 1) {
        addRejection(rejectionCounts, "volcano");
        tierByTile[plotIndex] = 1;
        continue;
      }
      if (naturalWonderPlots.has(plotIndex)) {
        addRejection(rejectionCounts, "natural-wonder");
        tierByTile[plotIndex] = 1;
        continue;
      }
      const regionSlot =
        slotByTile[plotIndex] === 1 || slotByTile[plotIndex] === 2
          ? (slotByTile[plotIndex] as 1 | 2)
          : null;
      if (!regionSlot) {
        addRejection(rejectionCounts, "insufficient-landmass");
        tierByTile[plotIndex] = 1;
        continue;
      }

      const landmassTiles = getLandmassTiles(landmassIdByTile, input.landmassTileCounts, plotIndex);
      const expansionLandTiles = countSameLandWithinRadius({
        center: plotIndex,
        width,
        height,
        radius: expansionRadiusTiles,
        landMask,
        landmassIdByTile,
      });
      const nearbyClusterLandTiles = countLandWithinRadius({
        center: plotIndex,
        width,
        height,
        radius: islandClusterRadiusTiles,
        landMask,
      });
      const coastDistance = Math.max(
        0,
        distanceToCoast
          ? (distanceToCoast[plotIndex] ?? 0)
          : coastalLand
            ? coastalLand[plotIndex] === 1
              ? 0
              : maxIslandStartCoastDistance + 1
            : 0
      );
      const tier = classifyCandidate({
        landmassTiles,
        expansionLandTiles,
        nearbyClusterLandTiles,
        coastDistance,
        minContiguousLandTiles,
        minExpansionLandTiles,
        minIslandClusterLandTiles,
        maxIslandStartCoastDistance,
        marginalLandRatio: config.marginalLandRatio,
        marginalExpansionRatio: config.marginalExpansionRatio,
      });
      if (!tier) {
        addRejection(
          rejectionCounts,
          rejectReason({
            landmassTiles,
            expansionLandTiles,
            nearbyClusterLandTiles,
            minContiguousLandTiles,
            minExpansionLandTiles,
            minIslandClusterLandTiles,
          })
        );
        tierByTile[plotIndex] = 1;
      }
      settleable.push({
        plotIndex,
        regionSlot,
        tier,
        landmassTiles,
        expansionLandTiles,
        nearbyClusterLandTiles,
        coastDistance,
        fertilityRaw: averageFloatWithinRadius({
          center: plotIndex,
          width,
          height,
          radius: 2,
          values: fertility,
          fallback: 0.5,
          // Land-only neighborhood: the same frame E1.4 measures, so coastal
          // candidates are not diluted by zero-fertility water tiles.
          mask: landMask,
        }),
      });
    }

    // --- pass 2: component vectors + fixed-normalization scores ---------------------------
    const fertilityRanks = percentileRanks(settleable.map((tile) => tile.fertilityRaw));
    const weights = {
      landmass: config.largeLandmassWeight,
      fertility: config.fertilityWeight,
      resources: config.resourceSupportWeight,
      freshwater: config.freshwaterWeight,
      climate: config.climateWeight,
      coastal: config.coastalPreferenceWeight,
      river: config.riverPreferenceWeight,
    };
    const totalWeight =
      weights.landmass +
      weights.fertility +
      weights.resources +
      weights.freshwater +
      weights.climate +
      weights.coastal +
      weights.river;
    const tierBias = {
      primary: config.tierBias?.primary ?? 0.08,
      islandCluster: config.tierBias?.islandCluster ?? 0.02,
      marginal: config.tierBias?.marginal ?? -0.08,
      none: (config.tierBias?.marginal ?? -0.08) - 0.04,
    };

    const isRiverAdjacent = (plotIndex: number): boolean => {
      if ((riverClass?.[plotIndex] ?? 0) > 0) return true;
      const y = (plotIndex / width) | 0;
      const x = plotIndex - y * width;
      for (const neighbor of getHexNeighborIndicesOddQ(x, y, width, height)) {
        if ((riverClass?.[neighbor] ?? 0) > 0) return true;
      }
      return false;
    };
    const isLakeAdjacent = (plotIndex: number): boolean => {
      const y = (plotIndex / width) | 0;
      const x = plotIndex - y * width;
      for (const neighbor of getHexNeighborIndicesOddQ(x, y, width, height)) {
        if ((lakeMask?.[neighbor] ?? 0) === 1) return true;
      }
      return false;
    };

    const candidates: StartCandidate[] = [];
    const reserve: SelectableTile[] = [];

    for (let i = 0; i < settleable.length; i++) {
      const tile = settleable[i]!;
      const contiguousScore = clamp01(tile.landmassTiles / minContiguousLandTiles);
      const expansionScore = clamp01(tile.expansionLandTiles / minExpansionLandTiles);
      const islandScore = clamp01(tile.nearbyClusterLandTiles / minIslandClusterLandTiles);
      const expansion =
        tile.tier === "islandCluster"
          ? clamp01(0.45 * expansionScore + 0.55 * islandScore)
          : clamp01(0.45 * contiguousScore + 0.55 * expansionScore);
      const aridityHere = aridityIndex?.[tile.plotIndex] ?? 0;
      const temperatureHere = surfaceTemperature?.[tile.plotIndex] ?? 0;
      const climate = climateThresholds
        ? climateComfortAt(climateThresholds, aridityHere, temperatureHere)
        : 0.5;
      const extreme = climateThresholds
        ? isClimateExtreme(climateThresholds, aridityHere, temperatureHere)
        : false;
      const components: StartComponents = {
        freshwater: freshwaterScore({ plotIndex: tile.plotIndex, width, height, riverClass, lakeMask }),
        fertility: fertilityRanks[i] ?? 0.5,
        expansion,
        climate,
        resource: clamp01((resourceSupport?.[tile.plotIndex] ?? 0) / 255),
        roughness: roughnessPenalty({
          plotIndex: tile.plotIndex,
          width,
          height,
          elevation,
          roughnessDivisor: config.roughnessDivisor,
        }),
      };
      const coastalComponent = (coastalLand?.[tile.plotIndex] ?? 0) === 1 ? 1 : 0;
      const riverComponent = isRiverAdjacent(tile.plotIndex) ? 1 : 0;
      const weighted =
        components.expansion * weights.landmass +
        components.fertility * weights.fertility +
        components.resource * weights.resources +
        components.freshwater * weights.freshwater +
        components.climate * weights.climate +
        coastalComponent * weights.coastal +
        riverComponent * weights.river;
      const base = weighted / Math.max(1e-6, totalWeight);
      const tierKey = tile.tier ?? "none";
      const score = clamp01(
        base +
          tierBias[tierKey] -
          components.roughness * config.roughnessPenaltyWeight * 0.12 -
          (extreme ? config.climateExtremePenaltyWeight * 0.2 : 0)
      );

      if (tile.tier) {
        scoreByTile[tile.plotIndex] = score;
        tierByTile[tile.plotIndex] =
          tile.tier === "primary" ? 4 : tile.tier === "islandCluster" ? 3 : 2;
        tierCounts[tile.tier] += 1;
        candidates.push({
          plotIndex: tile.plotIndex,
          regionSlot: tile.regionSlot,
          tier: tile.tier,
          score,
          components,
          landmassTiles: tile.landmassTiles,
          expansionLandTiles: tile.expansionLandTiles,
          nearbyClusterLandTiles: tile.nearbyClusterLandTiles,
          coastDistance: tile.coastDistance,
        });
      } else {
        reserve.push({
          plotIndex: tile.plotIndex,
          regionSlot: tile.regionSlot,
          tier: "none",
          score,
          components,
        });
      }
    }

    candidates.sort(compareSelectableTiles);

    // --- pass 3: seat identities + four-rung selection ladder ------------------------------
    const seatIdentities = buildSeatIdentities({
      playersWest: playersLandmass1,
      playersEast: playersLandmass2,
      alivePlayerIds: input.alivePlayerIds,
    });

    // Region reassignment (recorded, never silent): when a configured region
    // has ZERO admitted candidates (e.g. a single-continent map whose "east"
    // hemisphere is a few stray tiles), its seats cannot be regional by
    // geography — they are reassigned to the other region up-front. This is a
    // map-shape reconciliation, not a quality fallback: the seat then runs the
    // normal ladder inside its reassigned region. Each reassignment is
    // recorded as a region relaxation, flagged per seat, and degrades the
    // seat's status.
    const preLadderRelaxations: RelaxationEntry[] = [];
    const reassignedSeats = new Set<number>();
    const candidatesBySlot = { 1: 0, 2: 0 };
    for (const candidate of candidates) candidatesBySlot[candidate.regionSlot] += 1;
    for (const seat of seatIdentities) {
      const own = candidatesBySlot[seat.regionSlot];
      const other = (seat.regionSlot === 1 ? 2 : 1) as 1 | 2;
      if (own === 0 && candidatesBySlot[other] > 0) {
        preLadderRelaxations.push({
          seatIndex: seat.seatIndex,
          kind: "region",
          from: seat.regionSlot,
          to: other,
        });
        seat.regionSlot = other;
        reassignedSeats.add(seat.seatIndex);
      }
    }
    const seatBiases = indexSeatBiases(input.seatBiases);
    const biasContextOf = (plotIndex: number): SeatBiasContext => ({
      riverAdjacent: isRiverAdjacent(plotIndex),
      lakeAdjacent: isLakeAdjacent(plotIndex),
      coastalLand: (coastalLand?.[plotIndex] ?? 0) === 1,
    });

    const ladder = runSelectionLadder({
      seats: seatIdentities,
      candidates,
      reserve,
      width,
      spacingFloorTiles,
      desiredSpacingTiles,
      rankingBlend: config.rankingBlend,
      startBiasWeight: config.startBiasWeight,
      seatBiasOf: (seatIndex) => seatBiases.get(seatIndex),
      biasContextOf,
    });

    // --- pass 4: fairness balancing on the parity frame ------------------------------------
    const fairness = balanceFairness({
      selections: ladder.selections,
      swapPoolsOf: (selection: SeatSelection) =>
        selection.rung === "regional"
          ? [
              candidates.filter((tile) => tile.regionSlot === selection.seat.regionSlot),
              candidates,
            ]
          : [candidates],
      width,
      spacingFloorTiles,
      tolerance: config.fairnessTolerance,
    });
    const relaxations: RelaxationEntry[] = [
      ...preLadderRelaxations,
      ...ladder.relaxations,
      ...fairness.relaxations,
    ];

    // --- pass 5: per-seat StartRecord intents ----------------------------------------------
    const seatedPlots = ladder.selections
      .filter((entry) => entry.tile)
      .map((entry) => entry.tile!.plotIndex);
    const achievedSpacingOf = (plotIndex: number): number => {
      let best = Infinity;
      for (const other of seatedPlots) {
        if (other === plotIndex) continue;
        const dist = hexDistanceOddQPeriodicX(plotIndex, other, width);
        if (dist < best) best = dist;
      }
      return Number.isFinite(best) ? best : -1;
    };

    const globalImputedFlags = Array.from(imputedComponents)
      .sort()
      .map((component) => `${component}-imputed`);

    const seats = ladder.selections.map((entry) => {
      const seated = entry.tile !== null;
      const achievedSpacing = seated ? achievedSpacingOf(entry.tile!.plotIndex) : -1;
      const imputedFlags = [...globalImputedFlags];
      if (reassignedSeats.has(entry.seat.seatIndex)) imputedFlags.push("region-reassigned");
      if (!seated) imputedFlags.push("unseated");
      if (seated && achievedSpacing >= 0 && achievedSpacing < spacingFloorTiles) {
        imputedFlags.push("spacing-below-floor");
      }
      const spacingHoldsFloor = achievedSpacing < 0 || achievedSpacing >= spacingFloorTiles;
      return {
        seatIndex: entry.seat.seatIndex,
        playerId: entry.seat.playerId,
        playerIdSource: entry.seat.playerIdSource,
        regionSlot: entry.seat.regionSlot as number,
        rung: entry.rung,
        plotIndex: seated ? entry.tile!.plotIndex : -1,
        status:
          entry.rung === "regional" &&
          seated &&
          spacingHoldsFloor &&
          !reassignedSeats.has(entry.seat.seatIndex)
            ? ("full" as const)
            : ("degraded" as const),
        tier: seated ? entry.tile!.tier : ("none" as const),
        score: seated ? entry.tile!.score : 0,
        components: seated ? { ...entry.tile!.components } : { ...ZERO_COMPONENTS },
        achievedSpacing,
        imputedFlags,
      };
    });

    const orderedRejectionCounts = Array.from(rejectionCounts.entries())
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => a.reason.localeCompare(b.reason));

    return {
      playersLandmass1,
      playersLandmass2,
      spacingFloorTiles,
      desiredSpacingTiles,
      width,
      height,
      candidateCount: candidates.length,
      settleableTileCount: settleable.length,
      rejectionCounts: orderedRejectionCounts,
      tierCounts,
      scoreByTile,
      tierByTile,
      candidates: candidates.map((candidate) => ({
        plotIndex: candidate.plotIndex,
        regionSlot: candidate.regionSlot,
        tier: candidate.tier as StartTier,
        score: candidate.score,
        components: { ...candidate.components },
        landmassTiles: candidate.landmassTiles,
        expansionLandTiles: candidate.expansionLandTiles,
        nearbyClusterLandTiles: candidate.nearbyClusterLandTiles,
        coastDistance: candidate.coastDistance,
      })),
      seats,
      fairnessReport: {
        tolerance: config.fairnessTolerance,
        parity: seats.map((seat) => seat.score),
        worstPairGap: fairness.worstPairGap,
        balanced: fairness.balanced,
        swaps: fairness.swaps,
        relaxations,
      },
      status: seats.every((seat) => seat.status === "full") ? ("full" as const) : ("degraded" as const),
      inputCoverage,
    };
  },
});
