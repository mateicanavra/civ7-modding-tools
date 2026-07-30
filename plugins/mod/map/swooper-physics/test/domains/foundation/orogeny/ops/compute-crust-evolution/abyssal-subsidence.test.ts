import { describe, expect, it } from "bun:test";
import foundation from "../../../../../../src/domain/foundation/router.js";

const { computeCrustEvolution } = foundation.orogeny.ops;

function tectonicEra(cellCount: number) {
  const upliftPotential = new Uint8Array(cellCount);
  upliftPotential[0] = 255;
  return {
    upliftPotential,
    riftPotential: new Uint8Array(cellCount),
    shearStress: new Uint8Array(cellCount),
    volcanism: new Uint8Array(cellCount),
    fracture: new Uint8Array(cellCount),
  };
}

describe("compute-crust-evolution abyssal subsidence", () => {
  it("deepens oceanic crust with distance from a continental margin without moving the continent", () => {
    const syntheticCellCount = 5;
    const input = {
      mesh: {
        cellCount: syntheticCellCount,
        neighborsOffsets: new Int32Array([0, 1, 3, 5, 7, 8]),
        neighbors: new Int32Array([1, 0, 2, 1, 3, 2, 4, 3]),
      },
      initialCrust: {
        thickness: new Float32Array(syntheticCellCount).fill(0.25),
        strength: new Float32Array(syntheticCellCount).fill(0.5),
      },
      tectonics: {
        boundaryType: new Uint8Array(syntheticCellCount),
        cumulativeUplift: new Uint8Array(syntheticCellCount),
        riftPotential: new Uint8Array(syntheticCellCount),
        shearStress: new Uint8Array(syntheticCellCount),
      },
      tectonicHistory: {
        eras: Array.from({ length: 5 }, () => tectonicEra(syntheticCellCount)),
        upliftTotal: new Uint8Array([255, 0, 0, 0, 0]),
        fractureTotal: new Uint8Array(syntheticCellCount),
      },
    };

    const flat = computeCrustEvolution.run(input, {
      ...computeCrustEvolution.defaultConfig,
      config: {
        ...computeCrustEvolution.defaultConfig.config,
        oceanicAbyssalDepth: 0,
      },
    }).crust;
    const subsided = computeCrustEvolution.run(input, {
      ...computeCrustEvolution.defaultConfig,
      config: {
        ...computeCrustEvolution.defaultConfig.config,
        oceanicAbyssalDepth: 0.1,
      },
    }).crust;

    expect(Array.from(subsided.type)).toEqual([1, 0, 0, 0, 0]);
    expect(subsided.baseElevation[0]).toBe(flat.baseElevation[0]);
    for (let cell = 1; cell < syntheticCellCount; cell++) {
      expect(subsided.baseElevation[cell]!).toBeLessThan(flat.baseElevation[cell]!);
      expect(subsided.buoyancy[cell]).toBe(subsided.baseElevation[cell]);
    }
    expect(subsided.baseElevation[1]!).toBeGreaterThan(subsided.baseElevation[2]!);
    expect(subsided.baseElevation[2]!).toBeGreaterThan(subsided.baseElevation[3]!);
    expect(subsided.baseElevation[3]!).toBeGreaterThan(subsided.baseElevation[4]!);
  });
});
