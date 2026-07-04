import { describe, expect, it } from "bun:test";
import type { DelaunayMesh } from "@mapgen/lib/mesh/index.js";
import {
  type CsrPointMesh2D,
  findNearestMeshCell,
  meanMeshEdgeLength,
  selectMeshNeighborByVectorProjection,
} from "@mapgen/lib/mesh/index.js";

function mesh(input: {
  wrapWidth?: number;
  siteX: number[];
  siteY: number[];
  offsets: number[];
  neighbors: number[];
}): CsrPointMesh2D {
  return {
    cellCount: input.siteX.length,
    wrapWidth: input.wrapWidth ?? 100,
    siteX: Float32Array.from(input.siteX),
    siteY: Float32Array.from(input.siteY),
    neighborsOffsets: Int32Array.from(input.offsets),
    neighbors: Int32Array.from(input.neighbors),
  };
}

describe("lib/mesh neighborhood mesh", () => {
  it("accepts the current generated mesh shape as a CSR point mesh", () => {
    const currentMesh = {
      cellCount: 1,
      wrapWidth: 10,
      siteX: new Float32Array([1]),
      siteY: new Float32Array([2]),
      neighborsOffsets: new Int32Array([0, 0]),
      neighbors: new Int32Array([]),
      areas: new Float32Array([1]),
      bbox: { xl: 0, xr: 10, yt: 0, yb: 10 },
    } satisfies DelaunayMesh;

    const assigned: CsrPointMesh2D = currentMesh;
    expect(assigned.cellCount).toBe(1);
  });

  it("computes mean edge length with empty fallback and periodic distance", () => {
    expect(meanMeshEdgeLength(mesh({ siteX: [], siteY: [], offsets: [0], neighbors: [] }))).toBe(1);

    expect(
      meanMeshEdgeLength(
        mesh({
          wrapWidth: 10,
          siteX: [9.9, 0.1],
          siteY: [0, 0],
          offsets: [0, 1, 2],
          neighbors: [1, 0],
        })
      )
    ).toBeCloseTo(0.2, 5);
  });

  it("skips reverse duplicate edges when computing mean edge length", () => {
    const duplicateReverseMesh = mesh({
      wrapWidth: 1000,
      siteX: [0, 2, 102],
      siteY: [0, 0, 0],
      offsets: [0, 1, 3, 4],
      neighbors: [1, 0, 2, 1],
    });

    expect(meanMeshEdgeLength(duplicateReverseMesh, 2)).toBe(51);
  });

  it("honors the max edge cap when computing mean edge length", () => {
    const cappedMesh = mesh({
      wrapWidth: 1000,
      siteX: [0, 2, 11, 101],
      siteY: [0, 0, 0, 0],
      offsets: [0, 3, 3, 3, 3],
      neighbors: [1, 2, 3],
    });

    expect(meanMeshEdgeLength(cappedMesh, 2)).toBe(6.5);
    expect(meanMeshEdgeLength(cappedMesh)).toBeCloseTo(38, 5);
  });

  it("skips invalid and zero-length edges when computing mean edge length", () => {
    const invalidAndZeroMesh = mesh({
      wrapWidth: 100,
      siteX: [5, 5, 17],
      siteY: [0, 0, 0],
      offsets: [0, 4, 5, 5],
      neighbors: [-1, 99, 1, 2, 0],
    });

    expect(meanMeshEdgeLength(invalidAndZeroMesh)).toBe(12);
    expect(
      meanMeshEdgeLength(
        mesh({ siteX: [0, 0], siteY: [0, 0], offsets: [0, 1, 2], neighbors: [1, 0] })
      )
    ).toBe(1);
  });

  it("uses periodic distance and strict first ties when finding nearest cells", () => {
    const pointMesh = mesh({
      wrapWidth: 10,
      siteX: [9.8, 2, 4, 6],
      siteY: [0, 0, 0, 0],
      offsets: [0, 0, 0, 0, 0],
      neighbors: [],
    });

    expect(
      findNearestMeshCell(mesh({ siteX: [], siteY: [], offsets: [0], neighbors: [] }), 1, 1)
    ).toBe(-1);
    expect(findNearestMeshCell(pointMesh, 0.1, 0)).toBe(0);
    expect(findNearestMeshCell(pointMesh, 3, 0)).toBe(1);
  });

  it("selects neighbors by vector projection with fallback and strict first ties", () => {
    const fallbackMesh = mesh({
      wrapWidth: 10,
      siteX: [9.8, 0.2],
      siteY: [0, 0],
      offsets: [0, 0, 0],
      neighbors: [],
    });
    const projectionMesh = mesh({
      wrapWidth: 10,
      siteX: [9.8, 0.2, 9.4, 9.8, 9.8, 0.2],
      siteY: [0, 0, 0, 1, -1, 0],
      offsets: [0, 5, 5, 5, 5, 5, 5],
      neighbors: [1, 2, 3, 4, 5],
    });

    expect(
      selectMeshNeighborByVectorProjection({
        mesh: fallbackMesh,
        cellId: 1,
        vectorX: 1,
        vectorY: 0,
      })
    ).toBe(1);
    expect(
      selectMeshNeighborByVectorProjection({
        mesh: projectionMesh,
        cellId: 0,
        vectorX: 0,
        vectorY: 0,
      })
    ).toBe(0);
    expect(
      selectMeshNeighborByVectorProjection({
        mesh: projectionMesh,
        cellId: 0,
        vectorX: 1,
        vectorY: 0,
      })
    ).toBe(1);
    expect(
      selectMeshNeighborByVectorProjection({
        mesh: projectionMesh,
        cellId: 0,
        vectorX: 0,
        vectorY: 1,
      })
    ).toBe(3);
  });
});
