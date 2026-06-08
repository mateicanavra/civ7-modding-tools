import { clamp01 } from "@swooper/mapgen-core";
import { createStrategy } from "@swooper/mapgen-core/authoring";
import { getHexNeighborIndicesOddQ, hexDistanceOddQPeriodicX } from "@swooper/mapgen-core/lib/grid";

import PlanNaturalWondersContract from "../contract.js";

type Candidate = {
  plotIndex: number;
  priority: number;
  relief: number;
  elevation: number;
};

type NaturalWonderFeatureCandidate = {
  featureType: number;
  direction: number;
  validTerrainTypes: readonly number[];
  validBiomeTypes: readonly number[];
  minimumElevation: number | null;
  noLake: boolean;
  featureTags: readonly string[];
  footprintOffsets: readonly { dx: number; dy: number }[];
};

export const defaultStrategy = createStrategy(PlanNaturalWondersContract, "default", {
  run: (input, config) => {
    const width = input.width | 0;
    const height = input.height | 0;
    const size = Math.max(0, width * height);
    if (!(input.landMask instanceof Uint8Array) || input.landMask.length !== size) {
      throw new Error("[Placement] Invalid landMask for placement/plan-natural-wonders.");
    }
    if (!(input.elevation instanceof Int16Array) || input.elevation.length !== size) {
      throw new Error("[Placement] Invalid elevation for placement/plan-natural-wonders.");
    }
    if (!(input.aridityIndex instanceof Float32Array) || input.aridityIndex.length !== size) {
      throw new Error("[Placement] Invalid aridityIndex for placement/plan-natural-wonders.");
    }
    if (!(input.riverClass instanceof Uint8Array) || input.riverClass.length !== size) {
      throw new Error("[Placement] Invalid riverClass for placement/plan-natural-wonders.");
    }
    if (!(input.lakeMask instanceof Uint8Array) || input.lakeMask.length !== size) {
      throw new Error("[Placement] Invalid lakeMask for placement/plan-natural-wonders.");
    }
    if (!(input.terrainType instanceof Uint8Array) || input.terrainType.length !== size) {
      throw new Error("[Placement] Invalid terrainType for placement/plan-natural-wonders.");
    }
    if (!(input.biomeType instanceof Uint8Array) || input.biomeType.length !== size) {
      throw new Error("[Placement] Invalid biomeType for placement/plan-natural-wonders.");
    }
    if (!(input.featureType instanceof Int16Array) || input.featureType.length !== size) {
      throw new Error("[Placement] Invalid featureType for placement/plan-natural-wonders.");
    }
    if (
      !(input.naturalWonderBlockedMask instanceof Uint8Array) ||
      input.naturalWonderBlockedMask.length !== size
    ) {
      throw new Error(
        "[Placement] Invalid naturalWonderBlockedMask for placement/plan-natural-wonders."
      );
    }

    const wondersCount = Math.max(0, input.wondersCount | 0);
    const noFeatureType = Number.isFinite(input.noFeatureType)
      ? Math.trunc(input.noFeatureType)
      : -1;
    const featureCatalog = Array.from(
      new Map(
        (input.featureCatalog ?? [])
          .map((entry) => ({
            featureType: entry.featureType | 0,
            direction: entry.direction | 0,
            validTerrainTypes: sanitizeIdArray(entry.validTerrainTypes),
            validBiomeTypes: sanitizeIdArray(entry.validBiomeTypes),
            minimumElevation: Number.isFinite(entry.minimumElevation)
              ? Number(entry.minimumElevation)
              : null,
            noLake: entry.noLake === true,
            featureTags: sanitizeStringArray(entry.featureTags),
            footprintOffsets: sanitizeFootprintOffsets(entry.footprintOffsets),
          }))
          .filter((entry) => entry.featureType >= 0)
          .filter((entry) => entry.footprintOffsets.length > 0)
          .map((entry) => [entry.featureType, entry] as const)
      ).values()
    ).sort((a, b) => a.featureType - b.featureType);

    if (wondersCount <= 0 || featureCatalog.length === 0) {
      return {
        width,
        height,
        wondersCount,
        targetCount: 0,
        plannedCount: 0,
        placements: [],
      };
    }

    const reliefByTile = new Float32Array(size);
    let maxRelief = 0;
    for (let i = 0; i < size; i++) {
      const y = (i / width) | 0;
      const x = i - y * width;
      let minElev = input.elevation[i] ?? 0;
      let maxElev = minElev;
      for (const ni of getHexNeighborIndicesOddQ(x, y, width, height)) {
        const elev = input.elevation[ni] ?? minElev;
        if (elev < minElev) minElev = elev;
        if (elev > maxElev) maxElev = elev;
      }
      const relief = Math.max(0, maxElev - minElev);
      reliefByTile[i] = relief;
      if (relief > maxRelief) maxRelief = relief;
    }

    const reliefScale = Math.max(1, maxRelief);
    const candidates: Candidate[] = [];
    for (let i = 0; i < size; i++) {
      const reliefN = clamp01((reliefByTile[i] ?? 0) / reliefScale);
      const aridity = clamp01(input.aridityIndex[i] ?? 0);
      const river = clamp01((input.riverClass[i] ?? 0) / 2);
      const priority = clamp01(reliefN * 0.75 + (1 - aridity) * 0.15 + river * 0.1);
      candidates.push({
        plotIndex: i,
        priority,
        relief: reliefN,
        elevation: input.elevation[i] ?? 0,
      });
    }

    candidates.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      if (b.relief !== a.relief) return b.relief - a.relief;
      return a.plotIndex - b.plotIndex;
    });

    const minSpacingTiles = Math.max(0, config.minSpacingTiles | 0);
    const targetCount = Math.min(wondersCount, featureCatalog.length, candidates.length);
    const selected: Array<{
      plotIndex: number;
      featureType: number;
      direction: number;
      elevation: number;
      priority: number;
    }> = [];

    const usedPlots = new Set<number>();
    for (const feature of featureCatalog) {
      if (selected.length >= targetCount) break;

      const candidate = chooseFeatureCandidate({
        feature,
        candidates,
        width,
        height,
        terrainType: input.terrainType,
        biomeType: input.biomeType,
        featureType: input.featureType,
        landMask: input.landMask,
        riverClass: input.riverClass,
        coastTerrainType: input.coastTerrainType | 0,
        mountainTerrainType: input.mountainTerrainType | 0,
        iceFeatureType: input.iceFeatureType | 0,
        noFeatureType,
        naturalWonderBlockedMask: input.naturalWonderBlockedMask,
        lakeMask: input.lakeMask,
        selected,
        usedPlots,
        minSpacingTiles,
        relaxSpacing: false,
      }) ?? chooseFeatureCandidate({
        feature,
        candidates,
        width,
        height,
        terrainType: input.terrainType,
        biomeType: input.biomeType,
        featureType: input.featureType,
        landMask: input.landMask,
        riverClass: input.riverClass,
        coastTerrainType: input.coastTerrainType | 0,
        mountainTerrainType: input.mountainTerrainType | 0,
        iceFeatureType: input.iceFeatureType | 0,
        noFeatureType,
        naturalWonderBlockedMask: input.naturalWonderBlockedMask,
        lakeMask: input.lakeMask,
        selected,
        usedPlots,
        minSpacingTiles,
        relaxSpacing: true,
      });
      if (!candidate) continue;
      for (const plotIndex of getFootprintIndices({
        plotIndex: candidate.plotIndex,
        width,
        height,
        footprintOffsets: feature.footprintOffsets,
      }) ?? [candidate.plotIndex]) {
        usedPlots.add(plotIndex);
      }

      selected.push({
        plotIndex: candidate.plotIndex,
        featureType: feature.featureType,
        direction: feature.direction,
        elevation: candidate.elevation,
        priority: candidate.priority,
      });
    }

    return {
      width,
      height,
      wondersCount,
      targetCount,
      plannedCount: selected.length,
      placements: selected,
    };
  },
});

