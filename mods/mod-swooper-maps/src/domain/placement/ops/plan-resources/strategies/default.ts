import { clamp01 } from "@swooper/mapgen-core";
import { createStrategy } from "@swooper/mapgen-core/authoring";
import { hexDistanceOddQPeriodicX } from "@swooper/mapgen-core/lib/grid";
import PlanResourcesContract from "../contract.js";

type Candidate = {
  plotIndex: number;
  priority: number;
  stress: number;
  preferredTypeOffset: number;
};

export const defaultStrategy = createStrategy(PlanResourcesContract, "default", {
  run: (input, config) => {
    const width = input.width | 0;
    const height = input.height | 0;
    const size = Math.max(0, width * height);
    if (!(input.landMask instanceof Uint8Array) || input.landMask.length !== size) {
      throw new Error("[Placement] Invalid landMask for placement/plan-resources.");
    }
    if (!(input.fertility instanceof Float32Array) || input.fertility.length !== size) {
      throw new Error("[Placement] Invalid fertility for placement/plan-resources.");
    }
    if (!(input.effectiveMoisture instanceof Float32Array) || input.effectiveMoisture.length !== size) {
      throw new Error("[Placement] Invalid effectiveMoisture for placement/plan-resources.");
    }
    if (!(input.surfaceTemperature instanceof Float32Array) || input.surfaceTemperature.length !== size) {
      throw new Error("[Placement] Invalid surfaceTemperature for placement/plan-resources.");
    }
    if (!(input.aridityIndex instanceof Float32Array) || input.aridityIndex.length !== size) {
      throw new Error("[Placement] Invalid aridityIndex for placement/plan-resources.");
    }
    if (!(input.riverClass instanceof Uint8Array) || input.riverClass.length !== size) {
      throw new Error("[Placement] Invalid riverClass for placement/plan-resources.");
    }
    if (!(input.lakeMask instanceof Uint8Array) || input.lakeMask.length !== size) {
      throw new Error("[Placement] Invalid lakeMask for placement/plan-resources.");
    }

    const candidateResourceTypes = Array.from(
      new Set((config.candidateResourceTypes ?? []).map((value) => value | 0).filter((value) => value >= 0))
    );
    if (candidateResourceTypes.length === 0) {
      return {
        width,
        height,
        candidateResourceTypes: [],
        targetCount: 0,
        plannedCount: 0,
        placements: [],
      };
    }

    let landTiles = 0;
    let moistureMin = Number.POSITIVE_INFINITY;
    let moistureMax = Number.NEGATIVE_INFINITY;
    for (let i = 0; i < size; i++) {
      if (input.landMask[i] !== 1) continue;
      landTiles += 1;
      const moisture = input.effectiveMoisture[i] ?? 0;
      if (moisture < moistureMin) moistureMin = moisture;
      if (moisture > moistureMax) moistureMax = moisture;
    }

    const moistureRange = Number.isFinite(moistureMin) && Number.isFinite(moistureMax)
      ? Math.max(1e-6, moistureMax - moistureMin)
      : 1;

    const candidates: Candidate[] = [];
    for (let i = 0; i < size; i++) {
      if (input.landMask[i] !== 1) continue;
      if ((input.lakeMask[i] ?? 0) === 1) continue;

      const fertility = clamp01(input.fertility[i] ?? 0);
      const aridity = clamp01(input.aridityIndex[i] ?? 0);
      const stress = 1 - aridity;
      const moisture = clamp01(((input.effectiveMoisture[i] ?? moistureMin) - moistureMin) / moistureRange);
      const temperature = input.surfaceTemperature[i] ?? 0;
      const temperateSuitability = clamp01(1 - Math.abs(temperature - 16) / 36);
      const riverHydration = clamp01((input.riverClass[i] ?? 0) / 2);
      const hydro = clamp01((moisture + riverHydration) / 2);
      const priority = clamp01((fertility + hydro + stress + temperateSuitability) / 4);

      const signature = clamp01((fertility + hydro + temperateSuitability) / 3);
      const preferredTypeOffset = Math.min(
        candidateResourceTypes.length - 1,
        Math.floor(signature * candidateResourceTypes.length)
      );

      candidates.push({
        plotIndex: i,
        priority,
        stress,
        preferredTypeOffset,
      });
    }

    candidates.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      if (b.stress !== a.stress) return b.stress - a.stress;
      return a.plotIndex - b.plotIndex;
    });

    const targetCount = Math.min(
      candidates.length,
      Math.max(0, Math.round((landTiles * config.densityPer100Tiles) / 100))
    );
    const minSpacingTiles = Math.max(0, config.minSpacingTiles | 0);
    const maxPerType = Math.max(
      1,
      Math.ceil(targetCount * clamp01(config.maxPlacementsPerResourceShare))
    );

    const selected: Array<{
      plotIndex: number;
      preferredResourceType: number;
      preferredTypeOffset: number;
      priority: number;
    }> = [];
    const perTypeCounts = new Map<number, number>();

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

      let chosenOffset = candidate.preferredTypeOffset;
      let foundCappedType = false;
      for (let shift = 0; shift < candidateResourceTypes.length; shift++) {
        const offset = (candidate.preferredTypeOffset + shift) % candidateResourceTypes.length;
        const type = candidateResourceTypes[offset]!;
        const current = perTypeCounts.get(type) ?? 0;
        if (current < maxPerType) {
          chosenOffset = offset;
          foundCappedType = true;
          break;
        }
      }
      if (!foundCappedType) {
        chosenOffset = candidate.preferredTypeOffset;
      }

      const preferredResourceType = candidateResourceTypes[chosenOffset]!;
      selected.push({
        plotIndex: candidate.plotIndex,
        preferredResourceType,
        preferredTypeOffset: chosenOffset,
        priority: candidate.priority,
      });
      perTypeCounts.set(preferredResourceType, (perTypeCounts.get(preferredResourceType) ?? 0) + 1);
    }

    return {
      width,
      height,
      candidateResourceTypes,
      targetCount,
      plannedCount: selected.length,
      placements: selected,
    };
  },
});
