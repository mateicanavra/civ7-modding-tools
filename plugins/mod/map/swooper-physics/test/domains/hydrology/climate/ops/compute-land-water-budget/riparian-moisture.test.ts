import { describe, expect, it } from "bun:test";
import hydrology from "../../../../../../src/domain/hydrology/router.js";
import { TEST_MAP_SIZE } from "../../../../../setup.js";

const { computeLandWaterBudget, computePotentialDemand } = hydrology.climate.ops;
const strategy = computeLandWaterBudget.defaultConfig;
const RIVER_CLASS_MINOR = 1, RIVER_CLASS_MAJOR = 2;
const parameters = {
  tMinC: 0,
  tMaxC: 35,
  petBase: 18,
  petTemperatureWeight: 75,
  wetnessDampening: 0.55,
} as const;

function indexOf(x: number, y: number, width: number): number {
  return y * width + x;
}

describe("hydrology/compute-land-water-budget riparian moisture", () => {
  it("orders major, minor, and dry land while keeping water outside the terrestrial budget", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const precipitation = new Float32Array(size).fill(40.25);
    const surfaceWetness = new Float32Array(size).fill(100 / 255);
    const surfaceTemperatureC = new Float32Array(size).fill(20);
    const landMask = new Uint8Array(size).fill(1);
    const riverClass = new Uint8Array(size);
    const y = Math.floor(height / 2);
    const minorTile = indexOf(Math.floor(width / 6), y, width);
    const majorTile = indexOf(Math.floor((2 * width) / 6), y, width);
    const mixedTierTile = majorTile + 1;
    const dryTile = indexOf(Math.floor((3 * width) / 6), y, width);
    const waterTile = indexOf(Math.floor((4 * width) / 6), y, width);
    const saturatedTile = indexOf(Math.floor((5 * width) / 6), y, width);
    riverClass[minorTile] = RIVER_CLASS_MINOR;
    riverClass[majorTile] = RIVER_CLASS_MAJOR + 1;
    riverClass[mixedTierTile] = RIVER_CLASS_MINOR;
    riverClass[waterTile] = RIVER_CLASS_MAJOR;
    riverClass[saturatedTile] = RIVER_CLASS_MAJOR;
    landMask[waterTile] = 0;
    precipitation[saturatedTile] = 400.25;
    surfaceWetness[saturatedTile] = 1;

    const input = {
      width,
      height,
      landMask,
      precipitation,
      surfaceWetness,
      pet: computePotentialDemand.run(
        { width, height, surfaceWetness, surfaceTemperatureC, parameters },
        computePotentialDemand.defaultConfig
      ).pet,
      riverClass,
    };
    const precipitationBefore = new Float32Array(precipitation);
    const wetnessBefore = new Float32Array(surfaceWetness);
    const riverClassBefore = new Uint8Array(riverClass);
    const first = computeLandWaterBudget.run(input, strategy);
    const second = computeLandWaterBudget.run(input, strategy);

    const baseMoisture = 40.25 + 0.35 * (255 * surfaceWetness[dryTile]!);
    expect(first.effectiveMoisture[dryTile]).toBe(Math.fround(baseMoisture));
    expect(first.effectiveMoisture[minorTile]).toBe(Math.fround(baseMoisture + 4));
    expect(first.effectiveMoisture[majorTile]).toBe(Math.fround(baseMoisture + 8));
    expect(first.effectiveMoisture[mixedTierTile]).toBe(Math.fround(baseMoisture + 8));
    expect(first.effectiveMoisture[waterTile]).toBe(0);
    expect(first.effectiveMoisture[saturatedTile]).toBe(497.5);
    const expectedPet = (18 + 75 * (20 / 35)) * (1 - 0.55 * surfaceWetness[dryTile]!);
    expect(input.pet[waterTile]).toBe(expectedPet);
    expect(first.pet[dryTile]).toBeCloseTo(expectedPet, 5);
    expect(first.aridityIndex[dryTile]).toBe(Math.fround(expectedPet / (expectedPet + 41.25)));
    expect(first.pet[minorTile]).toBe(first.pet[dryTile]);
    expect(first.pet[majorTile]).toBe(first.pet[dryTile]);
    expect(first.aridityIndex[minorTile]).toBe(first.aridityIndex[dryTile]);
    expect(first.aridityIndex[majorTile]).toBe(first.aridityIndex[dryTile]);
    expect(first.pet[waterTile]).toBe(0);
    expect(first.aridityIndex[waterTile]).toBe(0);
    expect(first.effectiveMoisture).toEqual(second.effectiveMoisture);
    expect(first.pet).toEqual(second.pet);
    expect(first.aridityIndex).toEqual(second.aridityIndex);
    expect(precipitation).toEqual(precipitationBefore);
    expect(surfaceWetness).toEqual(wetnessBefore);
    expect(riverClass).toEqual(riverClassBefore);
  });

  it("uses the wrapped Civ7 hex radius without admitting square-grid corner tiles", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const landMask = new Uint8Array(size).fill(1);
    const riverClass = new Uint8Array(size);
    const evenRowSource = indexOf(0, 2, width);
    const oddRowSource = indexOf(12, 7, width);
    riverClass[evenRowSource] = RIVER_CLASS_MAJOR;
    riverClass[oddRowSource] = RIVER_CLASS_MINOR;

    const result = computeLandWaterBudget.run(
      {
        width,
        height,
        landMask,
        precipitation: new Float32Array(size),
        surfaceWetness: new Float32Array(size),
        pet: new Array<number>(size).fill(0),
        riverClass,
      },
      strategy
    );

    const evenRowFootprint = [
      indexOf(0, 2, width),
      indexOf(width - 1, 2, width),
      indexOf(1, 2, width),
      indexOf(0, 1, width),
      indexOf(0, 3, width),
      indexOf(width - 1, 1, width),
      indexOf(width - 1, 3, width),
    ];
    const oddRowFootprint = [
      indexOf(12, 7, width),
      indexOf(11, 7, width),
      indexOf(13, 7, width),
      indexOf(12, 6, width),
      indexOf(12, 8, width),
      indexOf(13, 6, width),
      indexOf(13, 8, width),
    ];
    for (const tileIndex of evenRowFootprint) {
      expect(result.effectiveMoisture[tileIndex]).toBe(8);
    }
    for (const tileIndex of oddRowFootprint) {
      expect(result.effectiveMoisture[tileIndex]).toBe(4);
    }

    expect(result.effectiveMoisture[indexOf(1, 1, width)]).toBe(0);
    expect(result.effectiveMoisture[indexOf(1, 3, width)]).toBe(0);
    expect(result.effectiveMoisture[indexOf(11, 6, width)]).toBe(0);
    expect(result.effectiveMoisture[indexOf(11, 8, width)]).toBe(0);
    expect(result.effectiveMoisture[indexOf(width - 1, 2, width)]).toBe(8);
  });
});