function sanitizeIdArray(values: readonly number[] | undefined): number[] {
  if (!Array.isArray(values)) return [];
  return Array.from(
    new Set(
      values
        .map((value) => Math.trunc(value))
        .filter((value) => Number.isFinite(value) && value >= 0)
    )
  ).sort((a, b) => a - b);
}

function sanitizeFootprintOffsets(
  values: readonly { dx?: number; dy?: number }[] | undefined
): Array<{ dx: number; dy: number }> {
  if (!Array.isArray(values)) return [{ dx: 0, dy: 0 }];
  const offsets: Array<{ dx: number; dy: number }> = [];
  const seen = new Set<string>();
  for (const value of values) {
    const dx = Math.trunc(value.dx ?? Number.NaN);
    const dy = Math.trunc(value.dy ?? Number.NaN);
    if (!Number.isFinite(dx) || !Number.isFinite(dy)) continue;
    const key = `${dx}:${dy}`;
    if (seen.has(key)) continue;
    seen.add(key);
    offsets.push({ dx, dy });
  }
  return offsets.length > 0 ? offsets : [{ dx: 0, dy: 0 }];
}

function sanitizeStringArray(values: readonly string[] | undefined): string[] {
  if (!Array.isArray(values)) return [];
  return Array.from(
    new Set(values.filter((value): value is string => typeof value === "string" && value.length > 0))
  ).sort();
}

