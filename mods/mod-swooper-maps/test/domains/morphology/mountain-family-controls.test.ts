import { describe, expect, it } from "bun:test";
import morphology from "@mapgen/domain/morphology/ops";
import {
  collectMaskComponentsOddQ,
  forEachHexNeighborOddQ,
  resolveTileAreaSpacingTarget,
} from "@swooper/mapgen-core/lib/grid";
import { BOUNDARY_TYPE } from "@swooper/mapgen-core/lib/plates";

const { planFoothills, planRidges } = morphology.ops;

function countMask(mask: Uint8Array): number {
  let count = 0;
  for (const value of mask) if (value === 1) count++;
  return count;
}

function componentSizes(mask: Uint8Array, width: number, height: number): number[] {
  return collectMaskComponentsOddQ({ mask, width, height })
    .map((component) => component.size)
    .sort((a, b) => b - a);
}

function componentCount(mask: Uint8Array, width: number, height: number): number {
  return componentSizes(mask, width, height).length;
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
  it("derives Civ map-size range-system counts from one spacing input", () => {
    const mountainRangeSpacingTiles = Math.sqrt((106 * 66) / 18);
    const officialMapSizes = [
      { label: "Tiny", width: 60, height: 38, expected: 6 },
      { label: "Small", width: 74, height: 46, expected: 9 },
      { label: "Standard", width: 84, height: 54, expected: 12 },
      { label: "Large", width: 96, height: 60, expected: 15 },
      { label: "Huge", width: 106, height: 66, expected: 18 },
    ];

    for (const size of officialMapSizes) {
      expect(
        resolveTileAreaSpacingTarget({
          width: size.width,
          height: size.height,
          spacingTiles: mountainRangeSpacingTiles,
        }),
        size.label
      ).toBe(size.expected);
    }
  });

  it("uses Earth-scaled range targets to create multiple multi-tile ridge components", () => {
    const width = 30;
    const height = 1;
    const input = createRidgeInput(width, height);
    input.fractalMountain.fill(-400);
    for (const x of [3, 15, 26]) {
      input.fractalMountain[x] = 400;
      input.fractalMountain[(x + width - 1) % width] = 100;
      input.fractalMountain[(x + 1) % width] = 100;
    }

    const result = planRidges.run(input, {
      strategy: "default",
      config: {
        ...(planRidges.defaultConfig as any).config,
        mountainMaxFraction: 0.8,
        mountainMinFraction: 0,
        mountainSpineFraction: 0.01,
        mountainRangeSpacingTiles: Math.sqrt((width * height) / 3),
        mountainSpineDilationSteps: 1,
        mountainSpineMinDistance: 4,
        mountainThreshold: 0.1,
        mountainShoulderThresholdScale: 0.1,
        driverSignalByteMin: 1,
        boundaryGate: 0,
        boundaryExponent: 1,
        rangeEnvelopeScale: 1,
      },
    });

    expect(componentCount(result.mountainMask, width, height)).toBeGreaterThanOrEqual(3);
    expect(countMask(result.mountainMask)).toBeGreaterThanOrEqual(6);
  });

  it("carries a mountain region along a Large-map tectonic corridor", () => {
    const width = 96;
    const height = 60;
    const input = createRidgeInput(width, height);
    input.fractalMountain.fill(-500);
    const y = 30;
    for (let x = 18; x <= 78; x++) {
      input.fractalMountain[y * width + x] = 500;
      input.fractalMountain[y * width + ((x + 1) % width)] = Math.max(
        input.fractalMountain[y * width + ((x + 1) % width)] ?? -500,
        160
      );
    }

    const result = planRidges.run(input, {
      strategy: "default",
      config: {
        ...(planRidges.defaultConfig as any).config,
        mountainMaxFraction: 0.2,
        mountainMinFraction: 0,
        mountainSpineFraction: 0.01,
        mountainRangeSpacingTiles: Math.sqrt(width * height),
        mountainRangeLengthTiles: 30,
        mountainRegionRadiusTiles: 4,
        mountainSpineDilationSteps: 0,
        mountainSpineMinDistance: 4,
        mountainThreshold: 0.1,
        mountainShoulderThresholdScale: 0.1,
        driverSignalByteMin: 1,
        boundaryGate: 0,
        boundaryExponent: 1,
        rangeEnvelopeScale: 1,
      },
    });

    const mountainComponents = collectMaskComponentsOddQ({
      mask: result.mountainMask,
      width,
      height,
    });
    const regionComponents = collectMaskComponentsOddQ({
      mask: result.mountainRegionMask,
      width,
      height,
    });

    expect(regionComponents[0]?.diameter ?? 0).toBeGreaterThanOrEqual(30);
    expect(regionComponents[0]?.size ?? 0).toBeGreaterThan(mountainComponents[0]?.size ?? 0);
  });

  it("distributes Earth-scaled range systems instead of collapsing them into the highest-score belts", () => {
    const width = 60;
    const height = 20;
    const input = createRidgeInput(width, height);
    input.fractalMountain.fill(-500);

    const centers = [
      { x: 6, y: 6, score: 700 },
      { x: 12, y: 7, score: 680 },
      { x: 18, y: 6, score: 660 },
      { x: 24, y: 7, score: 640 },
      { x: 34, y: 5, score: 500 },
      { x: 45, y: 6, score: 500 },
      { x: 54, y: 8, score: 500 },
      { x: 9, y: 15, score: 500 },
      { x: 22, y: 16, score: 500 },
      { x: 36, y: 15, score: 500 },
      { x: 48, y: 14, score: 500 },
      { x: 56, y: 16, score: 500 },
    ];

    for (const center of centers) {
      const i = center.y * width + center.x;
      input.fractalMountain[i] = center.score;
      forEachHexNeighborOddQ(center.x, center.y, width, height, (nx, ny) => {
        input.fractalMountain[ny * width + nx] = Math.max(
          input.fractalMountain[ny * width + nx] ?? -500,
          80
        );
      });
    }

    const result = planRidges.run(input, {
      strategy: "default",
      config: {
        ...(planRidges.defaultConfig as any).config,
        mountainMaxFraction: 0.5,
        mountainMinFraction: 0.12,
        mountainSpineFraction: 0.01,
        mountainRangeSpacingTiles: Math.sqrt((width * height) / 10),
        mountainSpineDilationSteps: 1,
        mountainSpineMinDistance: 1,
        mountainThreshold: 0.1,
        mountainShoulderThresholdScale: 0.1,
        driverSignalByteMin: 1,
        boundaryGate: 0,
        boundaryExponent: 1,
        rangeEnvelopeScale: 1,
      },
    });

    const sizes = componentSizes(result.mountainMask, width, height);
    const mountainCount = countMask(result.mountainMask);
    const topTwoShare = ((sizes[0] ?? 0) + (sizes[1] ?? 0)) / Math.max(1, mountainCount);
    expect(sizes.filter((size) => size >= 2).length).toBeGreaterThanOrEqual(8);
    expect(topTwoShare).toBeLessThanOrEqual(0.35);
  });

  it("publishes broader physically gated orogenic province footprints around mountain spines", () => {
    const width = 24;
    const height = 8;
    const input = createRidgeInput(width, height);
    input.fractalMountain.fill(-500);

    for (const center of [
      { x: 5, y: 3 },
      { x: 17, y: 4 },
    ]) {
      const i = center.y * width + center.x;
      input.fractalMountain[i] = 700;
      forEachHexNeighborOddQ(center.x, center.y, width, height, (nx, ny) => {
        input.fractalMountain[ny * width + nx] = Math.max(
          input.fractalMountain[ny * width + nx] ?? -500,
          120
        );
      });
    }

    const result = planRidges.run(input, {
      strategy: "default",
      config: {
        ...(planRidges.defaultConfig as any).config,
        mountainMaxFraction: 0.18,
        mountainMinFraction: 0,
        mountainRangeSpacingTiles: Math.sqrt((width * height) / 2),
        mountainRegionRadiusTiles: 3,
        mountainSpineDilationSteps: 1,
        mountainSpineMinDistance: 4,
        mountainThreshold: 0.1,
        mountainShoulderThresholdScale: 0.1,
        driverSignalByteMin: 1,
        boundaryGate: 0,
        boundaryExponent: 1,
        rangeEnvelopeScale: 1,
      },
    });

    const mountainTiles = countMask(result.mountainMask);
    const regionTiles = countMask(result.mountainRegionMask);
    let nonMountainRegionTiles = 0;
    const regionIds = new Set<number>();
    for (let i = 0; i < result.mountainMask.length; i++) {
      if (result.mountainMask[i] === 1) {
        expect(result.mountainRegionMask[i]).toBe(1);
        expect(result.mountainRegionIdByTile[i]).toBeGreaterThanOrEqual(0);
      }
      if (result.mountainRegionMask[i] === 1) {
        regionIds.add(result.mountainRegionIdByTile[i] ?? -1);
        if (result.mountainMask[i] !== 1) nonMountainRegionTiles += 1;
      }
    }

    expect(regionTiles).toBeGreaterThan(mountainTiles);
    expect(nonMountainRegionTiles).toBeGreaterThan(0);
    expect(regionIds.size).toBeGreaterThanOrEqual(2);
  });

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
        mountainRegionMask: mountainMask,
        mountainRegionIdByTile: Int32Array.from(mountainMask, (value) => (value === 1 ? 0 : -1)),
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
