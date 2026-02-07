import { createStrategy } from "@swooper/mapgen-core/authoring";
import { clampInt } from "@swooper/mapgen-core/lib/math";

import ComputeShelfMaskContract from "../contract.js";

const BOUNDARY_CONVERGENT = 1;
const BOUNDARY_TRANSFORM = 3;

function computeQuantileCutoff(values: Int16Array, count: number, q01: number): number {
  if (count <= 0) return 0;

  // Copy into a normal array for a simple deterministic quantile.
  // Nearshore set is relatively small in practice; keep this maximally minimal.
  const copy: number[] = new Array(count);
  for (let i = 0; i < count; i++) copy[i] = values[i] as number;
  copy.sort((a, b) => a - b); // ascending: deepest (more negative) -> shallowest (towards 0)

  const q = Math.max(0, Math.min(1, q01));
  const idx = Math.floor(q * (count - 1));
  const cutoff = copy[idx] ?? 0;
  // Bathymetry contract says <= 0 in water; clamp just in case.
  return Math.min(0, cutoff);
}

export const defaultStrategy = createStrategy(ComputeShelfMaskContract, "default", {
  run: (input, config) => {
    const { width, height } = input;
    const size = Math.max(0, (width | 0) * (height | 0));

    const landMask = input.landMask as Uint8Array;
    const bathymetry = input.bathymetry as Int16Array;
    const distanceToCoast = input.distanceToCoast as Uint16Array;
    const boundaryCloseness = input.boundaryCloseness as Uint8Array;
    const boundaryType = input.boundaryType as Uint8Array;

    if (
      landMask.length !== size ||
      bathymetry.length !== size ||
      distanceToCoast.length !== size ||
      boundaryCloseness.length !== size ||
      boundaryType.length !== size
    ) {
      throw new Error("[ShelfMask] Input tensors must match width*height.");
    }

    const nearshoreDistance = clampInt(config.nearshoreDistance, 0, 65535);
    const capMax = clampInt(config.capTilesMax, 0, 65535);
    const capActive = clampInt(config.capTilesActive, 0, capMax);
    const capPassive = clampInt(config.capTilesPassive, 0, capMax);

    // Sample nearshore bathymetry over candidate nearshore water tiles.
    // We store into a fixed array then quantile over the filled prefix.
    const nearshoreSamples = new Int16Array(size);
    let sampleCount = 0;
    for (let i = 0; i < size; i++) {
      if (landMask[i] === 1) continue;
      const dist = distanceToCoast[i] | 0;
      // Exclude the guaranteed shoreline ring (distance 0), which is often artificially clamped to seaLevel and would
      // otherwise skew the shallow cutoff too close to 0m (eliminating the shelf band beyond the ring).
      if (dist <= 0) continue;
      if (dist > nearshoreDistance) continue;
      nearshoreSamples[sampleCount++] = bathymetry[i] ?? 0;
    }

    const shallowCutoff = computeQuantileCutoff(nearshoreSamples, sampleCount, config.shallowQuantile);

    const activeThreshold = Math.max(0, Math.min(1, config.activeClosenessThreshold));
    const activeThresholdU8 = Math.floor(activeThreshold * 255);

    const shelfMask = new Uint8Array(size);
    const activeMarginMask = new Uint8Array(size);
    const capTilesByTile = new Uint8Array(size);
    const nearshoreCandidateMask = new Uint8Array(size);
    const depthGateMask = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      if (landMask[i] === 1) continue;

      const dist = distanceToCoast[i] | 0;
      const t = boundaryType[i] | 0;
      const isActiveMargin =
        (t === BOUNDARY_CONVERGENT || t === BOUNDARY_TRANSFORM) && (boundaryCloseness[i] | 0) >= activeThresholdU8;
      const cap = isActiveMargin ? capActive : capPassive;

      if (isActiveMargin) activeMarginMask[i] = 1;
      capTilesByTile[i] = cap as number;
      if (dist > 0 && dist <= nearshoreDistance) nearshoreCandidateMask[i] = 1;

      const depth = bathymetry[i] ?? 0;
      if (depth >= shallowCutoff) depthGateMask[i] = 1;

      if (dist > cap) continue;
      if (depth >= shallowCutoff) shelfMask[i] = 1;
    }

    return { shelfMask, activeMarginMask, capTilesByTile, nearshoreCandidateMask, depthGateMask, shallowCutoff };
  },
});
