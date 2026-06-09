import { isMajorRiverClass, isMinorRiverClass } from "../../../domain/hydrology/river-class.js";

export type NavigableRiverMaterializationResult = Readonly<{
  riverMask: Uint8Array;
  plannedMinorRiverMask: Uint8Array;
  plannedMajorRiverMask: Uint8Array;
  selectedTileCount: number;
  eligibleTileCount: number;
  plannedMinorRiverTileCount: number;
  plannedMajorRiverTileCount: number;
  candidateEndpointCount: number;
  selectedChainCount: number;
  targetTileCount: number;
  minLength: number;
  maxLength: number;
}>;

export function materializeNavigableRiverMask(params: {
  width: number;
  height: number;
  riverClass: Uint8Array;
  discharge: Float32Array;
  flowDir: Int32Array;
  projectableLandMask: Uint8Array;
  minLength: number;
  maxLength: number;
  targetTileCount?: number;
}): NavigableRiverMaterializationResult {
  const width = Math.max(0, params.width | 0);
  const height = Math.max(0, params.height | 0);
  const size = width * height;
  assertLength("riverClass", params.riverClass.length, size);
  assertLength("discharge", params.discharge.length, size);
  assertLength("flowDir", params.flowDir.length, size);
  assertLength("projectableLandMask", params.projectableLandMask.length, size);

  const minLength = Math.max(1, Math.min(64, Math.trunc(params.minLength)));
  const maxLength = Math.max(minLength, Math.min(128, Math.trunc(params.maxLength)));
  const projectableLandCount = countMask(params.projectableLandMask);
  const rawTargetTileCount = Math.trunc(
    params.targetTileCount ?? projectableLandCount / (minLength + 2 * maxLength)
  );
  const targetTileCount = Math.max(
    0,
    Math.min(projectableLandCount, projectableLandCount > 0 ? Math.max(minLength, rawTargetTileCount) : 0)
  );

  const plannedMinorRiverMask = new Uint8Array(size);
  const plannedMajorRiverMask = new Uint8Array(size);
  let plannedMinorRiverTileCount = 0;
  let plannedMajorRiverTileCount = 0;
  for (let i = 0; i < size; i++) {
    const riverClass = params.riverClass[i] ?? 0;
    if (isMinorRiverClass(riverClass)) {
      plannedMinorRiverMask[i] = 1;
      plannedMinorRiverTileCount += 1;
    } else if (isMajorRiverClass(riverClass)) {
      plannedMajorRiverMask[i] = 1;
      plannedMajorRiverTileCount += 1;
    }
  }

  const eligible = new Uint8Array(size);
  let eligibleTileCount = 0;
  for (let i = 0; i < size; i++) {
    if (params.projectableLandMask[i] !== 1) continue;
    if (!isMajorRiverClass(params.riverClass[i])) continue;
    eligible[i] = 1;
    eligibleTileCount += 1;
  }

  if (targetTileCount === 0 || eligibleTileCount === 0) {
    return {
      riverMask: new Uint8Array(size),
      plannedMinorRiverMask,
      plannedMajorRiverMask,
      selectedTileCount: 0,
      eligibleTileCount,
      plannedMinorRiverTileCount,
      plannedMajorRiverTileCount,
      candidateEndpointCount: 0,
      selectedChainCount: 0,
      targetTileCount,
      minLength,
      maxLength,
    };
  }

  const upstream: number[][] = Array.from({ length: size }, () => []);
  for (let i = 0; i < size; i++) {
    if (eligible[i] !== 1) continue;
    const receiver = params.flowDir[i] ?? -1;
    if (receiver < 0 || receiver >= size || eligible[receiver] !== 1) continue;
    upstream[receiver]!.push(i);
  }

  const endpoints: number[] = [];
  for (let i = 0; i < size; i++) {
    if (eligible[i] !== 1) continue;
    const receiver = params.flowDir[i] ?? -1;
    if (receiver < 0 || receiver >= size || eligible[receiver] !== 1) endpoints.push(i);
  }
  endpoints.sort((a, b) => (params.discharge[b] ?? 0) - (params.discharge[a] ?? 0));

  const riverMask = new Uint8Array(size);
  let selectedTileCount = 0;
  let selectedChainCount = 0;
  for (const endpoint of endpoints) {
    if (selectedTileCount >= targetTileCount) break;
    if (riverMask[endpoint] === 1) continue;

    const chain: number[] = [];
    let current = endpoint;
    const seen = new Set<number>();
    while (
      current >= 0 &&
      current < size &&
      eligible[current] === 1 &&
      riverMask[current] !== 1 &&
      !seen.has(current) &&
      chain.length < maxLength
    ) {
      seen.add(current);
      chain.push(current);
      current = highestDischargeUnselectedUpstream(upstream[current]!, params.discharge, riverMask);
    }

    if (chain.length < minLength) continue;
    selectedChainCount += 1;
    for (const index of chain) {
      if (riverMask[index] === 1) continue;
      riverMask[index] = 1;
      selectedTileCount += 1;
      if (selectedTileCount >= targetTileCount) break;
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
    candidateEndpointCount: endpoints.length,
    selectedChainCount,
    targetTileCount,
    minLength,
    maxLength,
  };
}

function highestDischargeUnselectedUpstream(
  upstream: readonly number[],
  discharge: Float32Array,
  selectedMask: Uint8Array
): number {
  let bestIndex = -1;
  let bestScore = -Infinity;
  for (const index of upstream) {
    if (selectedMask[index] === 1) continue;
    const score = discharge[index] ?? 0;
    if (score <= bestScore) continue;
    bestScore = score;
    bestIndex = index;
  }
  return bestIndex;
}

function countMask(mask: Uint8Array): number {
  let count = 0;
  for (const value of mask) {
    if (value === 1) count += 1;
  }
  return count;
}

function assertLength(name: string, actual: number, expected: number): void {
  if (actual !== expected) {
    throw new Error(
      `[navigableRiverMaterialization] ${name} length ${actual} does not match ${expected}.`
    );
  }
}