function wrappedX(x: number, width: number): number {
  return ((x % width) + width) % width;
}

function getFootprintIndices(args: {
  plotIndex: number;
  width: number;
  height: number;
  footprintOffsets: readonly { dx: number; dy: number }[];
}): number[] | null {
  const y = (args.plotIndex / args.width) | 0;
  const x = args.plotIndex - y * args.width;
  const indices: number[] = [];
  const seen = new Set<number>();
  for (const offset of args.footprintOffsets) {
    const fy = y + offset.dy;
    if (fy < 0 || fy >= args.height) return null;
    const fx = wrappedX(x + offset.dx, args.width);
    const index = fy * args.width + fx;
    if (seen.has(index)) continue;
    seen.add(index);
    indices.push(index);
  }
  return indices.length > 0 ? indices : null;
}

function forEachFootprintNeighbor(args: {
  footprint: readonly number[];
  width: number;
  height: number;
  fn: (plotIndex: number) => void;
}): void {
  const seen = new Set(args.footprint);
  for (const plotIndex of args.footprint) {
    const y = (plotIndex / args.width) | 0;
    const x = plotIndex - y * args.width;
    for (const ni of getHexNeighborIndicesOddQ(x, y, args.width, args.height)) {
      if (seen.has(ni)) continue;
      seen.add(ni);
      args.fn(ni);
    }
  }
}

function hasTerrainWithinHexDistance(args: {
  centerIndex: number;
  width: number;
  height: number;
  terrainType: Uint8Array;
  targetTerrainType: number;
  maxDistance: number;
}): boolean {
  const queue: Array<{ index: number; distance: number }> = [
    { index: args.centerIndex, distance: 0 },
  ];
  const seen = new Set<number>([args.centerIndex]);
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (
      current.distance > 0 &&
      (args.terrainType[current.index] ?? -1) === args.targetTerrainType
    ) {
      return true;
    }
    if (current.distance >= args.maxDistance) continue;
    const y = (current.index / args.width) | 0;
    const x = current.index - y * args.width;
    for (const ni of getHexNeighborIndicesOddQ(x, y, args.width, args.height)) {
      if (seen.has(ni)) continue;
      seen.add(ni);
      queue.push({ index: ni, distance: current.distance + 1 });
    }
  }
  return false;
}

