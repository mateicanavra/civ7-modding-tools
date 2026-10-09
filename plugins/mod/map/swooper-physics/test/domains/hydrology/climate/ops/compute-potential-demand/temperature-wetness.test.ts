import { describe, expect, it } from "bun:test";
import { Value } from "typebox/value";
import hydrology from "../../../../../../src/domain/hydrology/router.js";

const { computePotentialDemand, computeLandWaterBudget } = hydrology.climate.ops;
type PotentialDemandParameters = Parameters<typeof computePotentialDemand.run>[0]["parameters"];
const defaults = Value.Create(computePotentialDemand.input.properties.parameters);

function fixture(parameters: PotentialDemandParameters = defaults) {
  const width = 256;
  const height = 2;
  const size = width * height;
  return {
    width,
    height,
    surfaceTemperatureC: Float32Array.from({ length: size }, (_, i) => -60 + i / 3),
    surfaceWetness: Float32Array.from({ length: size }, (_, i) => (i % 256) / 255),
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
      wetnessDampening: 0.55,
    });
    expect(computePotentialDemand.defaultConfig.config).toEqual({});
    expect(computeLandWaterBudget.defaultConfig.config).toEqual({});
  });

  it("preserves the demand and aridity law on float wetness without rounding demand early", () => {
    const calibrations: PotentialDemandParameters[] = [
      defaults,
      { tMinC: 0, tMaxC: 36, petBase: 19, petTemperatureWeight: 82, wetnessDampening: 0.5 },
      { ...defaults, petBase: 40, petTemperatureWeight: 140, wetnessDampening: 0.45 },
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
      const landMask = Uint8Array.from({ length: size }, (_, i) => (i % 13 === 0 ? 0 : 1));
      const precipitation = Float32Array.from({ length: size }, (_, i) => (i % 401) + 0.25);
      const expectedPet = new Float32Array(size);
      const expectedAridity = new Float32Array(size);
      const expectedMoisture = new Float32Array(size);
      const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
      for (let i = 0; i < size; i++) {
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
        const damp = 1 - parameters.wetnessDampening * clamp01(input.surfaceWetness[i]!);
        const petValue =
          (parameters.petBase + parameters.petTemperatureWeight * tempFactor) * clamp01(damp);
        expect(demand.pet[i]).toBe(petValue);
        if (landMask[i] !== 1) continue;
        expectedPet[i] = petValue;
        const denominator = petValue + precipitation[i]! + 1;
        expectedAridity[i] = denominator <= 0 ? 0 : clamp01(petValue / denominator);
        expectedMoisture[i] = precipitation[i]! + 0.35 * (255 * input.surfaceWetness[i]!);
        const roundedPet = Math.fround(petValue);
        if (Math.fround(roundedPet / (roundedPet + precipitation[i]! + 1)) !== expectedAridity[i]) {
          earlyRoundingDifferences++;
        }
      }
      const budget = computeLandWaterBudget.run(
        {
          width: input.width,
          height: input.height,
          landMask,
          surfaceWetness: input.surfaceWetness,
          precipitation,
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
        { ...input, parameters: { ...defaults, wetnessDampening: 1.01 } },
        computePotentialDemand.defaultConfig
      )
    ).toThrow();
    expect(() =>
      computePotentialDemand.run(
        { ...input, surfaceWetness: new Float32Array(1) },
        computePotentialDemand.defaultConfig
      )
    ).toThrow();
    expect(() =>
      computeLandWaterBudget.run(
        {
          width: input.width,
          height: input.height,
          landMask: new Uint8Array(input.width * input.height).fill(1),
          surfaceWetness: input.surfaceWetness,
          precipitation: new Float32Array(input.width * input.height),
          pet: [1],
          riverClass: new Uint8Array(input.width * input.height),
        },
        computeLandWaterBudget.defaultConfig
      )
    ).toThrow("potential-demand samples");
  });

  it("evaluates the unchanged demand law on every surface without a land mask", () => {
    const input = {
      width: 3,
      height: 1,
      surfaceTemperatureC: new Float32Array([0, 17.5, 35]),
      surfaceWetness: new Float32Array([0, 0.5, 1]),
      parameters: defaults,
    };
    const demand = computePotentialDemand.run(input, computePotentialDemand.defaultConfig);
    expect(demand.pet).toEqual([
      defaults.petBase,
      (defaults.petBase + defaults.petTemperatureWeight * 0.5) *
        (1 - defaults.wetnessDampening * 0.5),
      (defaults.petBase + defaults.petTemperatureWeight) * (1 - defaults.wetnessDampening),
    ]);
    const obsoleteInput = { ...input, landMask: new Uint8Array(3) };
    expect(() => computePotentialDemand.run(obsoleteInput, computePotentialDemand.defaultConfig)).toThrow();
  });

  it("rejects non-finite temperatures on any surface instead of publishing invalid forcing", () => {
    for (const sample of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      const input = fixture();
      input.surfaceTemperatureC[0] = sample;
      expect(() => computePotentialDemand.run(input, computePotentialDemand.defaultConfig)).toThrow(
        "finite potential-demand temperature at tile 0"
      );
    }
  });

  it("refuses invalid float wetness and the retired humidity calibration key", () => {
    for (const wetness of [NaN, Infinity, -0.01, 1.01]) {
      const input = fixture();
      input.surfaceWetness[0] = wetness;
      expect(() => computePotentialDemand.run(input, computePotentialDemand.defaultConfig)).toThrow("surface wetness");
    }
    const input = fixture();
    const retired = { ...input, parameters: { ...defaults, humidityDampening: 0.55 } };
    expect(() => computePotentialDemand.run(retired, computePotentialDemand.defaultConfig)).toThrow();
  });
});
