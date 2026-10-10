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
  it("composes rainfall and humidity on exposed land without changing demand or inputs", () => {
    const width = 6;
    const height = 1;
    const rainfall = new Uint8Array([0, 40, 80, 200, 200, 40]);
    const humidity = new Uint8Array([0, 100, 200, 255, 255, 100]);
    const landMask = new Uint8Array([1, 1, 1, 0, 1, 1]);
    const input = {
      width,
      height,
      ...noLocalWaterSources(width, height),
      landMask,
      rainfall,
      humidity,
      pet: computePotentialDemand.run(
        {
          width,
          height,
          humidity,
          surfaceTemperatureC: new Float32Array([0, 20, 35, 20, 35, 20]),
          parameters,
        },
        computePotentialDemand.defaultConfig
      ).pet,
    };
    const before = structuredClone(input);
    const first = computeLandWaterBudget.run(input, strategy);
    const second = computeLandWaterBudget.run(input, strategy);

    expect(first.effectiveMoisture).toEqual(new Float32Array([0, 75, 150, 0, 289.25, 75]));
    for (const tileIndex of [0, 1, 2, 4, 5]) {
      const petValue = input.pet[tileIndex]!;
      expect(first.pet[tileIndex]).toBe(Math.fround(petValue));
      expect(first.aridityIndex[tileIndex]).toBe(
        Math.fround(petValue / (petValue + rainfall[tileIndex]! + 1))
      );
    }
    expect(input.pet[3]).toBeGreaterThan(0);
    expect(first.pet[3]).toBe(0);
    expect(first.aridityIndex[3]).toBe(0);
    expect(first).toEqual(second);
    expect(input).toEqual(before);
  });

  it("rejects the retired river-class input rather than retaining an ignored compatibility key", () => {
    const input = {
      width: 1,
      height: 1,
      ...noLocalWaterSources(1, 1),
      landMask: new Uint8Array([1]),
      rainfall: new Uint8Array([40]),
      humidity: new Uint8Array([100]),
      pet: [50],
    };
    expect(computeLandWaterBudget.run(input, strategy).effectiveMoisture[0]).toBe(75);
    const obsoleteInput = { ...input, riverClass: new Uint8Array([2]) };
    expect(() => computeLandWaterBudget.run(obsoleteInput, strategy)).toThrow();
  });
});
