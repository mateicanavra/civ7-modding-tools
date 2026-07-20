import { describe, expect, it } from "bun:test";
import foundationOpsPublic from "@mapgen/domain/foundation/ops";

const { computeMesh } = foundationOpsPublic.ops;

function neighborsFor(
  mesh: {
    neighborsOffsets: Int32Array;
    neighbors: Int32Array;
  },
  cellId: number
): Int32Array {
  const start = mesh.neighborsOffsets[cellId] | 0;
  const end = mesh.neighborsOffsets[cellId + 1] | 0;
  return mesh.neighbors.slice(start, end);
}

function sumAreas(areas: Float32Array): number {
  let total = 0;
  for (let i = 0; i < areas.length; i++) total += areas[i] ?? 0;
  return total;
}

describe("foundation mesh generation", () => {
  it("is deterministic and shape-correct", () => {
    const syntheticDimensions = { width: 40, height: 20 } as const;
    const { width, height } = syntheticDimensions;
    const meshConfig = computeMesh.normalize({
      strategy: "default",
      config: { plateCount: 9, cellsPerPlate: 2, relaxationSteps: 2 },
    });

    const first = computeMesh.run(
      {
        width,
        height,
        rngSeed: 1,
      },
      meshConfig
    );

    const second = computeMesh.run(
      {
        width,
        height,
        rngSeed: 1,
      },
      meshConfig
    );

    expect(meshConfig.config).not.toHaveProperty("cellCount");
    expect(first.mesh.cellCount).toBe(18);
    expect(first.mesh.siteX.length).toBe(first.mesh.cellCount);
    expect(first.mesh.siteY.length).toBe(first.mesh.cellCount);
    expect(first.mesh.areas.length).toBe(first.mesh.cellCount);
    expect(first.mesh.neighborsOffsets.length).toBe(first.mesh.cellCount + 1);

    expect(first.mesh.wrapWidth).toBeGreaterThan(0);
    expect(Array.from(first.mesh.siteX)).toEqual(Array.from(second.mesh.siteX));
    expect(Array.from(first.mesh.siteY)).toEqual(Array.from(second.mesh.siteY));
    expect(Array.from(first.mesh.areas)).toEqual(Array.from(second.mesh.areas));
    expect(Array.from(first.mesh.neighborsOffsets)).toEqual(
      Array.from(second.mesh.neighborsOffsets)
    );
    expect(Array.from(first.mesh.neighbors)).toEqual(Array.from(second.mesh.neighbors));

    const expectedArea =
      (first.mesh.bbox.xr - first.mesh.bbox.xl) * (first.mesh.bbox.yb - first.mesh.bbox.yt);
    const totalArea = sumAreas(first.mesh.areas);
    expect(Math.abs(totalArea - expectedArea)).toBeLessThan(expectedArea * 0.05);

    let hasSeamNeighbor = false;
    for (let i = 0; i < first.mesh.cellCount; i++) {
      const neighbors = neighborsFor(first.mesh, i);
      for (let j = 0; j < neighbors.length; j++) {
        const n = neighbors[j]!;
        const back = neighborsFor(first.mesh, n);
        expect(Array.from(back)).toContain(i);
        if (
          Math.abs((first.mesh.siteX[n] ?? 0) - (first.mesh.siteX[i] ?? 0)) >
          first.mesh.wrapWidth * 0.5
        ) {
          hasSeamNeighbor = true;
        }
      }
    }

    expect(hasSeamNeighbor).toBe(true);
  });
});
