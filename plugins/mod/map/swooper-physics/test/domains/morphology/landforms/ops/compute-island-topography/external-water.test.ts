import { describe, expect, it } from "bun:test";

import morphology from "../../../../../../src/domain/morphology/router.js";
import { artifacts } from "../../../../../../src/domain/morphology/modules/landforms/artifacts/index.js";
import {
  createIslandTopographyInput,
  createIslandTopographySelection,
} from "./fixtures/island-topography.js";

const { computeIslandTopography } = morphology.landforms.ops;
const SYNTHETIC_WIDTH = 12;
const SYNTHETIC_HEIGHT = 5;
const CELL_COUNT = SYNTHETIC_WIDTH * SYNTHETIC_HEIGHT;
const preserveTopographySelection = {
  ...computeIslandTopography.defaultConfig,
  config: { ...computeIslandTopography.defaultConfig.config, minDistFromLandRadius: 1 },
};

function createInput(waterCells: readonly number[]) {
  const landMask = new Uint8Array(CELL_COUNT).fill(1);
  for (const index of waterCells) landMask[index] = 0;
  const elevation = Int16Array.from(landMask, (land) => (land === 1 ? 7 : -8));
  const bathymetry = Int16Array.from(landMask, (land) => (land === 1 ? 0 : -8));
  return {
    width: SYNTHETIC_WIDTH,
    height: SYNTHETIC_HEIGHT,
    seaLevel: 0,
    landMask,
    elevation,
    bathymetry,
    distanceToCoast: new Uint16Array(CELL_COUNT),
    boundaryCloseness: new Uint8Array(CELL_COUNT),
    boundaryType: new Uint8Array(CELL_COUNT),
    volcanism: new Uint8Array(CELL_COUNT),
    rngSeed: 41,
  };
}

function run(waterCells: readonly number[]) {
  const input = createInput(waterCells);
  const { elevation, landMask, bathymetry } = input;
  const before = structuredClone(input);
  const output = computeIslandTopography.run(input, preserveTopographySelection);
  expect(input).toEqual(before);
  expect(output.topography.elevation).toEqual(elevation);
  expect(output.topography.landMask).toEqual(landMask);
  expect(output.topography.bathymetry).toEqual(bathymetry);
  expect(output.topography.seaLevel).toBe(input.seaLevel);
  expect(output.topography.externalWaterMask).not.toBe(input.landMask);
  for (let index = 0; index < CELL_COUNT; index += 1) {
    if (output.topography.externalWaterMask[index] !== 1) continue;
    expect(output.topography.landMask[index]).toBe(0);
    expect(output.topography.elevation[index]).toBeLessThanOrEqual(input.seaLevel);
  }
  expect(artifacts.topography.validate(output.topography, {
    dimensions: { width: SYNTHETIC_WIDTH, height: SYNTHETIC_HEIGHT },
  })).toEqual([]);
  return output.topography.externalWaterMask;
}

function memberships(mask: ArrayLike<number>): number[] {
  return Array.from({ length: mask.length }, (_, index) => index).filter((index) => mask[index] === 1);
}

function translateX(indices: readonly number[], shift: number): number[] {
  return indices
    .map((index) => Math.floor(index / SYNTHETIC_WIDTH) * SYNTHETIC_WIDTH +
      ((index % SYNTHETIC_WIDTH + shift) % SYNTHETIC_WIDTH))
    .sort((a, b) => a - b);
}

describe("compute-island-topography external-water declaration", () => {
  it("prescribes no ocean without water and one ocean for all-water geometry", () => {
    expect(memberships(run([]))).toEqual([]);
    expect(run(Array.from({ length: CELL_COUNT }, (_, index) => index))).toEqual(
      new Uint8Array(CELL_COUNT).fill(1)
    );
  });

  it("prescribes separate north and south seas without ranking their areas", () => {
    const northSea = [0, 1, 11];
    const southSea = [48, 49];
    expect(memberships(run([...northSea, ...southSea, 29]))).toEqual([
      ...northSea, ...southSea,
    ]);
  });

  it("keeps a larger enclosed body finite beside a smaller boundary sea", () => {
    expect(memberships(run([5, 24, 25, 26, 27, 35]))).toEqual([5]);
  });

  it("keeps fully enclosed geometry finite even when it winds around X", () => {
    expect(memberships(run([24, 25, 35]))).toEqual([]);
    expect(memberships(run(Array.from({ length: SYNTHETIC_WIDTH }, (_, x) => 24 + x))))
      .toEqual([]);
  });

  it("includes connected interior cells but does not connect north and south through Y", () => {
    expect(memberships(run([5, 17, 53]))).toEqual([5, 17, 53]);
  });

  it("preserves boundary seas and enclosed seam pockets under every wrapped X translation", () => {
    for (const [water, expected] of [
      [[0, 1, 11, 48, 49, 29], [0, 1, 11, 48, 49]],
      [[24, 25, 35, 5, 53], [5, 53]],
    ] as const) {
      for (let shift = 0; shift < SYNTHETIC_WIDTH; shift += 1) {
        expect(memberships(run(translateX(water, shift)))).toEqual(translateX(expected, shift));
      }
    }
  });

  it("declares the completed post-island water rather than the pre-island mask", () => {
    const input = createIslandTopographyInput();
    const output = computeIslandTopography.run(input, createIslandTopographySelection(1));
    const redeclared = computeIslandTopography.run({
      ...input,
      landMask: output.topography.landMask,
      elevation: output.topography.elevation,
      seaLevel: output.topography.seaLevel,
      bathymetry: output.topography.bathymetry,
      distanceToCoast: new Uint16Array(input.width * input.height),
    }, preserveTopographySelection);
    expect(redeclared.islandClass).toEqual(new Uint8Array(input.width * input.height));
    expect(redeclared.topography.landMask).toEqual(output.topography.landMask);
    expect(redeclared.topography.elevation).toEqual(output.topography.elevation);
    expect(output.topography.externalWaterMask).toEqual(redeclared.topography.externalWaterMask);
    let islandCount = 0;
    for (let index = 0; index < output.islandClass.length; index += 1) {
      if (output.islandClass[index] === 0) continue;
      islandCount += 1;
      expect(output.topography.externalWaterMask[index]).toBe(0);
    }
    expect(islandCount).toBeGreaterThan(0);
  });

  it("refuses nonbinary initial-water classification rather than treating it as water", () => {
    const input = createInput([]);
    input.landMask[4] = 2;
    const before = structuredClone(input);
    expect(() => computeIslandTopography.run(input, preserveTopographySelection))
      .toThrow("binary initial landMask at tile 4");
    expect(input).toEqual(before);
  });

  it("refuses prescribed ground above the existing receiving head without altering it", () => {
    const input = createInput(Array.from({ length: CELL_COUNT }, (_, index) => index));
    input.elevation.fill(-2);
    input.elevation[4] = 1;
    const before = structuredClone(input);
    expect(() => computeIslandTopography.run(input, preserveTopographySelection))
      .toThrow("ground at tile 4 exceeds the seaLevel datum");
    expect(input.elevation[4]).toBe(1);
    expect(input).toEqual(before);
  });
});
