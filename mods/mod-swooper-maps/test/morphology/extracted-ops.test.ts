import { describe, expect, it } from "bun:test";

import morphologyDomain from "@mapgen/domain/morphology/ops";
import { runOpValidated } from "../support/compiler-helpers.js";

// These pin the byte-behavior of the three ops extracted from the carving/shelf
// steps (R1/R5/R3). On a single row (height=1) the odd-Q hex neighborhood reduces
// to x-1 / x+1, and the map WRAPS in x (cylindrical Civ map), so the last tile
// neighbors the first — every expected value below accounts for that wrap.
const sel = { strategy: "default", config: {} } as const;

describe("morphology extracted ops", () => {
  it("compute-coastal-adjacency: land/water shoreline adjacency", () => {
    const { computeCoastalAdjacency } = morphologyDomain.ops;
    // row: land land water water. Boundaries: tile1|tile2 AND (wrap) tile3|tile0.
    // -> land tiles 0,1 both touch water (tile0 via wrap to tile3); water tiles 2,3
    //    both touch land (tile3 via wrap to tile0).
    const landMask = Uint8Array.from([1, 1, 0, 0]);
    const out = runOpValidated(computeCoastalAdjacency, { width: 4, height: 1, landMask }, sel);
    expect(Array.from(out.coastalLand)).toEqual([1, 1, 0, 0]);
    expect(Array.from(out.coastalWater)).toEqual([0, 0, 1, 1]);
    // purity: input not mutated
    expect(Array.from(landMask)).toEqual([1, 1, 0, 0]);

    // all-land row: nobody touches water -> no coastal tiles
    const allLand = runOpValidated(
      computeCoastalAdjacency,
      { width: 3, height: 1, landMask: Uint8Array.from([1, 1, 1]) },
      sel
    );
    expect(Array.from(allLand.coastalLand)).toEqual([0, 0, 0]);
    expect(Array.from(allLand.coastalWater)).toEqual([0, 0, 0]);
  });

  it("compute-distance-to-coast: multi-source hex BFS", () => {
    const { computeDistanceToCoast } = morphologyDomain.ops;
    // single seed at x=0; tile3 is distance 1 via the x-wrap back to tile0.
    const seeded = runOpValidated(
      computeDistanceToCoast,
      { width: 4, height: 1, coastal: Uint8Array.from([1, 0, 0, 0]) },
      sel
    );
    expect(Array.from(seeded.distanceToCoast)).toEqual([0, 1, 2, 1]);

    // two sources: distance is to the NEAREST seed
    const twoSource = runOpValidated(
      computeDistanceToCoast,
      { width: 5, height: 1, coastal: Uint8Array.from([1, 0, 0, 0, 1]) },
      sel
    );
    expect(Array.from(twoSource.distanceToCoast)).toEqual([0, 1, 2, 1, 0]);

    // no seeds: every tile is the unreachable sentinel
    const empty = runOpValidated(
      computeDistanceToCoast,
      { width: 3, height: 1, coastal: Uint8Array.from([0, 0, 0]) },
      sel
    );
    expect(Array.from(empty.distanceToCoast)).toEqual([65535, 65535, 65535]);
  });

  it("reconcile-heightfield-from-coast: class/elevation/bathymetry agree, inputs pure", () => {
    const { reconcileHeightfieldFromCoast } = morphologyDomain.ops;
    const landMask = Uint8Array.from([1, 1, 0, 0]);
    const coastMask = Uint8Array.from([0, 0, 1, 0]); // tile 2 carved to coast -> water
    const elevation = Int16Array.from([5, -3, 2, -1]);
    const out = runOpValidated(
      reconcileHeightfieldFromCoast,
      { width: 4, height: 1, landMask, coastMask, elevation, seaLevel: 0 },
      sel
    );
    // tile0 land (stays 5); tile1 land below sea lifted to seaLevel+1=1;
    // tile2 carved coast -> water, elev>0 dropped to seaLevel=0; tile3 water stays -1.
    expect(Array.from(out.landMask)).toEqual([1, 1, 0, 0]);
    expect(Array.from(out.elevation)).toEqual([5, 1, 0, -1]);
    expect(Array.from(out.bathymetry)).toEqual([0, 0, 0, -1]);
    // purity: the input elevation/landMask/coastMask are untouched
    expect(Array.from(elevation)).toEqual([5, -3, 2, -1]);
    expect(Array.from(landMask)).toEqual([1, 1, 0, 0]);
  });
});
