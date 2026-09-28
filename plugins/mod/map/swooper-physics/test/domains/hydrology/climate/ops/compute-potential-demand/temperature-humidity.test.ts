import { describe, expect, it } from "bun:test";
import { Value } from "typebox/value";
import {
  type PotentialDemandParameters,
  PotentialDemandParametersSchema,
} from "../../../../../../src/domain/hydrology/modules/climate/model/atoms/potential-demand.schema.js";
import hydrology from "../../../../../../src/domain/hydrology/router.js";

const { computePotentialDemand, computeLandWaterBudget } = hydrology.climate.ops;
const defaults = Value.Create(PotentialDemandParametersSchema);

function fixture(parameters: PotentialDemandParameters = defaults) {
  const width = 256;
  const height = 2;
  const size = width * height;
  return {
    width,
    height,
    landMask: Uint8Array.from({ length: size }, (_, i) => (i % 13 === 0 ? 0 : 1)),
    surfaceTemperatureC: Float32Array.from({ length: size }, (_, i) => -60 + i / 3),
    humidity: Uint8Array.from({ length: size }, (_, i) => i % 256),
    parameters,
  };
}

describe("hydrology/compute-potential-demand", () => {
  it("owns the former five defaults in one shared Climate schema", () => {
    expect(defaults).toEqual({
      tMinC: 0,
      tMaxC: 35,
      petBase: 18,
      petTemperatureWeight: 75,
      humidityDampening: 0.55,
    });
    expect(computePotentialDemand.defaultConfig.config).toEqual({});
    expect(computeLandWaterBudget.defaultConfig.config).toEqual({});
  });

  it("exactly preserves former refined PET and aridity without rounding demand early", () => {
    const calibrations: PotentialDemandParameters[] = [
      defaults,
      { tMinC: 0, tMaxC: 36, petBase: 19, petTemperatureWeight: 82, humidityDampening: 0.5 },
      { ...defaults, petBase: 40, petTemperatureWeight: 140, humidityDampening: 0.45 },
      { ...defaults, tMinC: 10, tMaxC: 10 },
      { ...defaults, tMinC: 20, tMaxC: -10 },
      { ...defaults, petBase: 0, petTemperatureWeight: 0 },
    ];
    let earlyRoundingDifferences = 0;
    for (const parameters of calibrations) {
      const input = fixture(parameters);
      const before = structuredClone(input);
      const demand = computePotentialDemand.run(input, computePotentialDemand.defaultConfig);
      const size = input.width * input.height;
      const rainfall = Uint8Array.from({ length: size }, (_, i) => i % 201);
      const expectedPet = new Float32Array(size);
      const expectedAridity = new Float32Array(size);
      const expectedMoisture = new Float32Array(size);
      const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
      for (let i = 0; i < size; i++) {
        if (input.landMask[i] !== 1) {
          expect(demand.pet[i]).toBe(0);
          continue;
        }
        // Frozen reference arithmetic from the original combined land-water budget.
        const tMax = Math.max(parameters.tMinC + 1e-6, parameters.tMaxC);
        const range = tMax - parameters.tMinC;
        const temperature = input.surfaceTemperatureC[i]!;
        const tempFactor =
          Math.abs(range) < 1e-6
            ? temperature >= tMax
              ? 1
              : 0
            : clamp01((temperature - parameters.tMinC) / range);
        const damp = 1 - parameters.humidityDampening * clamp01(input.humidity[i]! / 255);
        const petValue =
          (parameters.petBase + parameters.petTemperatureWeight * tempFactor) * clamp01(damp);
        expect(demand.pet[i]).toBe(petValue);
        expectedPet[i] = petValue;
        const denominator = petValue + rainfall[i]! + 1;
        expectedAridity[i] = denominator <= 0 ? 0 : clamp01(petValue / denominator);
        expectedMoisture[i] = rainfall[i]! + 0.35 * input.humidity[i]!;
        const roundedPet = Math.fround(petValue);
        if (Math.fround(roundedPet / (roundedPet + rainfall[i]! + 1)) !== expectedAridity[i]) {
          earlyRoundingDifferences++;
        }
      }
      const budget = computeLandWaterBudget.run(
        {
          width: input.width,
          height: input.height,
          landMask: input.landMask,
          humidity: input.humidity,
          rainfall,
          pet: demand.pet,
          riverClass: new Uint8Array(size),
        },
        computeLandWaterBudget.defaultConfig
      );
      expect(budget.pet).toEqual(expectedPet);
      expect(budget.aridityIndex).toEqual(expectedAridity);
      expect(budget.effectiveMoisture).toEqual(expectedMoisture);
      expect(input).toEqual(before);
    }
    expect(earlyRoundingDifferences).toBeGreaterThan(0);
  });

  it("admits calibration and grid cardinality before evaluation", () => {
    const input = fixture();
    expect(() =>
      computePotentialDemand.run(
        { ...input, parameters: { ...defaults, humidityDampening: 1.01 } },
        computePotentialDemand.defaultConfig
      )
    ).toThrow();
    expect(() =>
      computePotentialDemand.run(
        { ...input, humidity: new Uint8Array(1) },
        computePotentialDemand.defaultConfig
      )
    ).toThrow();
    expect(() =>
      computeLandWaterBudget.run(
        {
          width: input.width,
          height: input.height,
          landMask: input.landMask,
          humidity: input.humidity,
          rainfall: new Uint8Array(input.width * input.height),
          pet: [1],
          riverClass: new Uint8Array(input.width * input.height),
        },
        computeLandWaterBudget.defaultConfig
      )
    ).toThrow("potential-demand samples");
  });

  it("rejects non-finite land temperatures instead of publishing invalid forcing", () => {
    for (const sample of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      const input = fixture();
      input.surfaceTemperatureC[1] = sample;
      expect(() => computePotentialDemand.run(input, computePotentialDemand.defaultConfig)).toThrow(
        "finite potential-demand temperature at land tile 1"
      );
    }
  });
});
