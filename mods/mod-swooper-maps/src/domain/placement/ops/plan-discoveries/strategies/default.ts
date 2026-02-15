import { clamp01 } from "@swooper/mapgen-core";
import { createStrategy } from "@swooper/mapgen-core/authoring";
import { getHexNeighborIndicesOddQ, hexDistanceOddQPeriodicX } from "@swooper/mapgen-core/lib/grid";

import PlanDiscoveriesContract from "../contract.js";

type Candidate = {
  plotIndex: number;
  priority: number;
  relief: number;
  preferredDiscoveryOffset: number;
};

type DiscoveryCandidate = {
  discoveryVisualType: number;
  discoveryActivationType: number;
};

function sanitizeCandidateDiscoveries(values: DiscoveryCandidate[]): DiscoveryCandidate[] {
  const unique = new Set<string>();
  const candidates: DiscoveryCandidate[] = [];
  for (const raw of values) {
    if (!Number.isFinite(raw?.discoveryVisualType) || !Number.isFinite(raw?.discoveryActivationType)) continue;
    const discoveryVisualType = (raw.discoveryVisualType as number) | 0;
    const discoveryActivationType = (raw.discoveryActivationType as number) | 0;
    if (discoveryVisualType < 0 || discoveryActivationType < 0) continue;
    const key = `${discoveryVisualType}:${discoveryActivationType}`;
    if (unique.has(key)) continue;
    unique.add(key);
    candidates.push({
      discoveryVisualType,
      discoveryActivationType,
    });
  }
  return candidates;
}

export const defaultStrategy = createStrategy(PlanDiscoveriesContract, "default", {
  run: (input, config) => {
    const width = input.width | 0;
    const height = input.height | 0;
    const size = Math.max(0, width * height);
    const candidateDiscoveries = sanitizeCandidateDiscoveries(
      input.candidateDiscoveries ?? []
    );
    if (!(input.landMask instanceof Uint8Array) || input.landMask.length !== size) {
      throw new Error("[Placement] Invalid landMask for placement/plan-discoveries.");
    }
    if (!(input.elevation instanceof Int16Array) || input.elevation.length !== size) {
      throw new Error("[Placement] Invalid elevation for placement/plan-discoveries.");
    }
    if (!(input.aridityIndex instanceof Float32Array) || input.aridityIndex.length !== size) {
      throw new Error("[Placement] Invalid aridityIndex for placement/plan-discoveries.");
    }
    if (!(input.riverClass instanceof Uint8Array) || input.riverClass.length !== size) {
      throw new Error("[Placement] Invalid riverClass for placement/plan-discoveries.");
    }
    if (!(input.lakeMask instanceof Uint8Array) || input.lakeMask.length !== size) {
      throw new Error("[Placement] Invalid lakeMask for placement/plan-discoveries.");
    }

    let landTileCount = 0;
    const reliefByTile = new Float32Array(size);
    let maxRelief = 0;
    for (let i = 0; i < size; i++) {
      if (input.landMask[i] !== 1 || input.lakeMask[i] === 1 || input.riverClass[i] > 0) continue;
      landTileCount += 1;
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

    if (landTileCount <= 0) {
      return {
        width,
        height,
        candidateDiscoveries,
        targetCount: 0,
        plannedCount: 0,
        placements: [],
      };
    }
    if (candidateDiscoveries.length === 0) {
      return {
        width,
        height,
        candidateDiscoveries: [],
        targetCount: 0,
        plannedCount: 0,
        placements: [],
      };
    }

    const reliefScale = Math.max(1, maxRelief);
    const candidates: Candidate[] = [];
    for (let i = 0; i < size; i++) {
      if (input.landMask[i] !== 1 || input.lakeMask[i] === 1 || input.riverClass[i] > 0) continue;
      const reliefN = clamp01((reliefByTile[i] ?? 0) / reliefScale);
      const aridity = clamp01(input.aridityIndex[i] ?? 0);
      const priority = clamp01(reliefN * 0.65 + (1 - aridity) * 0.35);
      const discoverySignature = clamp01((reliefN + (1 - aridity)) * 0.5);
      const preferredDiscoveryOffset = Math.min(
        candidateDiscoveries.length - 1,
        Math.floor(discoverySignature * candidateDiscoveries.length)
      );
      candidates.push({ plotIndex: i, priority, relief: reliefN, preferredDiscoveryOffset });
    }

    candidates.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      if (b.relief !== a.relief) return b.relief - a.relief;
      return a.plotIndex - b.plotIndex;
    });

    const targetCount = Math.min(
      candidates.length,
      Math.max(0, Math.round((landTileCount * config.densityPer100Tiles) / 100))
    );
    const minSpacingTiles = Math.max(0, config.minSpacingTiles | 0);
    const selected: Array<{
      plotIndex: number;
      preferredDiscoveryVisualType: number;
      preferredDiscoveryActivationType: number;
      preferredDiscoveryOffset: number;
      priority: number;
    }> = [];

    for (const candidate of candidates) {
      if (selected.length >= targetCount) break;
      let tooClose = false;
      if (minSpacingTiles > 0) {
        for (const placed of selected) {
          if (hexDistanceOddQPeriodicX(candidate.plotIndex, placed.plotIndex, width) < minSpacingTiles) {
            tooClose = true;
            break;
          }
        }
      }
      if (tooClose) continue;

      const preferredDiscovery = candidateDiscoveries[candidate.preferredDiscoveryOffset]!;
      selected.push({
        plotIndex: candidate.plotIndex,
        preferredDiscoveryVisualType: preferredDiscovery.discoveryVisualType,
        preferredDiscoveryActivationType: preferredDiscovery.discoveryActivationType,
        preferredDiscoveryOffset: candidate.preferredDiscoveryOffset,
        priority: candidate.priority,
      });
    }

    return {
      width,
      height,
      candidateDiscoveries,
      targetCount,
      plannedCount: selected.length,
      placements: selected,
    };
  },
});
