import { forEachHexNeighborOddQ } from "@swooper/mapgen-core/lib/grid";

import { BOUNDARY_TYPE } from "@mapgen/domain/foundation/constants.js";
import type {
  FoundationTectonicHistoryTiles,
  FoundationTectonicProvenanceTiles,
} from "@mapgen/domain/foundation/ops/compute-plates-tensors/contract.js";

import type { BeltComponentSummary, BeltDriverOutputs } from "./types.js";

const GAP_FILL_DISTANCE = 2;
const MIN_BELT_LENGTH = 3;

// Seed selection: intensity fields are influence fields (nonzero over large radii). We threshold relative to
// the per-type max so seeds form a thin "spine" rather than making the whole world distance=0.
const SEED_THRESHOLD_MIN = 1;
const SEED_THRESHOLD_FRAC_OF_MAX = 0.35;

// Era blending: favor newer eras exponentially, but lightly boost the last-active era when known.
const ERA_WEIGHT_DECAY_PER_ERA = 0.7;
const ERA_WEIGHT_LAST_ACTIVE_BOOST = 1.25;
const ERA_WEIGHT_NON_ACTIVE_SCALE = 0.85;

// Width modulation: more recent uplift implies narrower belts; older uplift yields wider, diffused belts.
const BELT_WIDTH_SCALE_BASE = 1.2;
const BELT_WIDTH_SCALE_RECENCY_RANGE = 0.6;

// Spatial falloff: sigma controls spread (age-shaped), cutoff is a sigma multiple.
const BELT_SIGMA_BASE = 1;
const BELT_SIGMA_AGE_RANGE = 3;

// Distance BFS budget: we cap exploration at a generous multiple of the maximum cutoff.
const BELT_CUTOFF_SIGMA_MULT = 5;
const BELT_MAX_DISTANCE_FUDGE = 1.2;

function clampByte(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value))) | 0;
}

function computeSeedThreshold(maxIntensity: number): number {
  // The foundation boundary/intensity fields are influence fields (often nonzero almost everywhere),
  // so we must seed belts only from the high-intensity spine; otherwise every tile becomes distance=0.
  // This keeps seeding self-calibrating across configs and probes.
  return Math.max(SEED_THRESHOLD_MIN, Math.round(maxIntensity * SEED_THRESHOLD_FRAC_OF_MAX));
}

function computeDistanceField(
  seeds: Uint8Array,
  width: number,
  height: number,
  maxDistance: number
): { distance: Uint8Array; nearestSeed: Int32Array } {
  const size = width * height;
  const distance = new Uint8Array(size);
  distance.fill(255);
  const nearestSeed = new Int32Array(size);
  nearestSeed.fill(-1);

  const queue: number[] = [];
  for (let i = 0; i < size; i++) {
    if (seeds[i]) {
      distance[i] = 0;
      nearestSeed[i] = i;
      queue.push(i);
    }
  }

  let head = 0;
  while (head < queue.length) {
    const i = queue[head++]!;
    const d = distance[i]!;
    if (d >= maxDistance) continue;

    const x = i % width;
    const y = Math.floor(i / width);
    forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
      const ni = ny * width + nx;
      if (distance[ni]! > d + 1) {
        distance[ni] = (d + 1) as number;
        nearestSeed[ni] = nearestSeed[i]!;
        queue.push(ni);
      }
    });
  }

  return { distance, nearestSeed } as const;
}

