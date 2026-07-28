import { describe, expect, it } from "bun:test";
import morphology from "../../../../../src/domain/morphology/router.js";
import { TEST_MAP_SIZE } from "../../../../setup.js";

const { planFoothills, planRidges } = morphology.landforms.ops;
function countMask(mask: Uint8Array, start: number, end: number): number {
  let count = 0;
  for (let i = start; i < end; i++) if (mask[i] === 1) count++;
  return count;
}

describe("mountain-family orogeny gating", () => {
  it("noise-only runs cannot create mountain belts without orogeny signal", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;

    const landMask = new Uint8Array(size);
    landMask.fill(1);

    const boundaryCloseness = new Uint8Array(size);
    const boundaryType = new Uint8Array(size);
    const upliftPotential = new Uint8Array(size);
    const collisionPotential = upliftPotential;
    const subductionPotential = new Uint8Array(size);
    const riftPotential = new Uint8Array(size);
    const tectonicStress = new Uint8Array(size);
    const beltAge = new Uint8Array(size);

    const fractalMountain = new Int16Array(size);
    const fractalHill = new Int16Array(size);
    fractalMountain.fill(255);
    fractalHill.fill(255);

    const ridges = planRidges.run(
      {
        width,
        height,
        landMask,
        boundaryCloseness,
        boundaryType,
        upliftPotential,
        collisionPotential,
        subductionPotential,
        riftPotential,
        tectonicStress,
        beltAge,
        fractalMountain,
      },
      {
        strategy: "orogenic-range-growth",
        config: {
          ...planRidges.defaultConfig.config,
          boundaryGate: 0,
          boundaryExponent: 1,
          fractalWeight: 5,
          mountainThreshold: 0.01,
          hillThreshold: 0.01,
        },
      }
    );

    const foothills = planFoothills.run(
      {
        width,
        height,
        landMask,
        mountainMask: ridges.mountainMask,
        mountainRegionMask: ridges.mountainRegionMask,
        mountainRegionIdByTile: ridges.mountainRegionIdByTile,
        boundaryCloseness,
        boundaryType,
        upliftPotential,
        collisionPotential,
        subductionPotential,
        riftPotential,
        tectonicStress,
        beltAge,
        fractalHill,
      },
      {
        strategy: "mountain-proximity",
        config: {
          ...planFoothills.defaultConfig.config,
          boundaryGate: 0,
          boundaryExponent: 1,
          fractalWeight: 5,
          mountainThreshold: 0.01,
          hillThreshold: 0.01,
        },
      }
    );

    expect(countMask(ridges.mountainMask, 0, size)).toBe(0);
    expect(countMask(foothills.hillMask, 0, size)).toBe(0);
    expect(Array.from(ridges.orogenyPotential)).toEqual(Array.from(new Uint8Array(size)));
    expect(Array.from(ridges.fracturePotential)).toEqual(Array.from(new Uint8Array(size)));
  });
});
