import { describe, expect, it } from "bun:test";
import {
  RIVER_CLASS_MAJOR,
  RIVER_CLASS_MINOR,
} from "../../../../../../src/domain/hydrology/modules/hydrography/model/policy/river-class.js";
import hydrology from "../../../../../../src/domain/hydrology/router.js";
import { TEST_MAP_SIZE } from "../../../../../setup.js";

const { computeLandWaterBudget } = hydrology.climate.ops;
const strategy = {
  strategy: "pet-aridity",
  config: {
    tMinC: 0,
    tMaxC: 35,
    petBase: 18,
    petTemperatureWeight: 75,
    humidityDampening: 0.55,
  },
} as const;

function indexOf(x: number, y: number, width: number): number {
  return y * width + x;
}

describe("hydrology/compute-land-water-budget riparian moisture", () => {
  it("orders major, minor, and dry land while keeping water outside the terrestrial budget", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const rainfall = new Uint8Array(size).fill(40);
    const humidity = new Uint8Array(size).fill(100);
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
    rainfall[saturatedTile] = 200;
    humidity[saturatedTile] = 255;

    const input = {
      width,
      height,
      landMask,
      rainfall,
      humidity,
      surfaceTemperatureC,
      riverClass,
    };
    const rainfallBefore = new Uint8Array(rainfall);
    const humidityBefore = new Uint8Array(humidity);
    const riverClassBefore = new Uint8Array(riverClass);
    const first = computeLandWaterBudget.run(input, strategy);
    const second = computeLandWaterBudget.run(input, strategy);

    expect(first.effectiveMoisture[dryTile]).toBeCloseTo(75, 5);
    expect(first.effectiveMoisture[minorTile]).toBeCloseTo(79, 5);
    expect(first.effectiveMoisture[majorTile]).toBeCloseTo(83, 5);
    expect(first.effectiveMoisture[mixedTierTile]).toBeCloseTo(83, 5);
    expect(first.effectiveMoisture[waterTile]).toBe(0);
    expect(first.effectiveMoisture[saturatedTile]).toBeCloseTo(297.25, 5);
    const expectedPet = (18 + 75 * (20 / 35)) * (1 - 0.55 * (100 / 255));
    expect(first.pet[dryTile]).toBeCloseTo(expectedPet, 5);
    expect(first.aridityIndex[dryTile]).toBeCloseTo(expectedPet / (expectedPet + 41), 5);
    expect(first.pet[minorTile]).toBe(first.pet[dryTile]);
    expect(first.pet[majorTile]).toBe(first.pet[dryTile]);
    expect(first.aridityIndex[minorTile]).toBe(first.aridityIndex[dryTile]);
    expect(first.aridityIndex[majorTile]).toBe(first.aridityIndex[dryTile]);
    expect(first.pet[waterTile]).toBe(0);
    expect(first.aridityIndex[waterTile]).toBe(0);
    expect(first.effectiveMoisture).toEqual(second.effectiveMoisture);
    expect(first.pet).toEqual(second.pet);
    expect(first.aridityIndex).toEqual(second.aridityIndex);
    expect(rainfall).toEqual(rainfallBefore);
    expect(humidity).toEqual(humidityBefore);
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
        rainfall: new Uint8Array(size),
        humidity: new Uint8Array(size),
        surfaceTemperatureC: new Float32Array(size),
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
