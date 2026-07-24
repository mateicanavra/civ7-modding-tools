import { describe, expect, it } from "bun:test";

import morphology from "@mapgen/domain/morphology/router";
import { BOUNDARY_TYPE } from "@swooper/mapgen-core/lib/plates";

const { planRidges } = morphology.landforms.ops;

function countMask(mask: Uint8Array, start: number, end: number): number {
  let count = 0;
  for (let index = start; index < end; index++) if (mask[index] === 1) count++;
  return count;
}

describe("plan-ridges physics gating", () => {
  it("concentrates mountains in a convergent regime when texture noise is disabled", () => {
    const syntheticDimensions = { width: 20, height: 1 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;
    const landMask = new Uint8Array(size).fill(1);
    const boundaryCloseness = new Uint8Array(size);
    const boundaryType = new Uint8Array(size);
    const upliftPotential = new Uint8Array(size);
    const tectonicStress = new Uint8Array(size);

    for (let index = 0; index < size / 2; index++) {
      boundaryCloseness[index] = 255;
      boundaryType[index] = BOUNDARY_TYPE.convergent;
      upliftPotential[index] = 220;
      tectonicStress[index] = 220;
    }

    const { mountainMask } = planRidges.run(
      {
        width,
        height,
        landMask,
        boundaryCloseness,
        boundaryType,
        upliftPotential,
        collisionPotential: upliftPotential,
        subductionPotential: new Uint8Array(size),
        riftPotential: new Uint8Array(size),
        tectonicStress,
        beltAge: new Uint8Array(size),
        fractalMountain: new Int16Array(size),
      },
      {
        strategy: "orogenic-range-growth",
        config: {
          ...planRidges.defaultConfig.config,
          boundaryGate: 0,
          boundaryExponent: 1,
          fractalWeight: 0,
          mountainThreshold: 0.15,
          hillThreshold: 0.1,
        },
      }
    );

    expect(countMask(mountainMask, 0, size / 2)).toBeGreaterThan(0);
    expect(countMask(mountainMask, size / 2, size)).toBe(0);
  });
});
