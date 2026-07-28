import { describe, expect, it } from "bun:test";

import foundation from "../../../../../../src/domain/foundation/router.js";

const { computeCrust } = foundation.lithosphere.ops;

describe("foundation/compute-crust", () => {
  it("initializes a basaltic lid while positive mantle divergence seeds local damage", () => {
    const syntheticCellCount = 3;
    const crust = computeCrust.run(
      {
        mesh: { cellCount: syntheticCellCount },
        mantleForcing: {
          divergence: new Float32Array([0, 1, -1]),
          forcingMag: new Float32Array([0, 1, 1]),
          stress: new Float32Array([0, 1, 1]),
        },
      },
      {
        ...computeCrust.defaultConfig,
        config: {
          ...computeCrust.defaultConfig.config,
          basalticThickness01: 0.4,
          riftWeakening01: 1,
        },
      }
    ).crust;

    expect(Array.from(crust.maturity)).toEqual([0, 0, 0]);
    expect(Array.from(crust.thermalAge)).toEqual([0, 0, 0]);
    expect(Array.from(crust.age)).toEqual([0, 0, 0]);
    expect(Array.from(crust.type)).toEqual([0, 0, 0]);

    for (let cellId = 0; cellId < syntheticCellCount; cellId++) {
      expect(crust.thickness[cellId]).toBeCloseTo(0.4);
      expect(crust.baseElevation[cellId]).toBeCloseTo(crust.buoyancy[cellId] ?? Number.NaN);
    }

    expect(Array.from(crust.damage)).toEqual([0, 255, 0]);
    expect(crust.strength[1]).toBeLessThan(crust.strength[0] ?? 0);
    expect(crust.strength[2]).toBeCloseTo(crust.strength[0] ?? Number.NaN);
  });
});
