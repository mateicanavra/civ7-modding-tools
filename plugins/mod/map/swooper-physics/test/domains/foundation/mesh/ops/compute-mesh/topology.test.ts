import { describe, expect, it } from "bun:test";

import foundation from "../../../../../../src/domain/foundation/router.js";
import { deriveTestOperationSeed, TEST_MAP_SIZE } from "../../../../../setup.js";

const { computeMesh } = foundation.mesh.ops;
const PLATE_COUNT = 12;
const CELLS_PER_PLATE = 3;

function generateMesh() {
  const { width, height } = TEST_MAP_SIZE.dimensions;
  const config = computeMesh.normalize({
    strategy: "jittered-delaunay",
    config: {
      plateCount: PLATE_COUNT,
      cellsPerPlate: CELLS_PER_PLATE,
      relaxationSteps: 2,
    },
  });

  return computeMesh.run(
    {
      width,
      height,
      rngSeed: deriveTestOperationSeed("test:foundation:mesh-topology"),
    },
    config
  ).mesh;
}

function sum(values: Float32Array): number {
  let total = 0;
  for (let index = 0; index < values.length; index++) {
    total += values[index] ?? 0;
  }
  return total;
}

function neighborsFor(
  generatedMesh: Readonly<{
    neighborsOffsets: Int32Array;
    neighbors: Int32Array;
  }>,
  cellId: number
): Int32Array {
  const start = generatedMesh.neighborsOffsets[cellId] ?? 0;
  const end = generatedMesh.neighborsOffsets[cellId + 1] ?? start;
  return generatedMesh.neighbors.subarray(start, end);
}

describe("foundation/compute-mesh", () => {
  it("derives mesh density from authored plate scale", () => {
    expect(generateMesh().cellCount).toBe(PLATE_COUNT * CELLS_PER_PLATE);
  });

  it("conserves the wrapped map extent across cell areas", () => {
    const generatedMesh = generateMesh();
    const expectedArea =
      (generatedMesh.bbox.xr - generatedMesh.bbox.xl) *
      (generatedMesh.bbox.yb - generatedMesh.bbox.yt);
    const relativeError = Math.abs(sum(generatedMesh.areas) - expectedArea) / expectedArea;

    expect(relativeError).toBeLessThan(0.05);
  });

  it("emits reciprocal adjacency across the horizontal wrap seam", () => {
    const generatedMesh = generateMesh();
    const lastOffset = generatedMesh.neighborsOffsets[generatedMesh.cellCount] ?? -1;
    expect(generatedMesh.neighborsOffsets[0]).toBe(0);
    expect(lastOffset).toBe(generatedMesh.neighbors.length);

    let hasSeamNeighbor = false;
    for (let cellId = 0; cellId < generatedMesh.cellCount; cellId++) {
      const neighbors = neighborsFor(generatedMesh, cellId);
      for (const neighborId of neighbors) {
        expect(neighborId).toBeGreaterThanOrEqual(0);
        expect(neighborId).toBeLessThan(generatedMesh.cellCount);
        expect(Array.from(neighborsFor(generatedMesh, neighborId))).toContain(cellId);

        const rawDeltaX = Math.abs(
          (generatedMesh.siteX[neighborId] ?? 0) - (generatedMesh.siteX[cellId] ?? 0)
        );
        if (rawDeltaX > generatedMesh.wrapWidth * 0.5) {
          hasSeamNeighbor = true;
        }
      }
    }

    expect(hasSeamNeighbor).toBe(true);
  });
});
