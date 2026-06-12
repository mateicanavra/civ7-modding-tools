import { clamp01 } from "@swooper/mapgen-core";
import { createStrategy } from "@swooper/mapgen-core/authoring";
import {
  getHexNeighborIndicesOddQ,
  getHexRadiusIndicesOddQ,
} from "@swooper/mapgen-core/lib/grid";

import PlanStartsContract from "../contract.js";

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

type StartCandidate = {
  plotIndex: number;
  regionSlot: 1 | 2;
  tier: StartTier;
  score: number;
  landmassTiles: number;
  expansionLandTiles: number;
  nearbyClusterLandTiles: number;
  coastDistance: number;
  freshwaterScore: number;
  resourceSupportScore: number;
  roughnessPenalty: number;
};

function emptyPlan(baseStarts: {
  playersLandmass1: number;
  playersLandmass2: number;
  startSectorRows: number;
  startSectorCols: number;
  startSectors: unknown[];
}) {
  return {
    ...baseStarts,
    startSectors: [...baseStarts.startSectors],
    minStartSpacingTiles: 0,
    width: 0,
    height: 0,
    candidateCount: 0,
    rejectionCounts: [],
    tierCounts: {
      primary: 0,
      islandCluster: 0,
      marginal: 0,
    },
    scoreByTile: new Float32Array(0),
    tierByTile: new Uint8Array(0),
    candidates: [],
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

function optionalLength<T extends { length: number }>(
  value: T | undefined,
  expected: number,
  fallback: T | undefined = undefined
): T | undefined {
  if (!value) return fallback;
  if (value.length !== expected) return fallback;
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
}): number {
  if (!args.values) return args.fallback;
  let sum = 0;
  let count = 0;
  for (const idx of getHexRadiusIndicesOddQ(args.center, args.width, args.height, args.radius)) {
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
  const riverHere = clamp01((args.riverClass?.[args.plotIndex] ?? 0) / 2);
  let adjacentWater = 0;
  const y = (args.plotIndex / args.width) | 0;
  const x = args.plotIndex - y * args.width;
  for (const neighbor of getHexNeighborIndicesOddQ(x, y, args.width, args.height)) {
    if ((args.riverClass?.[neighbor] ?? 0) > 0) adjacentWater = Math.max(adjacentWater, 0.8);
    if ((args.lakeMask?.[neighbor] ?? 0) === 1) adjacentWater = Math.max(adjacentWater, 0.7);
  }
  return clamp01(Math.max(riverHere, adjacentWater));
}

function roughnessPenalty(args: {
  plotIndex: number;
  width: number;
  height: number;
  elevation?: Int16Array;
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
  return clamp01((max - min) / 900);
}

function buildResourceSupport(args: {
  width: number;
  height: number;
  radius: number;
  placedResourcePlotIndices?: readonly number[];
}): Uint8Array | undefined {
  if (!args.placedResourcePlotIndices?.length || args.radius <= 0) return undefined;
  const size = Math.max(0, args.width * args.height);
  const counts = new Uint16Array(size);
  let maxCount = 0;
  for (const raw of args.placedResourcePlotIndices) {
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
    args.landmassTiles >= Math.ceil(args.minContiguousLandTiles * 0.5) &&
    args.expansionLandTiles >= Math.ceil(args.minExpansionLandTiles * 0.65)
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

function computeScore(args: {
  tier: StartTier;
  landmassTiles: number;
  expansionLandTiles: number;
  nearbyClusterLandTiles: number;
  minContiguousLandTiles: number;
  minExpansionLandTiles: number;
  minIslandClusterLandTiles: number;
  fertility: number;
  moisture: number;
  aridity: number;
  temperature: number;
  freshwater: number;
  resourceSupport: number;
  roughnessPenalty: number;
  weights: {
    fertility: number;
    resources: number;
    freshwater: number;
    landmass: number;
    roughness: number;
  };
}): number {
  const contiguousScore = clamp01(args.landmassTiles / args.minContiguousLandTiles);
  const expansionScore = clamp01(args.expansionLandTiles / args.minExpansionLandTiles);
  const islandScore = clamp01(args.nearbyClusterLandTiles / args.minIslandClusterLandTiles);
  const landScore =
    args.tier === "islandCluster"
      ? clamp01(0.45 * expansionScore + 0.55 * islandScore)
      : clamp01(0.45 * contiguousScore + 0.55 * expansionScore);
  const climateScore = clamp01(
    (clamp01(args.moisture) + clamp01(1 - args.aridity) + clamp01(1 - Math.abs(args.temperature - 16) / 36)) /
      3
  );
  const weighted =
    landScore * args.weights.landmass +
    clamp01(args.fertility) * args.weights.fertility +
    args.resourceSupport * args.weights.resources +
    args.freshwater * args.weights.freshwater +
    climateScore;
  const totalWeight =
    args.weights.landmass +
    args.weights.fertility +
    args.weights.resources +
    args.weights.freshwater +
    1;
  const tierBias = args.tier === "primary" ? 0.08 : args.tier === "islandCluster" ? 0.02 : -0.08;
  return clamp01(weighted / Math.max(1e-6, totalWeight) + tierBias - args.roughnessPenalty * args.weights.roughness * 0.12);
}

export const defaultStrategy = createStrategy(PlanStartsContract, "default", {
  run: (input, config) => {
    const baseStarts = {
      ...input.baseStarts,
      ...(config.overrides ?? {}),
      startSectors: [...(config.overrides?.startSectors ?? input.baseStarts.startSectors)],
    };

    const width = Math.max(0, input.width ?? 0) | 0;
    const height = Math.max(0, input.height ?? 0) | 0;
    const size = Math.max(0, width * height);
    if (width <= 0 || height <= 0 || size <= 0) {
      return emptyPlan(baseStarts);
    }

    const landMask = requireLength(input.landMask, size, "landMask");
    const slotByTile = requireLength(input.slotByTile, size, "slotByTile");
    const landmassIdByTile = requireLength(input.landmassIdByTile, size, "landmassIdByTile");
    const lakeMask = optionalLength(input.lakeMask, size);
    const coastalLand = optionalLength(input.coastalLand, size);
    const distanceToCoast = optionalLength(input.distanceToCoast, size);
    const elevation = optionalLength(input.elevation, size);
    const fertility = optionalLength(input.fertility, size);
    const effectiveMoisture = optionalLength(input.effectiveMoisture, size);
    const surfaceTemperature = optionalLength(input.surfaceTemperature, size);
    const aridityIndex = optionalLength(input.aridityIndex, size);
    const riverClass = optionalLength(input.riverClass, size);
    const mountainMask = optionalLength(input.mountainMask, size);
    const volcanoMask = optionalLength(input.volcanoMask, size);
    const naturalWonderPlots = new Set<number>();
    for (const raw of input.naturalWonderPlotIndices ?? []) {
      const plotIndex = raw | 0;
      if (plotIndex >= 0 && plotIndex < size) naturalWonderPlots.add(plotIndex);
    }
    const resourceSupport =
      optionalLength(input.resourceSupport, size) ??
      buildResourceSupport({
        width,
        height,
        radius: Math.max(0, config.resourceSupportRadiusTiles | 0),
        placedResourcePlotIndices: input.placedResourcePlotIndices,
      });

    const scoreByTile = new Float32Array(size);
    const tierByTile = new Uint8Array(size);
    const rejectionCounts = new Map<RejectionReason, number>();
    const candidates: StartCandidate[] = [];
    const tierCounts = {
      primary: 0,
      islandCluster: 0,
      marginal: 0,
    };

    const minContiguousLandTiles = Math.max(1, config.minContiguousLandTiles | 0);
    const minExpansionLandTiles = Math.max(1, config.minExpansionLandTiles | 0);
    const minIslandClusterLandTiles = Math.max(1, config.minIslandClusterLandTiles | 0);
    const expansionRadiusTiles = Math.max(1, config.expansionRadiusTiles | 0);
    const islandClusterRadiusTiles = Math.max(1, config.islandClusterRadiusTiles | 0);
    const maxIslandStartCoastDistance = Math.max(0, config.maxIslandStartCoastDistance | 0);

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

      const regionSlot = slotByTile[plotIndex] === 1 || slotByTile[plotIndex] === 2
        ? (slotByTile[plotIndex] as 1 | 2)
        : null;
      if (!regionSlot) {
        addRejection(rejectionCounts, "insufficient-landmass");
        tierByTile[plotIndex] = 1;
        continue;
      }

      const landmassTiles = getLandmassTiles(
        landmassIdByTile,
        input.landmassTileCounts,
        plotIndex
      );
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
            ? (coastalLand[plotIndex] === 1 ? 0 : maxIslandStartCoastDistance + 1)
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
        continue;
      }

      const freshwater = freshwaterScore({ plotIndex, width, height, riverClass, lakeMask });
      const resourceSupportScore = clamp01((resourceSupport?.[plotIndex] ?? 0) / 255);
      const roughness = roughnessPenalty({ plotIndex, width, height, elevation });
      const score = computeScore({
        tier,
        landmassTiles,
        expansionLandTiles,
        nearbyClusterLandTiles,
        minContiguousLandTiles,
        minExpansionLandTiles,
        minIslandClusterLandTiles,
        fertility: averageFloatWithinRadius({
          center: plotIndex,
          width,
          height,
          radius: 2,
          values: fertility,
          fallback: 0.5,
        }),
        moisture: averageFloatWithinRadius({
          center: plotIndex,
          width,
          height,
          radius: 2,
          values: effectiveMoisture,
          fallback: 0.5,
        }),
        aridity: averageFloatWithinRadius({
          center: plotIndex,
          width,
          height,
          radius: 2,
          values: aridityIndex,
          fallback: 0.45,
        }),
        temperature: averageFloatWithinRadius({
          center: plotIndex,
          width,
          height,
          radius: 2,
          values: surfaceTemperature,
          fallback: 16,
        }),
        freshwater,
        resourceSupport: resourceSupportScore,
        roughnessPenalty: roughness,
        weights: {
          fertility: config.fertilityWeight,
          resources: config.resourceSupportWeight,
          freshwater: config.freshwaterWeight,
          landmass: config.largeLandmassWeight,
          roughness: config.roughnessPenaltyWeight,
        },
      });

      scoreByTile[plotIndex] = score;
      tierByTile[plotIndex] = tier === "primary" ? 4 : tier === "islandCluster" ? 3 : 2;
      tierCounts[tier] += 1;
      candidates.push({
        plotIndex,
        regionSlot,
        tier,
        score,
        landmassTiles,
        expansionLandTiles,
        nearbyClusterLandTiles,
        coastDistance,
        freshwaterScore: freshwater,
        resourceSupportScore,
        roughnessPenalty: roughness,
      });
    }

    candidates.sort((a, b) => {
      const tierRank = tierValue(b.tier) - tierValue(a.tier);
      if (tierRank !== 0) return tierRank;
      if (b.score !== a.score) return b.score - a.score;
      return a.plotIndex - b.plotIndex;
    });

    const orderedRejectionCounts = Array.from(rejectionCounts.entries())
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => a.reason.localeCompare(b.reason));

    return {
      ...baseStarts,
      minStartSpacingTiles: Math.max(0, config.minStartSpacingTiles | 0),
      width,
      height,
      candidateCount: candidates.length,
      rejectionCounts: orderedRejectionCounts,
      tierCounts,
      scoreByTile,
      tierByTile,
      candidates,
    };
  },
});

function tierValue(tier: StartTier): number {
  if (tier === "primary") return 3;
  if (tier === "islandCluster") return 2;
  return 1;
}
