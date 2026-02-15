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

    const wondersCount = Math.max(0, input.wondersCount | 0);
    const featureCatalog = Array.from(
      new Map(
        (input.featureCatalog ?? [])
          .map((entry) => ({
            featureType: entry.featureType | 0,
            direction: entry.direction | 0,
          }))
          .filter((entry) => entry.featureType >= 0)
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
      if (input.landMask[i] !== 1 || input.lakeMask[i] === 1) continue;
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
      if (input.landMask[i] !== 1 || input.lakeMask[i] === 1) continue;
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
    let catalogIndex = 0;

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

      const feature = featureCatalog[catalogIndex]!;
      catalogIndex += 1;

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