function filterShortComponents(input: {
  mask: Uint8Array;
  width: number;
  height: number;
  minSize: number;
  boundaryType: number;
  upliftBlend: Float32Array;
  widthScale: Float32Array;
  seedAge: Uint8Array;
  originEra: Uint8Array;
  originPlateId: Int16Array;
  maxAge: number;
  nextComponentId: number;
}): { mask: Uint8Array; components: BeltComponentSummary[]; nextComponentId: number } {
  const size = input.width * input.height;
  const visited = new Uint8Array(size);
  const filtered = new Uint8Array(size);
  const components: BeltComponentSummary[] = [];

  for (let i = 0; i < size; i++) {
    if (!input.mask[i] || visited[i]) continue;
    const queue: number[] = [i];
    visited[i] = 1;
    const indices: number[] = [];

    while (queue.length > 0) {
      const idx = queue.pop()!;
      indices.push(idx);
      const x = idx % input.width;
      const y = Math.floor(idx / input.width);
      forEachHexNeighborOddQ(x, y, input.width, input.height, (nx, ny) => {
        const ni = ny * input.width + nx;
        if (input.mask[ni] && !visited[ni]) {
          visited[ni] = 1;
          queue.push(ni);
        }
      });
    }

    if (indices.length < input.minSize) continue;
    for (const idx of indices) filtered[idx] = 1;

    let upliftSum = 0;
    let widthSum = 0;
    let sigmaSum = 0;
    let originEraSum = 0;
    let originPlateSum = 0;
    for (const idx of indices) {
      upliftSum += input.upliftBlend[idx] ?? 0;
      widthSum += input.widthScale[idx] ?? 0;
      const age = input.seedAge[idx] ?? 0;
      const sigma = 1 + (3 * age) / Math.max(1, input.maxAge);
      sigmaSum += sigma;
      originEraSum += input.originEra[idx] ?? 0;
      originPlateSum += input.originPlateId[idx] ?? 0;
    }
    const denom = Math.max(1, indices.length);
    components.push({
      id: input.nextComponentId,
      boundaryType: input.boundaryType,
      size: indices.length,
      meanUpliftBlend: upliftSum / denom,
      meanWidthScale: widthSum / denom,
      meanSigma: sigmaSum / denom,
      meanOriginEra: originEraSum / denom,
      meanOriginPlateId: originPlateSum / denom,
    });
    input.nextComponentId += 1;
  }

  return { mask: filtered, components, nextComponentId: input.nextComponentId } as const;
}

