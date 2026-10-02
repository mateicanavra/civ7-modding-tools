import { createStrategy } from "@swooper/mapgen-core/authoring";
import { forEachHexNeighborOddQ } from "@swooper/mapgen-core/lib/grid";
import { clampInt16 } from "@swooper/mapgen-core/lib/math";

import ComputeShelfMaskContract from "../../contract.js";
import StrategyDefinition from "./config.js";

const BOUNDARY_CONVERGENT = 1;
const BOUNDARY_TRANSFORM = 3;
const CRUST_CONTINENTAL = 1;

/** Binds the `physical-break-connectivity` algorithm to the shared `morphology/compute-shelf-mask` operation contract. */
export default createStrategy(ComputeShelfMaskContract, StrategyDefinition, {
  run: (input, config) => {
    const { width, height } = input;
    const size = width * height;

    const landMask = input.landMask;
    const crustType = input.crustType;
    const bathymetry = input.bathymetry;
    const boundaryCloseness = input.boundaryCloseness;
    const boundaryType = input.boundaryType;

    const activeThresholdU8 = Math.floor(config.activeClosenessThreshold * 255);
    // The break-gradient threshold (bathymetry units per tile-hop). A gradient is a DIFFERENCE
    // of bathymetry between adjacent tiles, so the (unsolved-at-sculpt-time) sea-level datum
    // cancels: this never references the datum, a depth quantile, or a depth band. The
    // shelfWidth knob scales it (wider => more permissive => the gentle apron reaches further
    // before the read break). Floor above zero so a degenerate scale still admits flat water.
    const breakGradient = Math.max(0.5, config.breakGradient * config.breakGradientScale);

    // 1) Read the physical break from the sculpted terrain. Only continental water with a
    //    gentle seaward gradient can carry the flood: smooth oceanic floor is not an apron.
    //    Record steepening on either crust type as the per-tile break-depth diagnostic.
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

        if (crustType[i] === CRUST_CONTINENTAL && maxDrop < breakGradient) {
          depthGateMask[i] = 1;
        }
        if (maxDrop >= breakGradient) {
          // Post-break: record the depth at which the steepening is read (<=0, diagnostic).
          shelfBreakDepthByTile[i] = clampInt16(Math.min(0, steepestNeighborDepth));
        }
      }
    }

    // 2) Preserve the mandatory shoreline ring without allowing oceanic or steep ring tiles
    //    to seed or bridge connectivity. Only eligible shore water starts the continental flood.
    const shelfMask = new Uint8Array(size);
    const queue = new Int32Array(size);
    let head = 0;
    let tail = 0;
    for (let i = 0; i < size; i++) {
      if (nearshoreCandidateMask[i] !== 1) continue;
      shelfMask[i] = 1;
      if (depthGateMask[i] === 1) queue[tail++] = i;
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
    };
  },
});