function satisfiesFeatureTags(args: {
  feature: NaturalWonderFeatureCandidate;
  candidate: Candidate;
  footprint: readonly number[];
  width: number;
  height: number;
  landMask: Uint8Array;
  terrainType: Uint8Array;
  biomeType: Uint8Array;
  featureType: Int16Array;
  riverClass: Uint8Array;
  coastTerrainType: number;
  mountainTerrainType: number;
  iceFeatureType: number;
}): boolean {
  for (const tag of args.feature.featureTags) {
    switch (tag) {
      case "FEATURE_FOREST":
      case "FEATURE_REEF":
      case "SHALLOWWATER":
      case "VOLCANO":
        break;
      case "ADJACENTTOLAND": {
        let adjacentToLand = false;
        forEachFootprintNeighbor({
          footprint: args.footprint,
          width: args.width,
          height: args.height,
          fn: (plotIndex) => {
            if (args.landMask[plotIndex] === 1) adjacentToLand = true;
          },
        });
        if (!adjacentToLand) return false;
        break;
      }
      case "ADJACENTMOUNTAIN": {
        let adjacentMountain = false;
        forEachFootprintNeighbor({
          footprint: args.footprint,
          width: args.width,
          height: args.height,
          fn: (plotIndex) => {
            if ((args.terrainType[plotIndex] ?? -1) === args.mountainTerrainType) {
              adjacentMountain = true;
            }
          },
        });
        if (!adjacentMountain) return false;
        break;
      }
      case "ADJACENTTOSAMEBIOME": {
        const biome = args.biomeType[args.candidate.plotIndex] ?? -1;
        let adjacentSameBiome = false;
        forEachFootprintNeighbor({
          footprint: args.footprint,
          width: args.width,
          height: args.height,
          fn: (plotIndex) => {
            if ((args.biomeType[plotIndex] ?? -2) === biome) adjacentSameBiome = true;
          },
        });
        if (!adjacentSameBiome) return false;
        break;
      }
      case "NOTADJACENTMOUNTAIN": {
        let adjacentMountain = false;
        forEachFootprintNeighbor({
          footprint: args.footprint,
          width: args.width,
          height: args.height,
          fn: (plotIndex) => {
            if ((args.terrainType[plotIndex] ?? -1) === args.mountainTerrainType) {
              adjacentMountain = true;
            }
          },
        });
        if (adjacentMountain) return false;
        break;
      }
      case "NOTADJACENTTOICE": {
        let adjacentIce = false;
        forEachFootprintNeighbor({
          footprint: args.footprint,
          width: args.width,
          height: args.height,
          fn: (plotIndex) => {
            if ((args.featureType[plotIndex] ?? -1) === args.iceFeatureType) adjacentIce = true;
          },
        });
        if (adjacentIce) return false;
        break;
      }
      case "NOTADJACENTTORIVER": {
        let adjacentRiver = false;
        for (const plotIndex of args.footprint) {
          if ((args.riverClass[plotIndex] ?? 0) > 0) adjacentRiver = true;
        }
        forEachFootprintNeighbor({
          footprint: args.footprint,
          width: args.width,
          height: args.height,
          fn: (plotIndex) => {
            if ((args.riverClass[plotIndex] ?? 0) > 0) adjacentRiver = true;
          },
        });
        if (adjacentRiver) return false;
        break;
      }
      case "NOTNEARCOAST":
        for (const plotIndex of args.footprint) {
          if (
            hasTerrainWithinHexDistance({
              centerIndex: plotIndex,
              width: args.width,
              height: args.height,
              terrainType: args.terrainType,
              targetTerrainType: args.coastTerrainType,
              maxDistance: 2,
            })
          ) {
            return false;
          }
        }
        break;
      case "WATERFALL": {
        let adjacentRiver = false;
        forEachFootprintNeighbor({
          footprint: args.footprint,
          width: args.width,
          height: args.height,
          fn: (plotIndex) => {
            if ((args.riverClass[plotIndex] ?? 0) > 0) adjacentRiver = true;
          },
        });
        if (!adjacentRiver) return false;
        break;
      }
      default:
        return false;
    }
  }
  return true;
}

