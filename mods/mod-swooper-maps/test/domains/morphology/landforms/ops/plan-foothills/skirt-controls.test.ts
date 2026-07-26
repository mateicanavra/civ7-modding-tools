import { describe, expect, it } from "bun:test";

import morphology from "@mapgen/domain/morphology/router";
import { BOUNDARY_TYPE } from "@swooper/mapgen-core/lib/plates";

const { planFoothills } = morphology.landforms.ops;

function countMask(mask: Uint8Array): number {
  let count = 0;
  for (const value of mask) if (value === 1) count++;
  return count;
}

describe("plan-foothills skirt controls", () => {
  it("uses foothillMinFraction as a local skirt around an existing ridge mask", () => {
    const syntheticDimensions = { width: 9, height: 1 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;
    const mountainMask = new Uint8Array(size);
    mountainMask[4] = 1;
    const admittedSkirt = new Set([2, 3, 5, 6]);
    const boundaryCloseness = new Uint8Array(size);
    const boundaryType = new Uint8Array(size);
    const upliftPotential = new Uint8Array(size);
    const collisionPotential = new Uint8Array(size);
    const tectonicStress = new Uint8Array(size);
    for (const index of admittedSkirt) {
      boundaryCloseness[index] = 180;
      boundaryType[index] = BOUNDARY_TYPE.convergent;
      upliftPotential[index] = 180;
      collisionPotential[index] = 180;
      tectonicStress[index] = 180;
    }

    const result = planFoothills.run(
      {
        width,
        height,
        landMask: new Uint8Array(size).fill(1),
        mountainMask,
        mountainRegionMask: mountainMask,
        mountainRegionIdByTile: Int32Array.from(mountainMask, (value) => (value === 1 ? 0 : -1)),
        boundaryCloseness,
        boundaryType,
        upliftPotential,
        collisionPotential,
        subductionPotential: new Uint8Array(size),
        riftPotential: new Uint8Array(size),
        tectonicStress,
        beltAge: new Uint8Array(size),
        fractalHill: new Int16Array(size).fill(200),
      },
      {
        strategy: "mountain-proximity",
        config: {
          ...planFoothills.defaultConfig.config,
          foothillMaxDistance: 2,
          foothillMaxFraction: 0.5,
          foothillMinFraction: 0.3,
          hillThreshold: 10,
          driverSignalByteMin: 1,
          boundaryGate: 0,
          boundaryExponent: 1,
          rangeEnvelopeScale: 1,
        },
      }
    );

    const hillCount = countMask(result.hillMask);
    expect(hillCount).toBeGreaterThanOrEqual(3);
    expect(hillCount).toBeLessThanOrEqual(admittedSkirt.size);
    expect(result.hillMask[4]).toBe(0);
    for (let index = 0; index < result.hillMask.length; index++) {
      if (result.hillMask[index] === 1) expect(admittedSkirt.has(index)).toBe(true);
    }
  });
});
