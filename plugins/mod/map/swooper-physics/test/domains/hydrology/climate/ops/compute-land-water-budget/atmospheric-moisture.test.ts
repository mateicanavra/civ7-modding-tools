import { describe, expect, it } from "bun:test";
import hydrology from "../../../../../../src/domain/hydrology/router.js";
import { TEST_MAP_SIZE } from "../../../../../setup.js";

const { computeLandWaterBudget, computePotentialDemand } = hydrology.climate.ops;
const strategy = computeLandWaterBudget.defaultConfig;
const parameters = {
  tMinC: 0,
  tMaxC: 35,
  petBase: 18,
  petTemperatureWeight: 75,
  humidityDampening: 0.55,
} as const;

describe("hydrology/compute-land-water-budget atmospheric moisture", () => {
  it("uses only local rainfall and humidity while keeping water outside the terrestrial budget", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const rainfall = new Uint8Array(size).fill(40);
    const humidity = new Uint8Array(size).fill(100);
    const surfaceTemperatureC = new Float32Array(size).fill(20);
    const landMask = new Uint8Array(size).fill(1);
    const waterTile = Math.floor(size / 2);
    const saturatedTile = size - 1;
    landMask[waterTile] = 0;
    rainfall[saturatedTile] = 200;
    humidity[saturatedTile] = 255;

    const input = {
      width,
      height,
      landMask,
      rainfall,
      humidity,
      pet: computePotentialDemand.run(
        { width, height, humidity, surfaceTemperatureC, parameters },
        computePotentialDemand.defaultConfig
      ).pet,
    };
    const before = structuredClone(input);
    const first = computeLandWaterBudget.run(input, strategy);
    const second = computeLandWaterBudget.run(input, strategy);

    for (let tile = 0; tile < size; tile++) {
      const exposed = landMask[tile] === 1;
      expect(first.effectiveMoisture[tile]).toBe(
        exposed ? Math.fround(rainfall[tile]! + 0.35 * humidity[tile]!) : 0
      );
      expect(first.pet[tile]).toBe(exposed ? Math.fround(input.pet[tile]!) : 0);
      expect(first.aridityIndex[tile]).toBe(
        exposed ? Math.fround(input.pet[tile]! / (input.pet[tile]! + rainfall[tile]! + 1)) : 0
      );
    }
    const expectedPet = (18 + 75 * (20 / 35)) * (1 - 0.55 * (100 / 255));
    expect(input.pet[waterTile]).toBe(expectedPet);
    expect(first.effectiveMoisture[0]).toBe(75);
    expect(first.effectiveMoisture[saturatedTile]).toBe(289.25);
    expect(first).toEqual(second);
    expect(input).toEqual(before);
  });

  it("refuses the retired river hierarchy input instead of retaining a bonus lane", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const input = {
      width,
      height,
      landMask: new Uint8Array(size).fill(1),
      rainfall: new Uint8Array(size).fill(40),
      humidity: new Uint8Array(size).fill(100),
      pet: new Array<number>(size).fill(50),
    };
    for (const riverTier of [0, 1, 2, 3]) {
      const obsoleteInput = { ...input, riverClass: new Uint8Array(size).fill(riverTier) };
      expect(() => computeLandWaterBudget.run(
        obsoleteInput,
        strategy
      )).toThrow();
    }
    expect(computeLandWaterBudget.run(input, strategy).effectiveMoisture).toEqual(
      new Float32Array(size).fill(75)
    );
  });
});
