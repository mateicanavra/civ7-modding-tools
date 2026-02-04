import { describe, expect, it } from "bun:test";

import computeMesh from "../../src/domain/foundation/ops/compute-mesh/index.js";
import computeMantlePotential from "../../src/domain/foundation/ops/compute-mantle-potential/index.js";
import computeMantleForcing from "../../src/domain/foundation/ops/compute-mantle-forcing/index.js";

function variance(values: Float32Array): number {
  if (values.length === 0) return 0;
  let sum = 0;
  let sumSq = 0;
  for (let i = 0; i < values.length; i++) {
    const v = values[i] ?? 0;
    sum += v;
    sumSq += v * v;
  }
  const mean = sum / values.length;
  return Math.max(0, sumSq / values.length - mean * mean);
}

describe("foundation mantle forcing (D02r)", () => {
  it("is deterministic for identical inputs", () => {
    const width = 40;
    const height = 20;
    const ctx = { env: { dimensions: { width, height } }, knobs: {} };
    const meshConfig = computeMesh.normalize(
      {
        strategy: "default",
        config: { plateCount: 9, cellsPerPlate: 2, relaxationSteps: 2, referenceArea: 800, plateScalePower: 0 },
      },
      ctx as any
    );

    const mesh = computeMesh.run(
      {
        width,
        height,
        rngSeed: 11,
      },
      meshConfig
    ).mesh;

    const potentialA = computeMantlePotential.run(
      { mesh, rngSeed: 42 },
      computeMantlePotential.defaultConfig
    ).mantlePotential;
    const potentialB = computeMantlePotential.run(
      { mesh, rngSeed: 42 },
      computeMantlePotential.defaultConfig
    ).mantlePotential;

    expect(Array.from(potentialA.potential)).toEqual(Array.from(potentialB.potential));
    expect(Array.from(potentialA.sourceCell)).toEqual(Array.from(potentialB.sourceCell));
    expect(Array.from(potentialA.sourceType)).toEqual(Array.from(potentialB.sourceType));

    const forcingA = computeMantleForcing.run(
      { mesh, mantlePotential: potentialA },
      computeMantleForcing.defaultConfig
    ).mantleForcing;
    const forcingB = computeMantleForcing.run(
      { mesh, mantlePotential: potentialA },
      computeMantleForcing.defaultConfig
    ).mantleForcing;

    expect(Array.from(forcingA.stress)).toEqual(Array.from(forcingB.stress));
    expect(Array.from(forcingA.forcingMag)).toEqual(Array.from(forcingB.forcingMag));
    expect(Array.from(forcingA.upwellingClass)).toEqual(Array.from(forcingB.upwellingClass));
  });

  it("produces non-uniform mantle potential fields", () => {
    const width = 50;
    const height = 30;
    const ctx = { env: { dimensions: { width, height } }, knobs: {} };
    const meshConfig = computeMesh.normalize(
      {
        strategy: "default",
        config: { plateCount: 12, cellsPerPlate: 2, relaxationSteps: 2, referenceArea: 1500, plateScalePower: 0 },
      },
      ctx as any
    );

    const mesh = computeMesh.run(
      {
        width,
        height,
        rngSeed: 7,
      },
      meshConfig
    ).mesh;

    const potential = computeMantlePotential.run(
      { mesh, rngSeed: 9 },
      computeMantlePotential.defaultConfig
    ).mantlePotential.potential;

    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    for (let i = 0; i < potential.length; i++) {
      const v = potential[i] ?? 0;
      if (v < min) min = v;
      if (v > max) max = v;
    }

    expect(max - min).toBeGreaterThan(0.05);
    expect(variance(potential)).toBeGreaterThan(1e-4);
  });

  it("treats wrap neighbors as adjacent in mantle potential (no seam discontinuity)", () => {
    const mesh = {
      cellCount: 2,
      wrapWidth: 10,
      siteX: new Float32Array([0, 10]),
      siteY: new Float32Array([0, 0]),
      neighborsOffsets: new Int32Array([0, 1, 2]),
      neighbors: new Int32Array([1, 0]),
      areas: new Float32Array([1, 1]),
      bbox: { xl: 0, xr: 10, yt: 0, yb: 0 },
    };

    const config = {
      ...computeMantlePotential.defaultConfig,
      plumeCount: 1,
      downwellingCount: 0,
      smoothingIterations: 0,
      minSeparationScale: 0,
    };

    const result = computeMantlePotential.run({ mesh, rngSeed: 1 }, config).mantlePotential;
    const source = result.sourceCell[0] ?? 0;
    const other = source === 0 ? 1 : 0;
    const delta = Math.abs((result.potential[source] ?? 0) - (result.potential[other] ?? 0));
    expect(delta).toBeLessThan(1e-4);
  });
});
