import { describe, expect, it } from "bun:test";
import hydrology from "../../../../../../src/domain/hydrology/router.js";
import { noLocalWaterSources } from "../../../../../fixtures/local-water-sources.js";

const { computeLandWaterBudget, computePotentialDemand } = hydrology.climate.ops;
const strategy = computeLandWaterBudget.defaultConfig;
const parameters = {
  tMinC: 0,
  tMaxC: 35,
  petBase: 18,
  petTemperatureWeight: 75,
  humidityDampening: 0.55,
} as const;

describe("hydrology/compute-land-water-budget effective moisture", () => {
  it("composes float precipitation and normalized wetness without changing demand or inputs", () => {
    const width = 6;
    const height = 1;
    const precipitation = new Float32Array([0, 40.125, 80, 200, 600.75, 40]);
    const surfaceWetness = Float32Array.from([0, 100, 200, 255, 255, 100], value => value / 255);
    const landMask = new Uint8Array([1, 1, 1, 0, 1, 1]);
    const input = {
      width,
      height,
      ...noLocalWaterSources(width, height),
      landMask,
      precipitation,
      surfaceWetness,
      pet: computePotentialDemand.run(
        {
          width,
          height,
          surfaceWetness,
          surfaceTemperatureC: new Float32Array([0, 20, 35, 20, 35, 20]),
          parameters,
        },
        computePotentialDemand.defaultConfig
      ).pet,
    };
    const before = structuredClone(input);
    const first = computeLandWaterBudget.run(input, strategy);
    const second = computeLandWaterBudget.run(input, strategy);

    expect(first.effectiveMoisture).toEqual(new Float32Array([0, 75.125, 150, 0, 690, 75]));
    expect(first.localSurfaceWaterOpportunity).toEqual(new Float32Array(width * height));
    for (const tileIndex of [0, 1, 2, 4, 5]) {
      const petValue = input.pet[tileIndex]!;
      expect(first.pet[tileIndex]).toBe(Math.fround(petValue));
      expect(first.aridityIndex[tileIndex]).toBe(
        Math.fround(petValue / (petValue + precipitation[tileIndex]! + 1))
      );
    }
    expect(input.pet[3]).toBeGreaterThan(0);
    expect(first.pet[3]).toBe(0);
    expect(first.aridityIndex[3]).toBe(0);
    expect(first.plantEffectiveMoisture).toEqual(first.effectiveMoisture);
    expect(first.plantWaterStress).toEqual(first.aridityIndex);
    expect(first).toEqual(second);
    expect(input).toEqual(before);
  });

  it("rejects retired river-class and byte quantity inputs rather than retaining ignored compatibility keys", () => {
    const input = {
      width: 1,
      height: 1,
      ...noLocalWaterSources(1, 1),
      landMask: new Uint8Array([1]),
      precipitation: new Float32Array([40]),
      surfaceWetness: Float32Array.of(100 / 255),
      pet: [50],
    };
    expect(computeLandWaterBudget.run(input, strategy).effectiveMoisture[0]).toBe(75);
    const obsoleteInput = { ...input, riverClass: new Uint8Array([2]) };
    expect(() => computeLandWaterBudget.run(obsoleteInput, strategy)).toThrow();
    for (const retired of [{ rainfall: new Uint8Array([40]) }, { humidity: new Uint8Array([100]) }]) {
      expect(() => computeLandWaterBudget.run({ ...input, ...retired }, strategy)).toThrow();
    }
  });

  it("rejects misaligned or invalid atmospheric quantities on both land and water before deriving plant indices", () => {
    const input = {
      width: 2,
      height: 1,
      ...noLocalWaterSources(2, 1),
      landMask: Uint8Array.of(1, 0),
      precipitation: Float32Array.of(40.125, 600.75),
      surfaceWetness: Float32Array.of(0.25, 1),
      pet: [50, 60],
    };
    const before = structuredClone(input);
    for (const key of ["precipitation", "surfaceWetness"] as const) {
      expect(() => computeLandWaterBudget.run({ ...input, [key]: input[key].slice(1) }, strategy)).toThrow();
    }
    for (const cell of [0, 1]) {
      for (const value of [-1, NaN, Infinity]) {
        const precipitation = input.precipitation.slice();
        precipitation[cell] = value;
        expect(() => computeLandWaterBudget.run({ ...input, precipitation }, strategy)).toThrow("precipitation");
      }
      for (const value of [-0.1, 128, NaN, Infinity]) {
        const surfaceWetness = input.surfaceWetness.slice();
        surfaceWetness[cell] = value;
        expect(() => computeLandWaterBudget.run({ ...input, surfaceWetness }, strategy)).toThrow("surface wetness");
      }
    }
    expect(input).toEqual(before);
  });
});
