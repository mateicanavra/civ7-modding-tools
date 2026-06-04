import { getHexNeighborIndicesOddQ } from "@swooper/mapgen-core/lib/grid";

export type NavigableRiverMaterializationResult = Readonly<{
  riverMask: Uint8Array;
  selectedTileCount: number;
  eligibleTileCount: number;
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

  const eligible = new Uint8Array(size);
  let eligibleTileCount = 0;
  for (let i = 0; i < size; i++) {
    if (params.projectableLandMask[i] !== 1) continue;
    if ((params.riverClass[i] ?? 0) <= 0) continue;
    eligible[i] = 1;
    eligibleTileCount += 1;
  }

  if (targetTileCount === 0 || eligibleTileCount === 0) {
    return {
      riverMask: new Uint8Array(size),
      selectedTileCount: 0,
      eligibleTileCount,
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

  if (selectedTileCount < targetTileCount) {
    const fallback = selectConnectedCorridors({
      width,
      height,
      eligible,
      discharge: params.discharge,
      selectedMask: riverMask,
      minLength,
      maxLength,
      remainingTileBudget: targetTileCount - selectedTileCount,
    });
    selectedTileCount += fallback.selectedTileCount;
    selectedChainCount += fallback.selectedChainCount;
  }

  return {
    riverMask,
    selectedTileCount,
    eligibleTileCount,
    candidateEndpointCount: endpoints.length,
    selectedChainCount,
    targetTileCount,
    minLength,
    maxLength,
  };
}

function selectConnectedCorridors(params: {
  width: number;
  height: number;
  eligible: Uint8Array;
  discharge: Float32Array;
  selectedMask: Uint8Array;
  minLength: number;
  maxLength: number;
  remainingTileBudget: number;
}): Readonly<{ selectedTileCount: number; selectedChainCount: number }> {
  const size = params.width * params.height;
  const visited = new Uint8Array(size);
  const seeds: number[] = [];
  for (let i = 0; i < size; i++) {
    if (params.eligible[i] === 1 && params.selectedMask[i] !== 1) seeds.push(i);
  }
  seeds.sort((a, b) => (params.discharge[b] ?? 0) - (params.discharge[a] ?? 0));

  let selectedTileCount = 0;
  let selectedChainCount = 0;
  for (const seed of seeds) {
    if (selectedTileCount >= params.remainingTileBudget) break;
    if (visited[seed] === 1 || params.selectedMask[seed] === 1) continue;

    const component = collectConnectedEligibleComponent(seed, params);
    for (const index of component) visited[index] = 1;
    if (component.length < params.minLength) continue;

    component.sort((a, b) => (params.discharge[b] ?? 0) - (params.discharge[a] ?? 0));
    const take = Math.min(
      component.length,
      params.maxLength,
      params.remainingTileBudget - selectedTileCount
    );
    if (take < params.minLength && selectedTileCount + take < params.remainingTileBudget) continue;
    for (let i = 0; i < take; i++) {
      params.selectedMask[component[i]!] = 1;
      selectedTileCount += 1;
    }
    selectedChainCount += 1;
  }

  return { selectedTileCount, selectedChainCount };
}

function collectConnectedEligibleComponent(
  seed: number,
  params: {
    width: number;
    height: number;
    eligible: Uint8Array;
    selectedMask: Uint8Array;
  }
): number[] {
  const queue = [seed];
  const queued = new Set<number>([seed]);
  const component: number[] = [];
  for (let head = 0; head < queue.length; head++) {
    const current = queue[head]!;
    if (params.eligible[current] !== 1 || params.selectedMask[current] === 1) continue;
    component.push(current);
    const x = current % params.width;
    const y = Math.floor(current / params.width);
    for (const neighbor of getHexNeighborIndicesOddQ(x, y, params.width, params.height)) {
      if (queued.has(neighbor)) continue;
      if (params.eligible[neighbor] !== 1 || params.selectedMask[neighbor] === 1) continue;
      queued.add(neighbor);
      queue.push(neighbor);
    }
  }
  return component;
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
