import { createStrategy } from "@swooper/mapgen-core/authoring";
import { isMajorRiverClass, isMinorRiverClass } from "../../../river-class.js";
import SelectNavigableRiverTerrainContract from "../contract.js";

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function percentileFloor(valuesAscending: readonly number[], percentile: number): number {
  if (valuesAscending.length === 0) return Infinity;
  const p = clamp01(percentile);
  const index = Math.floor((valuesAscending.length - 1) * p);
  return valuesAscending[index] ?? Infinity;
}

function assertLength(name: string, actual: number, expected: number): void {
  if (actual !== expected) {
    throw new Error(
      `[Hydrology] Invalid ${name} for hydrology/select-navigable-river-terrain: length ${actual} !== ${expected}.`
    );
  }
}

function bestUnselectedUpstream(
  upstream: readonly number[],
  discharge: Float32Array,
  selectedMask: Uint8Array
): number {
  let bestIndex = -1;
  let bestDischarge = -Infinity;
  for (const index of upstream) {
    if (selectedMask[index] === 1) continue;
    const currentDischarge = discharge[index] ?? 0;
    if (currentDischarge <= bestDischarge) continue;
    bestDischarge = currentDischarge;
    bestIndex = index;
  }
  return bestIndex;
}

export const defaultStrategy = createStrategy(SelectNavigableRiverTerrainContract, "default", {
  run: (input, config) => {
    const width = input.width | 0;
    const height = input.height | 0;
    const size = Math.max(0, width * height);

    if (!(input.riverClass instanceof Uint8Array)) {
      throw new Error("[Hydrology] Invalid riverClass for hydrology/select-navigable-river-terrain.");
    }
    if (!(input.discharge instanceof Float32Array)) {
      throw new Error("[Hydrology] Invalid discharge for hydrology/select-navigable-river-terrain.");
    }
    if (!(input.flowDir instanceof Int32Array)) {
      throw new Error("[Hydrology] Invalid flowDir for hydrology/select-navigable-river-terrain.");
    }
    if (!(input.projectableLandMask instanceof Uint8Array)) {
      throw new Error(
        "[Hydrology] Invalid projectableLandMask for hydrology/select-navigable-river-terrain."
      );
    }
    assertLength("riverClass", input.riverClass.length, size);
    assertLength("discharge", input.discharge.length, size);
    assertLength("flowDir", input.flowDir.length, size);
    assertLength("projectableLandMask", input.projectableLandMask.length, size);

    const plannedMinorRiverMask = new Uint8Array(size);
    const plannedMajorRiverMask = new Uint8Array(size);
    const eligible = new Uint8Array(size);
    let plannedMinorRiverTileCount = 0;
    let plannedMajorRiverTileCount = 0;
    let eligibleTileCount = 0;

    for (let i = 0; i < size; i++) {
      const riverClass = input.riverClass[i] ?? 0;
      if (isMinorRiverClass(riverClass)) {
        plannedMinorRiverMask[i] = 1;
        plannedMinorRiverTileCount += 1;
        continue;
      }
      if (!isMajorRiverClass(riverClass)) continue;
      plannedMajorRiverMask[i] = 1;
      plannedMajorRiverTileCount += 1;
      if (input.projectableLandMask[i] !== 1) continue;
      eligible[i] = 1;
      eligibleTileCount += 1;
    }

    const riverMask = new Uint8Array(size);
    const targetMajorTileFraction = clamp01(config.targetMajorTileFraction);
    const targetTileCount =
      eligibleTileCount === 0 ? 0 : Math.max(1, Math.round(eligibleTileCount * targetMajorTileFraction));

    if (eligibleTileCount === 0 || targetTileCount === 0) {
      return {
        riverMask,
        plannedMinorRiverMask,
        plannedMajorRiverMask,
        selectedTileCount: 0,
        eligibleTileCount,
        plannedMinorRiverTileCount,
        plannedMajorRiverTileCount,
        candidateEndpointCount: 0,
        selectedChainCount: 0,
        targetTileCount,
        targetMajorTileFraction,
        selectedEndpointDischargeFloor: Infinity,
      } as const;
    }

    const upstream: number[][] = Array.from({ length: size }, () => []);
    const allEndpoints: number[] = [];
    const endpointDischarges: number[] = [];

    for (let i = 0; i < size; i++) {
      if (eligible[i] !== 1) continue;
      const receiver = input.flowDir[i] ?? -1;
      if (receiver >= 0 && receiver < size && eligible[receiver] === 1) {
        upstream[receiver]!.push(i);
      } else {
        allEndpoints.push(i);
        endpointDischarges.push(input.discharge[i] ?? 0);
      }
    }

    endpointDischarges.sort((a, b) => a - b);
    const selectedEndpointDischargeFloor = percentileFloor(
      endpointDischarges,
      config.endpointDischargePercentileMin
    );
    const candidateEndpoints = allEndpoints.sort(
      (a, b) => (input.discharge[b] ?? 0) - (input.discharge[a] ?? 0)
    );

    let selectedTileCount = 0;
    let selectedChainCount = 0;

    for (const endpoint of candidateEndpoints) {
      if (selectedTileCount >= targetTileCount && selectedChainCount > 0) break;
      if (riverMask[endpoint] === 1) continue;

      const chain: number[] = [];
      const seen = new Set<number>();
      let current = endpoint;
      while (
        current >= 0 &&
        current < size &&
        eligible[current] === 1 &&
        riverMask[current] !== 1 &&
        !seen.has(current)
      ) {
        seen.add(current);
        chain.push(current);
        current = bestUnselectedUpstream(upstream[current]!, input.discharge, riverMask);
      }

      if (chain.length === 0) continue;
      selectedChainCount += 1;
      for (const index of chain) {
        if (riverMask[index] === 1) continue;
        riverMask[index] = 1;
        selectedTileCount += 1;
      }
    }

    return {
      riverMask,
      plannedMinorRiverMask,
      plannedMajorRiverMask,
      selectedTileCount,
      eligibleTileCount,
      plannedMinorRiverTileCount,
      plannedMajorRiverTileCount,
      candidateEndpointCount: candidateEndpoints.length,
      selectedChainCount,
      targetTileCount,
      targetMajorTileFraction,
      selectedEndpointDischargeFloor,
    } as const;
  },
});
