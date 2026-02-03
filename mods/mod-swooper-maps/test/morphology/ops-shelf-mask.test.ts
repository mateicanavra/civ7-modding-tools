import { describe, expect, it } from "bun:test";

import morphologyDomain from "../../src/domain/morphology/ops.js";
import { normalizeStrictOrThrow, runOpValidated } from "../support/compiler-helpers.js";

const { computeShelfMask } = morphologyDomain.ops;

describe("morphology/compute-shelf-mask", () => {
  it("returns shelf viz tensors and never marks land tiles", () => {
    const width = 4;
    const height = 3;
    const size = width * height;

    // One land tile in the corner, everything else water.
    const landMask = new Uint8Array(size).fill(0);
    landMask[0] = 1;

    // Make most nearshore water relatively deep, and a few tiles shallow.
    // Bathymetry is <= 0 in water; closer to 0 is shallower.
    const bathymetry = new Int16Array([
      0, -100, -90, -80,
      -70, -60, -30, -20,
      -10, -55, -45, -5,
    ]);

    // Distance-to-coast input (already computed upstream in the pipeline).
    // We'll set a few tiles at distance 3 so passive cap includes them but active cap excludes them.
    const distanceToCoast = new Uint16Array([
      0, 1, 2, 3,
      1, 2, 3, 4,
      2, 3, 1, 5,
    ]);

    // Boundary context: make tile index 3 "active margin" (type=convergent + high closeness).
    const boundaryType = new Uint8Array(size).fill(2); // divergent by default (passive-ish)
    const boundaryCloseness = new Uint8Array(size).fill(0);
    boundaryType[3] = 1; // convergent
    boundaryCloseness[3] = 255; // very close

    const result = runOpValidated(
      computeShelfMask,
      {
        width,
        height,
        landMask,
        bathymetry,
        distanceToCoast,
        boundaryCloseness,
        boundaryType,
      },
      {
        strategy: "default",
        config: {
          nearshoreDistance: 3,
          shallowQuantile: 0.7,
          activeClosenessThreshold: 0.45,
          capTilesActive: 2,
          capTilesPassive: 4,
          capTilesMax: 8,
        },
      }
    );

    normalizeStrictOrThrow(computeShelfMask.output, result, "/ops/morphology/compute-shelf-mask/output");
    expect(result.shelfMask).toBeInstanceOf(Uint8Array);
    expect(result.shelfMask.length).toBe(size);
    expect(result.activeMarginMask).toBeInstanceOf(Uint8Array);
    expect(result.activeMarginMask.length).toBe(size);
    expect(result.capTilesByTile).toBeInstanceOf(Uint8Array);
    expect(result.capTilesByTile.length).toBe(size);
    expect(result.nearshoreCandidateMask).toBeInstanceOf(Uint8Array);
    expect(result.nearshoreCandidateMask.length).toBe(size);
    expect(result.depthGateMask).toBeInstanceOf(Uint8Array);
    expect(result.depthGateMask.length).toBe(size);
    expect(Number.isFinite(result.shallowCutoff)).toBe(true);
    expect(result.shallowCutoff).toBeLessThanOrEqual(0);

    // Land must never be marked as shelf.
    expect(result.shelfMask[0]).toBe(0);

    // Active margin tile at distance 3 should be excluded by capTilesActive=2.
    expect(result.shelfMask[3]).toBe(0);
    expect(result.activeMarginMask[3]).toBe(1);

    // A passive/neutral tile within cap and shallow enough should be included.
    // Index 6: distance=3, bathymetry=-30 (shallow), passive cap=4 => eligible.
    expect(result.shelfMask[6]).toBe(1);
  });
});
