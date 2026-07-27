import { describe, expect, it } from "bun:test";

import foundation from "@mapgen/domain/foundation/router";
import { deriveTestOperationSeed, TEST_MAP_SIZE } from "../../../../../setup.js";

const { computeMesh } = foundation.mesh.ops;
const { computeMantlePotential } = foundation.mantle.ops;

function projectMantlePotentialMesh(
  mesh: Readonly<{
    cellCount: number;
    wrapWidth: number;
    siteX: Float32Array;
    siteY: Float32Array;
    neighborsOffsets: Int32Array;
    neighbors: Int32Array;
  }>
) {
  const { cellCount, wrapWidth, siteX, siteY, neighborsOffsets, neighbors } = mesh;
  return { cellCount, wrapWidth, siteX, siteY, neighborsOffsets, neighbors };
}

describe("foundation/compute-mantle-potential", () => {
  it("builds a normalized signed field from opposing thermal source populations", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const generatedMesh = computeMesh.run(
      {
        width,
        height,
        rngSeed: deriveTestOperationSeed("test:foundation:mantle-potential-mesh"),
      },
      computeMesh.normalize({
        strategy: "jittered-delaunay",
        config: { plateCount: 12, cellsPerPlate: 2, relaxationSteps: 2 },
      })
    ).mesh;
    const plumeCount = 3;
    const downwellingCount = 3;
    const plumeRadius = 0.2;
    const downwellingRadius = 0.3;

    const result = computeMantlePotential.run(
      {
        mesh: projectMantlePotentialMesh(generatedMesh),
        rngSeed: deriveTestOperationSeed("test:foundation:mantle-potential"),
      },
      {
        ...computeMantlePotential.defaultConfig,
        config: {
          ...computeMantlePotential.defaultConfig.config,
          plumeCount,
          downwellingCount,
          plumeRadius,
          downwellingRadius,
          smoothingIterations: 0,
        },
      }
    ).mantlePotential;

    expect(result.sourceCount).toBe(plumeCount + downwellingCount);
    expect(new Set(result.sourceCell).size).toBe(result.sourceCount);

    let observedPlumes = 0;
    let observedDownwellings = 0;
    for (let sourceIndex = 0; sourceIndex < result.sourceCount; sourceIndex++) {
      const sourceType = result.sourceType[sourceIndex];
      const sourceAmplitude = result.sourceAmplitude[sourceIndex] ?? 0;
      const sourceRadius = result.sourceRadius[sourceIndex] ?? 0;
      if (sourceType === 1) {
        observedPlumes++;
        expect(sourceAmplitude).toBeGreaterThan(0);
        expect(sourceRadius).toBeCloseTo(plumeRadius);
      } else {
        expect(sourceType).toBe(-1);
        observedDownwellings++;
        expect(sourceAmplitude).toBeLessThan(0);
        expect(sourceRadius).toBeCloseTo(downwellingRadius);
      }
    }
    expect(observedPlumes).toBe(plumeCount);
    expect(observedDownwellings).toBe(downwellingCount);

    const potential = Array.from(result.potential);
    expect(Math.min(...potential)).toBeLessThan(-0.05);
    expect(Math.max(...potential)).toBeGreaterThan(0.05);
    expect(Math.max(...potential.map(Math.abs))).toBeCloseTo(1);
  });

  it("uses wrapped distance when a source straddles the horizontal seam", () => {
    const syntheticSeamMesh = projectMantlePotentialMesh({
      cellCount: 2,
      wrapWidth: 10,
      siteX: new Float32Array([0, 10]),
      siteY: new Float32Array([0, 0]),
      neighborsOffsets: new Int32Array([0, 1, 2]),
      neighbors: new Int32Array([1, 0]),
    });

    const result = computeMantlePotential.run(
      {
        mesh: syntheticSeamMesh,
        rngSeed: deriveTestOperationSeed("test:foundation:mantle-potential-wrap"),
      },
      {
        ...computeMantlePotential.defaultConfig,
        config: {
          ...computeMantlePotential.defaultConfig.config,
          plumeCount: 1,
          downwellingCount: 0,
          plumeRadius: 1,
          smoothingIterations: 0,
          minSeparationScale: 0,
        },
      }
    ).mantlePotential;

    expect(result.sourceCount).toBe(1);
    expect(result.potential[0]).toBeCloseTo(result.potential[1] ?? Number.NaN, 5);
  });
});