function isCandidateCompatibleWithFeature(args: {
  feature: NaturalWonderFeatureCandidate;
  candidate: Candidate;
  width: number;
  height: number;
  landMask: Uint8Array;
  terrainType: Uint8Array;
  biomeType: Uint8Array;
  featureType: Int16Array;
  riverClass: Uint8Array;
  coastTerrainType: number;
  mountainTerrainType: number;
  iceFeatureType: number;
  noFeatureType: number;
  naturalWonderBlockedMask: Uint8Array;
  lakeMask: Uint8Array;
}): boolean {
  const footprint = getFootprintIndices({
    plotIndex: args.candidate.plotIndex,
    width: args.width,
    height: args.height,
    footprintOffsets: args.feature.footprintOffsets,
  });
  if (!footprint) return false;
  for (const plotIndex of footprint) {
    if (args.naturalWonderBlockedMask[plotIndex] === 1) return false;
    if ((args.featureType[plotIndex] ?? args.noFeatureType) !== args.noFeatureType) {
      return false;
    }
    const terrain = args.terrainType[plotIndex] ?? -1;
    if (
      args.feature.validTerrainTypes.length > 0 &&
      !args.feature.validTerrainTypes.includes(terrain)
    ) {
      return false;
    }
    const biome = args.biomeType[plotIndex] ?? -1;
    if (args.feature.validBiomeTypes.length > 0 && !args.feature.validBiomeTypes.includes(biome)) {
      return false;
    }
    if (args.feature.noLake && args.lakeMask[plotIndex] === 1) return false;
  }
  if (
    !satisfiesFeatureTags({
      feature: args.feature,
      candidate: args.candidate,
      footprint,
      width: args.width,
      height: args.height,
      landMask: args.landMask,
      terrainType: args.terrainType,
      biomeType: args.biomeType,
      featureType: args.featureType,
      riverClass: args.riverClass,
      coastTerrainType: args.coastTerrainType,
      mountainTerrainType: args.mountainTerrainType,
      iceFeatureType: args.iceFeatureType,
    })
  ) {
    return false;
  }
  if (
    args.feature.minimumElevation !== null &&
    args.candidate.elevation < args.feature.minimumElevation
  ) {
    return false;
  }
  return true;
}

function chooseFeatureCandidate(args: {
  feature: NaturalWonderFeatureCandidate;
  candidates: readonly Candidate[];
  width: number;
  height: number;
  landMask: Uint8Array;
  terrainType: Uint8Array;
  biomeType: Uint8Array;
  featureType: Int16Array;
  riverClass: Uint8Array;
  coastTerrainType: number;
  mountainTerrainType: number;
  iceFeatureType: number;
  noFeatureType: number;
  naturalWonderBlockedMask: Uint8Array;
  lakeMask: Uint8Array;
  selected: readonly { plotIndex: number }[];
  usedPlots: ReadonlySet<number>;
  minSpacingTiles: number;
  relaxSpacing: boolean;
}): Candidate | null {
  for (const candidate of args.candidates) {
    if (args.usedPlots.has(candidate.plotIndex)) continue;
    if (
      !isCandidateCompatibleWithFeature({
        feature: args.feature,
        candidate,
        width: args.width,
        height: args.height,
        landMask: args.landMask,
        terrainType: args.terrainType,
        biomeType: args.biomeType,
        featureType: args.featureType,
        riverClass: args.riverClass,
        coastTerrainType: args.coastTerrainType,
        mountainTerrainType: args.mountainTerrainType,
        iceFeatureType: args.iceFeatureType,
        noFeatureType: args.noFeatureType,
        naturalWonderBlockedMask: args.naturalWonderBlockedMask,
        lakeMask: args.lakeMask,
      })
    ) {
      continue;
    }
    if (!args.relaxSpacing && args.minSpacingTiles > 0) {
      let tooClose = false;
      for (const placed of args.selected) {
        if (hexDistanceOddQPeriodicX(candidate.plotIndex, placed.plotIndex, args.width) < args.minSpacingTiles) {
          tooClose = true;
          break;
        }
      }
      if (tooClose) continue;
    }
    void args.height;
    return candidate;
  }
  return null;
}