export function deriveBeltDriversFromHistory(input: {
  width: number;
  height: number;
  historyTiles: FoundationTectonicHistoryTiles;
  provenanceTiles: FoundationTectonicProvenanceTiles;
}): BeltDriverOutputs {
  const width = input.width | 0;
  const height = input.height | 0;
  const size = Math.max(0, width * height);
  const historyTiles = input.historyTiles;
  const provenanceTiles = input.provenanceTiles;

  const eraCount = Math.max(1, historyTiles.eraCount | 0);
  const perEra = historyTiles.perEra ?? [];
  const rollups = historyTiles.rollups ?? {};
  const upliftTotal = rollups.upliftTotal ?? new Uint8Array(size);
  const upliftRecentFraction = rollups.upliftRecentFraction ?? new Uint8Array(size);
  const lastActiveEra = rollups.lastActiveEra ?? new Uint8Array(size);
  const originEra = provenanceTiles.originEra ?? new Uint8Array(size);
  const originPlateId = provenanceTiles.originPlateId ?? new Int16Array(size);
  const lastBoundaryType = provenanceTiles.lastBoundaryType ?? new Uint8Array(size);

  const baseWeights = new Float32Array(eraCount);
  for (let e = 0; e < eraCount; e++) {
    const age = (eraCount - 1 - e) | 0;
    baseWeights[e] = Math.exp(-ERA_WEIGHT_DECAY_PER_ERA * age);
  }

  const boundaryTypeBlend = new Uint8Array(size);
  const upliftBlend = new Float32Array(size);
  const riftBlend = new Float32Array(size);
  const shearBlend = new Float32Array(size);
  const intensityBlend = new Float32Array(size);
  const beltAge = new Uint8Array(size);
  const widthScale = new Float32Array(size);

  const maxAge = Math.max(1, eraCount - 1);
  for (let i = 0; i < size; i++) {
    const lastActive = lastActiveEra[i] ?? 255;
    const boostActive = lastActive !== 255;

    let weightSum = 0;
    const weights = new Float32Array(eraCount);
    for (let e = 0; e < eraCount; e++) {
      const base = baseWeights[e] ?? 0;
      const weight =
        base * (boostActive && e === lastActive ? ERA_WEIGHT_LAST_ACTIVE_BOOST : ERA_WEIGHT_NON_ACTIVE_SCALE);
      weights[e] = weight;
      weightSum += weight;
    }
    if (weightSum <= 0) weightSum = eraCount;

    let bestEra = 0;
    let bestScore = -1;
    let upliftSum = 0;
    let riftSum = 0;
    let shearSum = 0;
    for (let e = 0; e < eraCount; e++) {
      const era = perEra[e];
      if (!era) continue;
      const weight = (weights[e] ?? 0) / weightSum;
      const uplift = era.upliftPotential?.[i] ?? 0;
      const rift = era.riftPotential?.[i] ?? 0;
      const shear = era.shearStress?.[i] ?? 0;
      upliftSum += weight * uplift;
      riftSum += weight * rift;
      shearSum += weight * shear;

      const intensity = Math.max(uplift, rift, shear);
      const score = weight * intensity;
      if (score > bestScore || (score === bestScore && e > bestEra)) {
        bestScore = score;
        bestEra = e;
      }
    }

    riftBlend[i] = riftSum;
    shearBlend[i] = shearSum;
    // Mountain belts should be driven by integrated collision history (upliftTotal), not just the
    // newest-era influence field. Using upliftTotal restores the expected dynamic range for ridge planning.
    upliftBlend[i] = upliftTotal[i] ?? upliftSum;
    intensityBlend[i] = Math.max(upliftBlend[i] ?? 0, riftSum, shearSum);

    const boundary = perEra[bestEra]?.boundaryType?.[i] ?? BOUNDARY_TYPE.none;
    let resolvedBoundary = clampByte(boundary);
    if (resolvedBoundary === BOUNDARY_TYPE.none) {
      const provenanceBoundary = lastBoundaryType[i] ?? 255;
      if (provenanceBoundary !== 255) resolvedBoundary = clampByte(provenanceBoundary);
    }
    boundaryTypeBlend[i] = resolvedBoundary;

    const recent = upliftRecentFraction[i] ?? 0;
    widthScale[i] = BELT_WIDTH_SCALE_BASE - BELT_WIDTH_SCALE_RECENCY_RANGE * (recent / 255);

    const origin = originEra[i] ?? 0;
    const age =
      lastActive !== 255
        ? Math.max(0, maxAge - Math.min(maxAge, lastActive))
        : Math.max(0, maxAge - Math.min(maxAge, origin));
    beltAge[i] = clampByte(age);
  }

  const typeSeeds: Record<number, Uint8Array> = {
    [BOUNDARY_TYPE.convergent]: new Uint8Array(size),
    [BOUNDARY_TYPE.divergent]: new Uint8Array(size),
    [BOUNDARY_TYPE.transform]: new Uint8Array(size),
  };

  const maxIntensityByType: Record<number, number> = {
    [BOUNDARY_TYPE.convergent]: 0,
    [BOUNDARY_TYPE.divergent]: 0,
    [BOUNDARY_TYPE.transform]: 0,
  };
  for (let i = 0; i < size; i++) {
    const boundary = boundaryTypeBlend[i] ?? BOUNDARY_TYPE.none;
    if (!typeSeeds[boundary]) continue;
    const intensity = intensityBlend[i] ?? 0;
    maxIntensityByType[boundary] = Math.max(maxIntensityByType[boundary] ?? 0, intensity);
  }
  const seedThresholdByType: Record<number, number> = {
    [BOUNDARY_TYPE.convergent]: computeSeedThreshold(maxIntensityByType[BOUNDARY_TYPE.convergent] ?? 0),
    [BOUNDARY_TYPE.divergent]: computeSeedThreshold(maxIntensityByType[BOUNDARY_TYPE.divergent] ?? 0),
    [BOUNDARY_TYPE.transform]: computeSeedThreshold(maxIntensityByType[BOUNDARY_TYPE.transform] ?? 0),
  };

  for (let i = 0; i < size; i++) {
    const boundary = boundaryTypeBlend[i] ?? BOUNDARY_TYPE.none;
    const intensity = intensityBlend[i] ?? 0;
    // `boundaryTypeBlend` is a tiled "dominant influence" map (often nonzero everywhere) because
    // tectonic emissions are long-range fields. Belts must be seeded from only the high-intensity
    // spine, otherwise every tile becomes distance=0 and downstream orogeny collapses.
    if (boundary !== BOUNDARY_TYPE.none && intensity >= (seedThresholdByType[boundary] ?? 1)) {
      if (typeSeeds[boundary]) typeSeeds[boundary][i] = 1;
    }
  }

  let nextComponentId = 1;
  const beltMask = new Uint8Array(size);
  const beltComponents: BeltComponentSummary[] = [];

  for (const boundaryType of [
    BOUNDARY_TYPE.convergent,
    BOUNDARY_TYPE.divergent,
    BOUNDARY_TYPE.transform,
  ]) {
    const seeds = typeSeeds[boundaryType];
    const expanded = new Uint8Array(size);
    if (seeds) {
      const { distance } = computeDistanceField(seeds, width, height, GAP_FILL_DISTANCE);
      for (let i = 0; i < size; i++) {
        if (distance[i]! <= GAP_FILL_DISTANCE && boundaryTypeBlend[i] === boundaryType) {
          expanded[i] = 1;
        }
      }
    }

    const filtered = filterShortComponents({
      mask: expanded,
      width,
      height,
      minSize: MIN_BELT_LENGTH,
      boundaryType,
      upliftBlend,
      widthScale,
      seedAge: beltAge,
      originEra,
      originPlateId,
      maxAge,
      nextComponentId,
    });
    nextComponentId = filtered.nextComponentId;
    for (const component of filtered.components) beltComponents.push(component);
    const filteredMask = filtered.mask;
    for (let i = 0; i < size; i++) {
      if (filteredMask[i]) beltMask[i] = 1;
    }
  }

  const maxSigma = BELT_SIGMA_BASE + BELT_SIGMA_AGE_RANGE * (maxAge / Math.max(1, maxAge));
  const maxDistance = Math.max(1, Math.round(BELT_CUTOFF_SIGMA_MULT * maxSigma * BELT_MAX_DISTANCE_FUDGE));
  // Seed diffusion from the high-intensity spine (not the entire beltMask), otherwise
  // beltDistance collapses to 0 across the belt and boundaryCloseness saturates everywhere.
  const beltSeedMask = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    if (beltMask[i] !== 1) continue;
    const boundary = boundaryTypeBlend[i] ?? BOUNDARY_TYPE.none;
    const seeds = typeSeeds[boundary];
    if (!seeds) continue;
    if (seeds[i] !== 1) continue;
    beltSeedMask[i] = 1;
  }
  const { distance: beltDistance, nearestSeed: beltNearestSeed } = computeDistanceField(
    beltSeedMask,
    width,
    height,
    maxDistance
  );

  const boundaryCloseness = new Uint8Array(size);
  const boundaryType = new Uint8Array(size);
  const upliftPotential = new Uint8Array(size);
  const riftPotential = new Uint8Array(size);
  const tectonicStress = new Uint8Array(size);

  for (let i = 0; i < size; i++) {
    const seedIndex = beltNearestSeed[i] ?? -1;
    if (seedIndex < 0) continue;

    const seedIntensity = intensityBlend[seedIndex] ?? 0;
    if (seedIntensity <= 0) continue;

    const seedUplift = upliftBlend[seedIndex] ?? 0;
    const seedRift = riftBlend[seedIndex] ?? 0;
    const seedShear = shearBlend[seedIndex] ?? 0;
    const seedType = boundaryTypeBlend[seedIndex] ?? BOUNDARY_TYPE.none;
    const seedWidthScale = widthScale[seedIndex] ?? 1;
    const seedAge = beltAge[seedIndex] ?? 0;
    const sigma = BELT_SIGMA_BASE + (BELT_SIGMA_AGE_RANGE * seedAge) / Math.max(1, maxAge);
    const cutoff = Math.max(1, Math.round(BELT_CUTOFF_SIGMA_MULT * sigma * seedWidthScale));

    const dist = beltDistance[i] ?? 255;
    if (dist > cutoff) continue;

    const normalized = Math.max(0, 1 - dist / cutoff);
    // Proximity should be a pure distance signal; intensity is carried by uplift/rift/stress fields.
    boundaryCloseness[i] = clampByte(255 * normalized);
    upliftPotential[i] = clampByte(seedUplift * normalized);
    riftPotential[i] = clampByte(seedRift * normalized);
    const shear = clampByte(seedShear * normalized);
    tectonicStress[i] = clampByte(Math.max(upliftPotential[i]!, riftPotential[i]!, shear));
    boundaryType[i] = seedType;
  }

  return {
    boundaryCloseness,
    boundaryType,
    upliftPotential,
    riftPotential,
    tectonicStress,
    beltMask,
    beltDistance,
    beltNearestSeed,
    beltComponents,
  } as const;
}
