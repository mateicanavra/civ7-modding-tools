import {
  isMajorRiverClass,
  isMinorRiverClass,
} from "@mapgen/domain/hydrology/modules/hydrography/model/policy/river-class.js";
import {
  HYDROLOGY_MOUTH_ACCEPTED_LAKE,
  HYDROLOGY_MOUTH_OCEAN,
  HYDROLOGY_MOUTH_SPILL_PATH,
} from "@mapgen/domain/hydrology/modules/hydrography/model/policy/river-network-classification.js";
import { clampPct } from "@swooper/mapgen-core/lib/math";

/** Numeric thresholds resolved from one authored navigable-river density. */
export type NavigableRiverProjectionThresholds = Readonly<{
  endpointDischargePercentileMin: number;
  targetMajorTileFraction: number;
}>;

/**
 * Sparse, normal, and dense navigable-river projection thresholds for endpoint-discharge
 * percentile and major-river tile coverage.
 */
export const NAVIGABLE_RIVER_PROJECTION_POLICY = {
  sparse: {
    endpointDischargePercentileMin: 0.97,
    targetMajorTileFraction: 0.18,
  },
  normal: {
    endpointDischargePercentileMin: 0.94,
    targetMajorTileFraction: 0.28,
  },
  dense: {
    endpointDischargePercentileMin: 0.9,
    targetMajorTileFraction: 0.4,
  },
} as const satisfies Record<string, NavigableRiverProjectionThresholds>;

/** The authored density presets derived from the projection policy's canonical keys. */
export type NavigableRiverDensityKnob = keyof typeof NAVIGABLE_RIVER_PROJECTION_POLICY;

/** Engine-constrained evidence used to choose the navigable subset of Hydrology river truth. */
type NavigableRiverSelectionInput = Readonly<{
  width: number;
  height: number;
  riverClass: ArrayLike<number>;
  discharge: ArrayLike<number>;
  flowDir: ArrayLike<number>;
  mouthType: ArrayLike<number>;
  lakeMask: ArrayLike<number>;
  projectableLandMask: ArrayLike<number>;
}>;

/** Projection plan and selection evidence consumed by the plot-rivers step. */
type NavigableRiverSelection = Readonly<{
  riverMask: Uint8Array;
  plannedMinorRiverMask: Uint8Array;
  plannedMajorRiverMask: Uint8Array;
  selectedTileCount: number;
  eligibleTileCount: number;
  plannedMinorRiverTileCount: number;
  plannedMajorRiverTileCount: number;
  candidateEndpointCount: number;
  selectedChainCount: number;
  selectedChainLengths: Uint16Array;
  longestSelectedChainLength: number;
  meanSelectedChainLength: number;
  targetTileCount: number;
  targetMajorTileFraction: number;
  selectedEndpointDischargeFloor: number;
  nonProjectableMajorTileCount: number;
  unselectedEligibleMajorTileCount: number;
}>;

function percentileFloor(valuesAscending: readonly number[], percentile: number): number {
  if (valuesAscending.length === 0) return 0;
  const p = clampPct(percentile, 0, 1, 0);
  const index = Math.floor((valuesAscending.length - 1) * p);
  return valuesAscending[index] ?? 0;
}

function bestUnselectedUpstream(
  upstream: readonly number[],
  discharge: ArrayLike<number>,
  selectedMask: ArrayLike<number>,
  projectableLandMask: ArrayLike<number>,
  corridorMask: ArrayLike<number>
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

/** Selects coherent engine-projectable river chains from immutable Hydrology evidence. */
export function selectNavigableRiverTerrain(
  input: NavigableRiverSelectionInput,
  config: NavigableRiverProjectionThresholds
): NavigableRiverSelection {
  const width = input.width;
  const height = input.height;
  const size = width * height;

  const plannedMinorRiverMask = new Uint8Array(size);
  const plannedMajorRiverMask = new Uint8Array(size);
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
  const targetMajorTileFraction = clampPct(config.targetMajorTileFraction, 0, 1, 0);
  const targetTileCount =
    eligibleTileCount === 0
      ? 0
      : Math.max(1, Math.round(eligibleTileCount * targetMajorTileFraction));
  const nonProjectableMajorTileCount = Math.max(0, plannedMajorRiverTileCount - eligibleTileCount);

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
      selectedEndpointDischargeFloor: 0,
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
      : selectedChainLengths.reduce((sum, length) => sum + length, 0) / selectedChainLengths.length;

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
}
