import { describe, expect, it } from "bun:test";

import morphologyDomain from "../../../../../../src/domain/morphology/router.js";
import { runAdmittedOperationForTest } from "@swooper/mapgen-core/testing";

const { computeShelfMask } = morphologyDomain.shelf.ops;
const { computeCoastalAdjacency, computeDistanceToCoast } = morphologyDomain.coasts.ops;

function runShelfFixture(input: {
  width: number;
  height: number;
  landMask: Uint8Array;
  crustType: Uint8Array;
  bathymetry: Int16Array;
}) {
  const { width, height, landMask } = input;
  const { coastalWater } = runAdmittedOperationForTest(
    computeCoastalAdjacency,
    { width, height, landMask },
    { strategy: "wrapped-hex-adjacency", config: {} }
  );
  const { distanceToCoast } = runAdmittedOperationForTest(
    computeDistanceToCoast,
    { width, height, coastal: coastalWater },
    { strategy: "multi-source-hex-bfs", config: {} }
  );
  const shelf = runAdmittedOperationForTest(
    computeShelfMask,
    {
      ...input,
      distanceToCoast,
      boundaryCloseness: new Uint8Array(width * height),
      boundaryType: new Uint8Array(width * height),
    },
    {
      strategy: "physical-break-connectivity",
      config: { breakGradient: 8, breakGradientScale: 1, activeClosenessThreshold: 0.45 },
    }
  );
  return { ...shelf, coastalWater, distanceToCoast };
}

