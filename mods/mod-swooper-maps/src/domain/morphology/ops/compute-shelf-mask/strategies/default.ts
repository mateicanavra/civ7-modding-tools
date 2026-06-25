import { createStrategy } from "@swooper/mapgen-core/authoring";
import { forEachHexNeighborOddQ } from "@swooper/mapgen-core/lib/grid";
import { clampInt16 } from "@swooper/mapgen-core/lib/math";

import ComputeShelfMaskContract from "../contract.js";

const BOUNDARY_CONVERGENT = 1;
const BOUNDARY_TRANSFORM = 3;

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function clampNonNegative(value: number, fallback: number): number {
  if (!Number.isFinite(value) || value < 0) return fallback;
  return value;
}

/** Quantile over the filled prefix of a nearshore-bathymetry sample (ascending: deepest -> shallowest). */
function computeQuantileCutoff(values: Int16Array, count: number, qUnit: number): number {
  if (count <= 0) return 0;
  const copy: number[] = new Array(count);
  for (let i = 0; i < count; i++) copy[i] = values[i] as number;
  copy.sort((a, b) => a - b);
  const q = clamp01(qUnit);
  const idx = Math.floor(q * (count - 1));
  // Bathymetry is <= 0 in water by contract; clamp defensively.
  return Math.min(0, copy[idx] ?? 0);
}

export const defaultStrategy = createStrategy(ComputeShelfMaskContract, "default", {
  // Config canonicalization belongs here, not in run(): clamp the physical parameters into
  // their valid ranges once so run() carries only the shelf physics.
  normalize: (config) => ({
    ...config,
    shallowQuantile: clamp01(config.shallowQuantile),
    breakDepthSampleRadius: Math.max(
      1,
      Math.trunc(clampNonNegative(config.breakDepthSampleRadius, 8))
    ),
    activeClosenessThreshold: clamp01(config.activeClosenessThreshold),
    activeBreakDepthFactor: clampNonNegative(config.activeBreakDepthFactor, 0.6),
    passiveBreakDepthFactor: clampNonNegative(config.passiveBreakDepthFactor, 1.25),
    // A depth floor: must be <= 0 (bathymetry contract). Less-negative-than-0 collapses to 0.
    absoluteMaxShelfDepth: Math.min(0, Math.trunc(config.absoluteMaxShelfDepth)),
    breakDepthScale: clampNonNegative(config.breakDepthScale, 1),
  }),
  run: (input, config) => {
    const { width, height } = input;
    const size = Math.max(0, (width | 0) * (height | 0));

    const landMask = input.landMask as Uint8Array;
    const bathymetry = input.bathymetry as Int16Array;
    const distanceToCoast = input.distanceToCoast as Uint16Array;
    const boundaryCloseness = input.boundaryCloseness as Uint8Array;
    const boundaryType = input.boundaryType as Uint8Array;

    const sampleRadius = config.breakDepthSampleRadius;
    const absoluteMaxShelfDepth = config.absoluteMaxShelfDepth;
    const activeThresholdU8 = Math.floor(config.activeClosenessThreshold * 255);

    // 1) Estimate the base shelf-break depth from nearshore bathymetry. The shoreline ring
    //    (distance 0) is excluded from the SAMPLE only — it is clamped to sea level and would
    //    skew the cutoff toward 0 — but it remains eligible for shelf membership below.
    const nearshoreSamples = new Int16Array(size);
    let sampleCount = 0;
    for (let i = 0; i < size; i++) {
      if (landMask[i] === 1) continue;
      const dist = distanceToCoast[i] | 0;
      if (dist <= 0 || dist > sampleRadius) continue;
      // Clamp on ingest: bathymetry is <=0 in water by contract, but a single
      // contract-violating positive sample would skew the whole-map quantile
      // toward shallower (narrowing every shelf), so guard the estimator here too.
      nearshoreSamples[sampleCount++] = Math.min(0, bathymetry[i] ?? 0);
    }
    const shallowCutoff = computeQuantileCutoff(
      nearshoreSamples,
      sampleCount,
      config.shallowQuantile
    );

    // 2) Per-tile, margin-modulated break depth + depth gate. Active margins use a shallower
    //    break (narrower shelf); passive margins a deeper one (wider). The absolute floor bounds
    //    how DEEP the break may reach — it stops a steep margin/scale from pushing the gate into
    //    true deep ocean. It does NOT (and cannot) bound a uniformly-shallow sea, where the gate
    //    legitimately admits the whole connected basin. A physical depth, not a tile-distance cap.
    const activeMarginMask = new Uint8Array(size);
    const depthGateMask = new Uint8Array(size);
    const nearshoreCandidateMask = new Uint8Array(size);
    const shelfBreakDepthByTile = new Int16Array(size);
    for (let i = 0; i < size; i++) {
      if (landMask[i] === 1) continue;

      const dist = distanceToCoast[i] | 0;
      if (dist > 0 && dist <= sampleRadius) nearshoreCandidateMask[i] = 1;

      const t = boundaryType[i] | 0;
      const isActiveMargin =
        (t === BOUNDARY_CONVERGENT || t === BOUNDARY_TRANSFORM) &&
        (boundaryCloseness[i] | 0) >= activeThresholdU8;
      if (isActiveMargin) activeMarginMask[i] = 1;

      const marginFactor = isActiveMargin
        ? config.activeBreakDepthFactor
        : config.passiveBreakDepthFactor;
      // shallowCutoff <= 0; scaling by positive factors keeps it <= 0. Clamp to the floor.
      const rawBreak = shallowCutoff * config.breakDepthScale * marginFactor;
      const breakDepth = clampInt16(
        Math.max(absoluteMaxShelfDepth, Math.min(0, Math.round(rawBreak)))
      );
      shelfBreakDepthByTile[i] = breakDepth;

      if ((bathymetry[i] ?? 0) >= breakDepth) depthGateMask[i] = 1;
    }

    // 3) Connectivity to shore: shelf = depth-gated water reachable from a land-adjacent
    //    water tile through contiguous depth-gated water. This bounds extent at the shelf
    //    break without any tile-distance cap, and excludes deep isolated shallow pockets.
    const shelfMask = new Uint8Array(size);
    const queue = new Int32Array(size);
    let head = 0;
    let tail = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x;
        if (landMask[i] === 1 || depthGateMask[i] !== 1) continue;
        let adjacentToLand = false;
        forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
          if (adjacentToLand) return;
          if (landMask[ny * width + nx] === 1) adjacentToLand = true;
        });
        if (!adjacentToLand) continue;
        shelfMask[i] = 1;
        queue[tail++] = i;
      }
    }
    while (head < tail) {
      const idx = queue[head++]!;
      const y = (idx / width) | 0;
      const x = idx - y * width;
      forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
        const ni = ny * width + nx;
        if (landMask[ni] === 1 || shelfMask[ni] === 1 || depthGateMask[ni] !== 1) return;
        shelfMask[ni] = 1;
        queue[tail++] = ni;
      });
    }

    return {
      shelfMask,
      activeMarginMask,
      depthGateMask,
      nearshoreCandidateMask,
      shelfBreakDepthByTile,
      shallowCutoff,
    };
  },
});
