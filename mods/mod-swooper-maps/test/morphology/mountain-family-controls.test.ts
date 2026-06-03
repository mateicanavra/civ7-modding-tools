import { describe, expect, it } from "bun:test";

import { BOUNDARY_TYPE } from "../../src/domain/foundation/constants.js";
import planFoothills from "../../src/domain/morphology/ops/plan-foothills/index.js";
import planRidges from "../../src/domain/morphology/ops/plan-ridges/index.js";

function countMask(mask: Uint8Array): number {
  let count = 0;
  for (const value of mask) if (value === 1) count++;
  return count;
}

function createRidgeInput(width: number, height: number) {
  const size = width * height;
  const boundaryCloseness = new Uint8Array(size).fill(180);
  const boundaryType = new Uint8Array(size).fill(BOUNDARY_TYPE.convergent);
  const upliftPotential = new Uint8Array(size).fill(180);
  const collisionPotential = new Uint8Array(size).fill(180);
  const subductionPotential = new Uint8Array(size);
  const riftPotential = new Uint8Array(size);
  const tectonicStress = new Uint8Array(size).fill(180);
  return {
    width,
    height,
    landMask: new Uint8Array(size).fill(1),
    boundaryCloseness,
    boundaryType,
    upliftPotential,
    collisionPotential,
    subductionPotential,
    riftPotential,
    tectonicStress,
    beltAge: new Uint8Array(size),
    fractalMountain: new Int16Array(size).fill(200),
  };
}

describe("morphology mountain-family controls", () => {
  it("uses mountainMinFraction as a physics-gated floor when absolute thresholds underfill", () => {
    const input = createRidgeInput(12, 1);

    const result = planRidges.run(input, {
      strategy: "default",
      config: {
        ...(planRidges.defaultConfig as any).config,
        mountainMaxFraction: 0.4,
        mountainMinFraction: 0.25,
        mountainThreshold: 10,
        driverSignalByteMin: 1,
        boundaryGate: 0,
        boundaryExponent: 1,
        rangeEnvelopeScale: 1,
      },
    });

    expect(countMask(result.mountainMask)).toBeGreaterThanOrEqual(3);
  });

  it("uses foothillMinFraction as a local skirt around an existing ridge mask", () => {
    const width = 9;
    const height = 1;
    const size = width * height;
    const mountainMask = new Uint8Array(size);
    mountainMask[4] = 1;

    const result = planFoothills.run(
      {
        ...createRidgeInput(width, height),
        mountainMask,
        fractalHill: new Int16Array(size).fill(200),
      },
      {
        strategy: "default",
        config: {
          ...(planFoothills.defaultConfig as any).config,
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

    expect(countMask(result.hillMask)).toBeGreaterThanOrEqual(3);
    expect(result.hillMask[4]).toBe(0);
  });
});
