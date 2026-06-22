import { describe, expect, it } from "bun:test";

import morphologyDomain from "../../src/domain/morphology/ops.js";
import { normalizeStrictOrThrow, runOpValidated } from "../support/compiler-helpers.js";

const { computeShelfMask } = morphologyDomain.ops;

describe("morphology/compute-shelf-mask (physical break: gentle-gradient gate + shore connectivity)", () => {
  it("classifies shelf by reading the seabed-gradient break + shore connectivity, never marks land", () => {
    // 5x5 grid. Row 0 is land; the rest is water. A gentle apron (-4 m) in rows 1-2 gives way
    // to a steep BREAK into the abyss (-40 m) at the row-2 -> row-3 transition, plus one
    // isolated shallow tile (idx 22) walled off from shore by the break to exercise connectivity.
    // The break is READ from the gradient (the -4 -> -40 step), not from a depth quantile.
    const width = 5;
    const height = 5;
    const size = width * height;
    const L = 0;
    const land = new Uint8Array(size).fill(0);
    for (let x = 0; x < width; x++) land[x] = 1; // row 0 = land

    const D = -40; // abyss (fails the depth gate)
    const S = -4; // shelf-shallow
    // prettier-ignore
    const bathymetry = new Int16Array([
      L,
      L,
      L,
      L,
      L, // row 0 land
      S,
      S,
      S,
      S,
      S, // row 1 shallow (shore)
      S,
      S,
      S,
      S,
      S, // row 2 shallow
      D,
      D,
      D,
      D,
      D, // row 3 abyss
      D,
      D,
      S,
      D,
      D, // row 4 abyss with one isolated shallow tile at idx 22
    ]);
    // distanceToCoast is diagnostic-only under the physical-break model; rough values suffice.
    // prettier-ignore
    const distanceToCoast = new Uint16Array([
      0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4,
    ]);
    // idx 6 = active margin (convergent + very close); idx 7 = passive. Rest passive.
    const boundaryType = new Uint8Array(size).fill(2); // divergent (passive)
    const boundaryCloseness = new Uint8Array(size).fill(0);
    boundaryType[6] = 1; // convergent
    boundaryCloseness[6] = 255;

    const result = runOpValidated(
      computeShelfMask,
      {
        width,
        height,
        landMask: land,
        bathymetry,
        distanceToCoast,
        boundaryCloseness,
        boundaryType,
      },
      {
        strategy: "default",
        config: {
          // breakGradient 8 sits between the gentle apron gradient (0) and the steep break
          // gradient (the -4 -> -40 step = 36), so the classifier reads the break at row 2->3.
          breakGradient: 8,
          breakGradientScale: 1,
          activeClosenessThreshold: 0.45,
        },
      }
    );

    normalizeStrictOrThrow(
      computeShelfMask.output,
      result,
      "/ops/morphology/compute-shelf-mask/output"
    );
    for (const key of [
      "shelfMask",
      "activeMarginMask",
      "depthGateMask",
      "nearshoreCandidateMask",
    ] as const) {
      expect(result[key]).toBeInstanceOf(Uint8Array);
      expect(result[key].length).toBe(size);
    }
    expect(result.shelfBreakDepthByTile).toBeInstanceOf(Int16Array);
    expect(result.shelfBreakDepthByTile.length).toBe(size);
    // The quantile estimator was removed; shallowCutoff is retained as a finite <=0 constant.
    expect(Number.isFinite(result.shallowCutoff)).toBe(true);
    expect(result.shallowCutoff).toBeLessThanOrEqual(0);

    // Land is never shelf.
    for (let x = 0; x < width; x++) expect(result.shelfMask[x]).toBe(0);

    // A shore-adjacent apron tile is shelf and passes the gentle-gradient gate.
    expect(result.shelfMask[5]).toBe(1);
    expect(result.depthGateMask[5]).toBe(1);

    // The BREAK is read at the row-2 -> row-3 step: the row-2 apron-edge tiles see a steep
    // seaward gradient (36 >= 8), so they fail the gentle-gradient gate and are NOT shelf.
    // This is the physical break read from terrain — no depth quantile, no distance band.
    expect(result.depthGateMask[10]).toBe(0);
    expect(result.shelfMask[10]).toBe(0);
    expect(result.shelfBreakDepthByTile[10]).toBeLessThan(0); // recorded read-break depth

    // Beyond the break, the flat abyss is gentle again but is WALLED OFF from shore by the
    // break, so connectivity excludes it (no distance band would do this).
    expect(result.shelfMask[15]).toBe(0); // row-3 abyss

    // The isolated shallow tile is surrounded by the break (steep gradient), so it both fails
    // the gentle gate and is unreachable from shore -> excluded.
    expect(result.shelfMask[22]).toBe(0);

    // Every shelf tile must pass the gentle-gradient gate (shelf is a subset of pre-break water).
    for (let i = 0; i < size; i++) {
      if (result.shelfMask[i] === 1) expect(result.depthGateMask[i]).toBe(1);
    }
  });
});
