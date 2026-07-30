import { describe, expect, it } from "bun:test";

import foundation from "@mapgen/domain/foundation/router";

const { computeMantleForcing } = foundation.mantle.ops;

const SYNTHETIC_LINE_MESH = {
  cellCount: 3,
  wrapWidth: 100,
  siteX: new Float32Array([0, 1, 2]),
  siteY: new Float32Array([0, 0, 0]),
  neighborsOffsets: new Int32Array([0, 1, 3, 4]),
  neighbors: new Int32Array([1, 0, 2, 1]),
};

function forcePotential(potential: Float32Array) {
  return computeMantleForcing.run(
    {
      mesh: SYNTHETIC_LINE_MESH,
      mantlePotential: { potential },
    },
    {
      ...computeMantleForcing.defaultConfig,
      config: {
        ...computeMantleForcing.defaultConfig.config,
        rotationScale: 0,
        curvatureWeight: 0,
      },
    }
  ).mantleForcing;
}

describe("foundation/compute-mantle-forcing", () => {
  it("turns potential slope into downhill forcing and classifies signed extrema", () => {
    const descending = forcePotential(new Float32Array([1, 0, -1]));
    const ascending = forcePotential(new Float32Array([-1, 0, 1]));

    expect(Array.from(descending.upwellingClass)).toEqual([1, 0, -1]);
    expect(Array.from(ascending.upwellingClass)).toEqual([-1, 0, 1]);
    expect(Array.from(descending.divergence)).toEqual([-1, 0, 1]);
    expect(Array.from(ascending.divergence)).toEqual([1, 0, -1]);

    for (let cellId = 0; cellId < SYNTHETIC_LINE_MESH.cellCount; cellId++) {
      expect(descending.forcingU[cellId]).toBeGreaterThan(0);
      expect(ascending.forcingU[cellId]).toBeLessThan(0);
      expect(descending.forcingU[cellId]).toBeCloseTo(-(ascending.forcingU[cellId] ?? Number.NaN));
      expect(descending.forcingV[cellId]).toBeCloseTo(0);
      expect(ascending.forcingV[cellId]).toBeCloseTo(0);
      expect(descending.forcingMag[cellId]).toBeCloseTo(ascending.forcingMag[cellId] ?? -1);
      expect(descending.stress[cellId]).toBeCloseTo(ascending.stress[cellId] ?? -1);
    }
  });
});
