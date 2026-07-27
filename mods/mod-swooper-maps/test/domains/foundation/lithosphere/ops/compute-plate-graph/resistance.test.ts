import { describe, expect, it } from "bun:test";

import foundation from "@mapgen/domain/foundation/router";
import { deriveTestOperationSeed, TEST_MAP_SIZE } from "../../../../../setup.js";

const { computeMesh } = foundation.mesh.ops;
const { computePlateGraph } = foundation.lithosphere.ops;

function makeCrustStrength(
  generatedMesh: Readonly<{
    cellCount: number;
    siteX: Float32Array;
    siteY: Float32Array;
    bbox: { xl: number; xr: number; yt: number; yb: number };
  }>,
  weakBand: boolean
) {
  const maturity = new Float32Array(generatedMesh.cellCount);
  const strength = new Float32Array(generatedMesh.cellCount);
  strength.fill(0.8);

  if (weakBand) {
    const spanX = generatedMesh.bbox.xr - generatedMesh.bbox.xl;
    const spanY = generatedMesh.bbox.yb - generatedMesh.bbox.yt;
    const centerX = generatedMesh.bbox.xl + spanX * 0.15;
    const centerY = generatedMesh.bbox.yt + spanY * 0.7;
    const radiusX = spanX * 0.35;
    const radiusY = spanY * 0.42;

    for (let cellId = 0; cellId < generatedMesh.cellCount; cellId++) {
      const dx = ((generatedMesh.siteX[cellId] ?? 0) - centerX) / radiusX;
      const dy = ((generatedMesh.siteY[cellId] ?? 0) - centerY) / radiusY;
      if (dx * dx + dy * dy <= 1) {
        strength[cellId] = 0;
      }
    }
  }

  return { maturity, strength };
}

function diffCount(left: Int16Array, right: Int16Array): number {
  let count = 0;
  for (let index = 0; index < left.length; index++) {
    if (left[index] !== right[index]) count++;
  }
  return count;
}

describe("foundation/compute-plate-graph resistance", () => {
  it("changes partition boundaries when a weak lithosphere band lowers traversal resistance", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const generatedMesh = computeMesh.run(
      {
        width,
        height,
        rngSeed: deriveTestOperationSeed("test:foundation:plate-resistance-mesh"),
      },
      computeMesh.normalize({
        strategy: "jittered-delaunay",
        config: { plateCount: 26, cellsPerPlate: 10, relaxationSteps: 3 },
      })
    ).mesh;
    const config = {
      ...computePlateGraph.defaultConfig,
      config: {
        ...computePlateGraph.defaultConfig.config,
        plateCount: 26,
      },
    };
    const rngSeed = deriveTestOperationSeed("test:foundation:plate-resistance");

    const uniform = computePlateGraph.run(
      {
        mesh: generatedMesh,
        crust: makeCrustStrength(generatedMesh, false),
        rngSeed,
      },
      config
    ).plateGraph;
    const weakBand = computePlateGraph.run(
      {
        mesh: generatedMesh,
        crust: makeCrustStrength(generatedMesh, true),
        rngSeed,
      },
      config
    ).plateGraph;

    expect(diffCount(uniform.cellToPlate, weakBand.cellToPlate)).toBeGreaterThan(
      Math.max(5, Math.floor(generatedMesh.cellCount * 0.02))
    );
  });
});
