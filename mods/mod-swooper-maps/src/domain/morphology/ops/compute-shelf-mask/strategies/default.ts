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

export const defaultStrategy = createStrategy(ComputeShelfMaskContract, "default", {
  // Config canonicalization belongs here, not in run(): clamp the physical parameters into
  // their valid ranges once so run() carries only the shelf physics.
  normalize: (config) => ({
    ...config,
    breakGradient: clampNonNegative(config.breakGradient, 8),
    breakGradientScale: clampNonNegative(config.breakGradientScale, 1),
    activeClosenessThreshold: clamp01(config.activeClosenessThreshold),
  }),
  run: (input, config) => {
    const { width, height } = input;
    const size = Math.max(0, (width | 0) * (height | 0));

    const landMask = input.landMask as Uint8Array;
    const bathymetry = input.bathymetry as Int16Array;
    const boundaryCloseness = input.boundaryCloseness as Uint8Array;
    const boundaryType = input.boundaryType as Uint8Array;

    const activeThresholdU8 = Math.floor(config.activeClosenessThreshold * 255);
    // The break-gradient threshold (bathymetry units per tile-hop). A gradient is a DIFFERENCE
    // of bathymetry between adjacent tiles, so the (unsolved-at-sculpt-time) sea-level datum
    // cancels: this never references the datum, a depth quantile, or a depth band. The
    // shelfWidth knob scales it (wider => more permissive => the gentle apron reaches further
    // before the read break). Floor at a tiny positive value so a degenerate scale can't admit
    // the entire ocean as "flat".
    const breakGradient = Math.max(0.5, config.breakGradient * config.breakGradientScale);

    // 1) Read the physical break per tile from the SCULPTED terrain: classify each water tile
    //    as pre-break (gentle apron) when its local seabed gradient — the steepest bathymetry
    //    drop to any water neighbour — is below the break-gradient threshold, and post-break
    //    (steep continental slope) once the gradient steepens past it. Record the bathymetry at
    //    which the steepening is seen as the per-tile read break depth (diagnostic).
    const depthGateMask = new Uint8Array(size);
    const activeMarginMask = new Uint8Array(size);
    const nearshoreCandidateMask = new Uint8Array(size);
    const shelfBreakDepthByTile = new Int16Array(size);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x;
        if (landMask[i] === 1) continue;

        const here = bathymetry[i] ?? 0;
        let maxDrop = 0;
        let steepestNeighborDepth = 0;
        let adjacentToLand = false;
        forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
          const ni = ny * width + nx;
          if (landMask[ni] === 1) {
            adjacentToLand = true;
            return;
          }
          // Gradient toward DEEPER water only (the seaward steepening that marks the break).
          const drop = here - (bathymetry[ni] ?? 0);
          if (drop > maxDrop) {
            maxDrop = drop;
            steepestNeighborDepth = bathymetry[ni] ?? 0;
          }
        });

        if (adjacentToLand) nearshoreCandidateMask[i] = 1;

        // Active-margin diagnostic overlay (the steeper profile is already in the terrain).
        const t = boundaryType[i] | 0;
        if (
          (t === BOUNDARY_CONVERGENT || t === BOUNDARY_TRANSFORM) &&
          (boundaryCloseness[i] | 0) >= activeThresholdU8
        ) {
          activeMarginMask[i] = 1;
        }

        // Pre-break apron: gentle local gradient. Shoreline-adjacent water is always admitted
        // (it is, by construction, the start of the apron) so the shelf has a guaranteed seed
        // even where the immediate seaward gradient is steep (active margins).
        if (maxDrop < breakGradient || adjacentToLand) {
          depthGateMask[i] = 1;
        } else {
          // Post-break: record the depth at which the steepening is read (<=0, diagnostic).
          shelfBreakDepthByTile[i] = clampInt16(Math.min(0, steepestNeighborDepth));
        }
      }
    }

    // 2) Connectivity to shore: shelf = pre-break (gentle) water reachable from a land-adjacent
    //    water tile through contiguous pre-break water. This bounds extent at the read break
    //    without any tile-distance cap, and excludes deep isolated gentle pockets.
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
      // The quantile estimator was removed; retained <=0 for output-contract stability.
      shallowCutoff: 0,
    };
  },
});