describe("morphology/compute-shelf-mask (continental support + gentle gradient + shore connectivity)", () => {
  it("classifies shelf by reading the seabed-gradient break + shore connectivity, never marks land", () => {
    // 5x5 grid. Row 0 is land; the rest is water. A gentle continental apron (-4) in rows 1-2
    // gives way to a steep BREAK into the oceanic abyss (-40) at the row-2 -> row-3 transition, plus one
    // isolated shallow tile (idx 22) walled off from shore by the break to exercise connectivity.
    // The break is READ from the gradient (the -4 -> -40 step), not from a depth quantile.
    const NON_PLAYABLE_LOCAL_TOPOLOGY_DIMENSIONS = { width: 5, height: 5 } as const;
    const { width, height } = NON_PLAYABLE_LOCAL_TOPOLOGY_DIMENSIONS;
    const size = width * height;
    const L = 0;
    const land = new Uint8Array(size).fill(0);
    for (let x = 0; x < width; x++) land[x] = 1; // row 0 = land

    const crustType = new Uint8Array(size);
    crustType.fill(1, 0, 3 * width); // land and apron are continental
    crustType[22] = 1; // isolated submerged continental fragment

    const D = -40; // oceanic abyss
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

    const result = runAdmittedOperationForTest(
      computeShelfMask,
      {
        width,
        height,
        landMask: land,
        crustType,
        bathymetry,
        distanceToCoast,
        boundaryCloseness,
        boundaryType,
      },
      {
        strategy: "physical-break-connectivity",
        config: {
          // breakGradient 8 sits between the gentle apron gradient (0) and the steep break
          // gradient (the -4 -> -40 step = 36), so the classifier reads the break at row 2->3.
          breakGradient: 8,
          breakGradientScale: 1,
          activeClosenessThreshold: 0.45,
        },
      }
    );

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

    // Beyond the break the flat abyss is gentle again, but has no continental support.
    expect(result.depthGateMask[15]).toBe(0);
    expect(result.shelfMask[15]).toBe(0); // row-3 abyss

    // The isolated shallow tile is surrounded by the break (steep gradient), so it both fails
    // the gentle gate and is unreachable from shore -> excluded.
    expect(result.shelfMask[22]).toBe(0);

    // Only the independent shoreline ring may be shelf without passing the flood gate.
    for (let i = 0; i < size; i++) {
      if (result.shelfMask[i] === 1 && result.nearshoreCandidateMask[i] === 0) {
        expect(result.depthGateMask[i]).toBe(1);
      }
    }
  });

  it("keeps a smooth continental inland sea without flooding equally smooth island-bearing oceanic floor", () => {
    const NON_PLAYABLE_LOCAL_TOPOLOGY_DIMENSIONS = { width: 16, height: 11 } as const;
    const { width, height } = NON_PLAYABLE_LOCAL_TOPOLOGY_DIMENSIONS;
    const size = width * height;
    const landMask = new Uint8Array(size);
    const crustType = new Uint8Array(size);
    const bathymetry = new Int16Array(size).fill(-80);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x <= 8; x++) {
        const i = y * width + x;
        crustType[i] = 1;
        if (x === 0 || x === 8 || y === 0 || y === height - 1) landMask[i] = 1;
      }
    }
    const island = 5 * width + 12;
    landMask[island] = 1; // volcanic island on oceanic crust, not a continental shelf seed
    for (let i = 0; i < size; i++) if (landMask[i] === 1) bathymetry[i] = 0;

    const result = runShelfFixture({ width, height, landMask, crustType, bathymetry });
    const inlandSea = 5 * width + 4;
    const islandShore = 5 * width + 11;
    const abyss = 5 * width + 10;
    expect(bathymetry[inlandSea]).toBe(bathymetry[abyss]);
    expect(result.distanceToCoast[inlandSea]).toBeGreaterThan(2);
    expect(result.depthGateMask[inlandSea]).toBe(1);
    expect(result.shelfMask[inlandSea]).toBe(1);
    expect(result.coastalWater[islandShore]).toBe(1);
    expect(result.depthGateMask[islandShore]).toBe(0);
    expect(result.shelfMask[islandShore]).toBe(1);
    expect(result.coastalWater[abyss]).toBe(0);
    expect(result.shelfMask[abyss]).toBe(0);
    for (let i = 0; i < size; i++) {
      expect(result.depthGateMask[i]).toBe(landMask[i] === 0 && crustType[i] === 1 ? 1 : 0);
      expect(result.shelfMask[i]).toBe(
        landMask[i] === 0 && (crustType[i] === 1 || result.coastalWater[i] === 1) ? 1 : 0
      );
    }
  });

  it.each(["oceanic", "steep continental"] as const)(
    "does not let the %s shoreline ring seed a disconnected gentle continental pocket",
    (shoreline) => {
      const NON_PLAYABLE_LOCAL_TOPOLOGY_DIMENSIONS = { width: 8, height: 7 } as const;
      const { width, height } = NON_PLAYABLE_LOCAL_TOPOLOGY_DIMENSIONS;
      const size = width * height;
      const landMask = new Uint8Array(size);
      const crustType = new Uint8Array(size);
      const bathymetry = new Int16Array(size).fill(-80);
      const island = width + 3;
      landMask[island] = 1;
      bathymetry[island] = 0;
      const { coastalWater } = runAdmittedOperationForTest(
        computeCoastalAdjacency,
        { width, height, landMask },
        { strategy: "wrapped-hex-adjacency", config: {} }
      );
      if (shoreline === "steep continental") {
        crustType[island] = 1;
        for (let i = 0; i < size; i++) {
          if (coastalWater[i] !== 1) continue;
          crustType[i] = 1;
          bathymetry[i] = -4;
        }
      }
      for (let y = 3; y <= 5; y++) {
        for (let x = 2; x <= 4; x++) crustType[y * width + x] = 1;
      }

      const result = runShelfFixture({ width, height, landMask, crustType, bathymetry });
      const pocket = 3 * width + 3;
      const shore = 2 * width + 3;
      expect(result.coastalWater[shore]).toBe(1);
      expect(result.shelfMask[shore]).toBe(1);
      expect(result.depthGateMask[shore]).toBe(0);
      expect(result.depthGateMask[pocket]).toBe(1);
      expect(result.coastalWater[pocket]).toBe(0);
      expect(result.shelfMask[pocket]).toBe(0);
      if (shoreline === "steep continental") {
        expect(result.shelfBreakDepthByTile[shore]).toBe(-80);
      }
      expect(Array.from(result.shelfMask)).toEqual(Array.from(coastalWater));
    }
  );

  it("carries eligible continental connectivity across the wrapped seam but not onto oceanic floor", () => {
    const NON_PLAYABLE_LOCAL_TOPOLOGY_DIMENSIONS = { width: 8, height: 5 } as const;
    const { width, height } = NON_PLAYABLE_LOCAL_TOPOLOGY_DIMENSIONS;
    const size = width * height;
    const landMask = new Uint8Array(size);
    const crustType = new Uint8Array(size);
    const bathymetry = new Int16Array(size).fill(-40);
    const shoreLand = 2 * width;
    landMask[shoreLand] = 1;
    crustType[shoreLand] = 1;
    bathymetry[shoreLand] = 0;
    for (let x = 5; x < width; x++) crustType[2 * width + x] = 1;
    const disconnected = 4 * width + 3;
    crustType[disconnected] = 1;

    const result = runShelfFixture({ width, height, landMask, crustType, bathymetry });
    expect(result.coastalWater[2 * width + 7]).toBe(1);
    expect(result.shelfMask[2 * width + 7]).toBe(1);
    expect(result.coastalWater[2 * width + 5]).toBe(0);
    expect(result.shelfMask[2 * width + 5]).toBe(1);
    expect(result.shelfMask[2 * width + 4]).toBe(0);
    expect(result.depthGateMask[disconnected]).toBe(1);
    expect(result.shelfMask[disconnected]).toBe(0);
  });
});
