import { describe, expect, it } from "bun:test";
import { measureStandardRelief } from "../../../../../../src/recipes/standard/metrics/families/relief.js";
import { reliefCoherenceFixture } from "../../fixtures/relief-coherence.js";

function fixture(width = 6, height = 2) {
  const base = reliefCoherenceFixture(width, height);
  const size = width * height;
  return {
    ...base,
    model: {
      ...base.model,
      hillMask: new Uint8Array(size),
      mountainRegionMask: new Uint8Array(size),
      volcanoes: [],
    },
    observation: {
      ...base.observation,
      feature: new Int32Array(size).fill(-1),
      volcanoFeature: 9,
    },
  };
}

function certified(input: ReturnType<typeof fixture>) {
  const size = input.model.landMask.length;
  return {
    ...input,
    model: {
      ...input.model,
      physicalHydrology: {
        model: "certified-sill-spill" as const,
        runoff: Array<number>(size).fill(0),
        discharge: Array<number>(size).fill(0),
        bodyId: new Int32Array(size),
        waterSurface: new Int16Array(size),
        mouthBodyId: new Int32Array(size),
        bodies: [], certificates: [], marineExits: [],
        conservation: { dryRunoff: 0, wetPrecipitation: 0, wetDemand: 0, externalDischarge: 0, residual: 0, roundoffBound: 0 },
      },
    },
  };
}

const plannedCategories = ["plannedMountains", "plannedHills", "plannedFoothills", "plannedRoughLandHills", "plannedRoughTerrain"] as const;

describe("Standard planned relief surface population", () => {
  it("uses exposed land for every certified planned category, without changing geological or observed diagnostics", () => {
    const input = fixture();
    input.model.landMask[11] = 0;
    input.model.plannedLakeMask.set([1, 1, 1]);
    // A malformed wet mark on original marine terrain must not subtract land a second time.
    input.model.plannedLakeMask[11] = 1;
    input.model.mountainMask[3] = 1;
    input.model.hillMask.set([1, 1, 1], 4);
    input.model.foothillMask.set([1, 1], 4);
    input.model.roughLandMask[6] = 1;
    input.model.mountainRegionMask.fill(1, 0, 7);
    input.model.elevation[0] = 500;
    input.observation.terrain.set([1, 2, 2, 2], 3);
    input.observation.isWater.set([1, 1, 1]);
    input.observation.isWater[11] = 1;
    const beforeLand = Uint8Array.from(input.model.landMask);
    const beforeLakes = Uint8Array.from(input.model.plannedLakeMask);

    const legacy = measureStandardRelief(input);
    const result = measureStandardRelief(certified(input));
    for (const key of plannedCategories) {
      expect(legacy[key].population).toBe(11);
      expect(result[key].population).toBe(8);
      expect(result[key].count).toBe(legacy[key].count);
    }
    expect(plannedCategories.map((key) => result[key].count)).toEqual([1, 3, 2, 1, 4]);
    expect(result.mountainRegion).toEqual(legacy.mountainRegion);
    expect(result.mountainRegion.tiles).toBe(7);
    expect(result.finalLandElevation).toEqual(legacy.finalLandElevation);
    expect(result.finalLandElevation.maximum).toBe(500);
    expect(result.coherence.plannedLandTiles).toBe(11);
    for (const key of ["finalMountains", "finalNonVolcanoMountains", "finalHills", "finalRoughTerrain", "finalNonVolcanoRoughTerrain", "finalFlatTerrain"] as const) {
      expect(result[key]).toEqual(legacy[key]);
      expect(result[key].population).toBe(11);
    }
    expect(input.model.landMask).toEqual(beforeLand);
    expect(input.model.plannedLakeMask).toEqual(beforeLakes);
  });

  for (const { seed, originalLand, exposedLand, foothills, floor } of [
    { seed: 1018, originalLand: 2720, exposedLand: 2517, foothills: 317, floor: 0.12 },
    { seed: 7777, originalLand: 2656, exposedLand: 2484, foothills: 207, floor: 0.08 },
  ]) {
    it(`quantifies the seed ${seed} population correction without fitting counts or thresholds`, () => {
      const input = fixture(68, 40);
      input.model.landMask.fill(0, originalLand);
      input.observation.isWater.fill(1, originalLand);
      input.model.plannedLakeMask.fill(1, exposedLand, originalLand);
      input.model.foothillMask.fill(1, 0, foothills);
      input.model.hillMask.fill(1, 0, foothills);
      const legacy = measureStandardRelief(input).plannedFoothills;
      const result = measureStandardRelief(certified(input)).plannedFoothills;
      expect(legacy).toEqual({ count: foothills, population: originalLand });
      expect(result).toEqual({ count: foothills, population: exposedLand });
      expect(legacy.count / legacy.population!).toBeLessThan(floor);
      expect(result.count / result.population!).toBeGreaterThan(floor);
    });
  }

  it("leaves all legacy planned shares unchanged when lake intent changes", () => {
    const input = fixture();
    input.model.mountainMask[0] = 1;
    input.model.hillMask[1] = 1;
    input.model.foothillMask[1] = 1;
    const before = measureStandardRelief(input);
    input.model.plannedLakeMask.fill(1, 3, 8);
    const after = measureStandardRelief(input);
    for (const key of plannedCategories) expect(after[key]).toEqual(before[key]);
  });
});
