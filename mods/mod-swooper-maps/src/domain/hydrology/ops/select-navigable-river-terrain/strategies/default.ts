import { createStrategy } from "@swooper/mapgen-core/authoring";
import { isMajorRiverClass, isMinorRiverClass } from "../../../river-class.js";
import {
  HYDROLOGY_MOUTH_ACCEPTED_LAKE,
  HYDROLOGY_MOUTH_OCEAN,
  HYDROLOGY_MOUTH_SPILL_PATH,
} from "../../../river-network-metrics.js";
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
  selectedMask: Uint8Array,
  projectableLandMask: Uint8Array,
  corridorMask: Uint8Array
): number {
  let bestIndex = -1;
  let bestDischarge = -Infinity;
  for (const index of upstream) {
    if (corridorMask[index] !== 1) continue;
    if (projectableLandMask[index] === 1 && selectedMask[index] === 1) continue;
    const currentDischarge = discharge[index] ?? 0;
    if (currentDischarge <= bestDischarge) continue;
    bestDischarge = currentDischarge;
    bestIndex = index;
  }
  return bestIndex;
}

function isTerminalAnchoredMouth(mouthType: number): boolean {
  return (
    mouthType === HYDROLOGY_MOUTH_OCEAN ||
    mouthType === HYDROLOGY_MOUTH_ACCEPTED_LAKE ||
    mouthType === HYDROLOGY_MOUTH_SPILL_PATH
  );
}

export const defaultStrategy = createStrategy(SelectNavigableRiverTerrainContract, "default", {
  run: (input, config) => {
    const width = input.width | 0;
    const height = input.height | 0;
    const size = Math.max(0, width * height);

    if (!(input.riverClass instanceof Uint8Array)) {
      throw new Error(
        "[Hydrology] Invalid riverClass for hydrology/select-navigable-river-terrain."
      );
    }
    if (!(input.discharge instanceof Float32Array)) {
      throw new Error(
        "[Hydrology] Invalid discharge for hydrology/select-navigable-river-terrain."
      );
    }
    if (!(input.flowDir instanceof Int32Array)) {
      throw new Error("[Hydrology] Invalid flowDir for hydrology/select-navigable-river-terrain.");
    }
    if (!(input.mouthType instanceof Uint8Array)) {
      throw new Error(
        "[Hydrology] Invalid mouthType for hydrology/select-navigable-river-terrain."
      );
    }
    if (!(input.lakeMask instanceof Uint8Array)) {
      throw new Error("[Hydrology] Invalid lakeMask for hydrology/select-navigable-river-terrain.");
    }
    if (!(input.projectableLandMask instanceof Uint8Array)) {
      throw new Error(
        "[Hydrology] Invalid projectableLandMask for hydrology/select-navigable-river-terrain."
      );
    }
    assertLength("riverClass", input.riverClass.length, size);
    assertLength("discharge", input.discharge.length, size);
    assertLength("flowDir", input.flowDir.length, size);
    assertLength("mouthType", input.mouthType.length, size);
    assertLength("lakeMask", input.lakeMask.length, size);
    assertLength("projectableLandMask", input.projectableLandMask.length, size);

    const plannedMinorRiverMask = new Uint8Array(size);
    const plannedMajorRiverMask = new Uint8Array(size);
    const majorPathMask = new Uint8Array(size);
    const corridorMask = new Uint8Array(size);
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
      majorPathMask[i] = 1;
      plannedMajorRiverTileCount += 1;
      if (input.projectableLandMask[i] === 1) {
        corridorMask[i] = 1;
        eligible[i] = 1;
        eligibleTileCount += 1;
        continue;
      }
      if (input.lakeMask[i] === 1) {
        corridorMask[i] = 1;
      }
    }

    const riverMask = new Uint8Array(size);
    const targetMajorTileFraction = clamp01(config.targetMajorTileFraction);
    const targetTileCount =
      eligibleTileCount === 0
        ? 0
        : Math.max(1, Math.round(eligibleTileCount * targetMajorTileFraction));
    const nonProjectableMajorTileCount = Math.max(
      0,
      plannedMajorRiverTileCount - eligibleTileCount
    );

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
        selectedChainLengths: new Uint16Array(0),
        longestSelectedChainLength: 0,
        meanSelectedChainLength: 0,
        targetTileCount,
        targetMajorTileFraction,
        selectedEndpointDischargeFloor: Infinity,
        nonProjectableMajorTileCount,
        unselectedEligibleMajorTileCount: eligibleTileCount,
      } as const;
    }

    const upstream: number[][] = Array.from({ length: size }, () => []);
    const allEndpoints: number[] = [];
    const endpointDischarges: number[] = [];

    for (let i = 0; i < size; i++) {
      if (corridorMask[i] !== 1) continue;
      const receiver = input.flowDir[i] ?? -1;
      if (receiver >= 0 && receiver < size && corridorMask[receiver] === 1) {
        upstream[receiver]!.push(i);
      } else if (isTerminalAnchoredMouth(input.mouthType[i] ?? 0)) {
        allEndpoints.push(i);
        endpointDischarges.push(input.discharge[i] ?? 0);
      }
    }

    endpointDischarges.sort((a, b) => a - b);
    const selectedEndpointDischargeFloor = percentileFloor(
      endpointDischarges,
      config.endpointDischargePercentileMin
    );
    const candidateEndpoints = allEndpoints
      .filter((endpoint) => (input.discharge[endpoint] ?? 0) >= selectedEndpointDischargeFloor)
      .sort((a, b) => (input.discharge[b] ?? 0) - (input.discharge[a] ?? 0));

    let selectedTileCount = 0;
    let selectedChainCount = 0;
    const selectedChainLengths: number[] = [];

    for (const endpoint of candidateEndpoints) {
      if (selectedTileCount >= targetTileCount && selectedChainCount > 0) break;
      if (riverMask[endpoint] === 1) continue;

      const chain: number[] = [];
      const seen = new Set<number>();
      let current = endpoint;
      while (current >= 0 && current < size && corridorMask[current] === 1 && !seen.has(current)) {
        seen.add(current);
        if (eligible[current] === 1) {
          if (riverMask[current] === 1) break;
          chain.push(current);
        }
        current = bestUnselectedUpstream(
          upstream[current]!,
          input.discharge,
          riverMask,
          input.projectableLandMask,
          corridorMask
        );
      }

      if (chain.length === 0) continue;
      selectedChainCount += 1;
      selectedChainLengths.push(chain.length);
      for (const index of chain) {
        if (riverMask[index] === 1) continue;
        riverMask[index] = 1;
        selectedTileCount += 1;
      }
    }

    const longestSelectedChainLength =
      selectedChainLengths.length === 0 ? 0 : Math.max(...selectedChainLengths);
    const meanSelectedChainLength =
      selectedChainLengths.length === 0
        ? 0
        : selectedChainLengths.reduce((sum, length) => sum + length, 0) /
          selectedChainLengths.length;

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
      selectedChainLengths: Uint16Array.from(selectedChainLengths),
      longestSelectedChainLength,
      meanSelectedChainLength,
      targetTileCount,
      targetMajorTileFraction,
      selectedEndpointDischargeFloor,
      nonProjectableMajorTileCount,
      unselectedEligibleMajorTileCount: Math.max(0, eligibleTileCount - selectedTileCount),
    } as const;
  },
});
