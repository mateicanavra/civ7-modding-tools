import { describe, expect, it } from "bun:test";
import { normalizeOperationSelectionForTest } from "@swooper/mapgen-core/testing";
import { BIOME_SYMBOL_TO_INDEX } from "../../../../../../src/domain/ecology/index.js";
import ecology from "../../../../../../src/domain/ecology/router.js";

const planner = ecology.features.ops.planVegetation;

function sagebrushInput() {
  return {
    width: 1,
    height: 1,
    seed: 1,
    scoreForest01: new Float32Array(1),
    scoreRainforest01: new Float32Array(1),
    scoreTaiga01: new Float32Array(1),
    scoreSavannaWoodland01: new Float32Array(1),
    scoreSagebrushSteppe01: new Float32Array([1]),
    landMask: new Uint8Array([1]),
    flatLandMask: new Uint8Array([1]),
    biomeIndex: new Uint8Array([BIOME_SYMBOL_TO_INDEX.desert]),
    surfaceTemperature: new Float32Array([20]),
    // Enriched moisture is deliberately not a substitute for annual P + O.
    plantEffectiveMoisture: new Float32Array([1000]),
    climaticAridityIndex: new Float32Array([0.8]),
    precipitation: new Float32Array([2]),
    pet: new Float32Array([10]),
    localSurfaceWaterOpportunity: new Float32Array(1),
    vegetationDensity: new Float32Array([0.25]),
    featureOccupancyMask: new Uint8Array(1),
  };
}

function selectionWithRatio(ratio: number) {
  return normalizeOperationSelectionForTest(planner, {
    ...planner.defaultConfig,
    config: {
      ...planner.defaultConfig.config,
      sagebrushSteppeMinAnnualWaterOpportunityRatio: ratio,
    },
  });
}

const sagebrushIntent = [{ x: 0, y: 0, feature: "sagebrush-steppe" as const }];

describe("sagebrush annual community support", () => {
  it.each([
    { name: "zero opportunity at zero demand", p: 0, o: 0, d: 0, growth: 0.25, admitted: false },
    { name: "zero opportunity at positive demand", p: 0, o: 0, d: 10, growth: 0.25, admitted: false },
    { name: "exact atmospheric equality", p: 1, o: 0, d: 10, growth: 0.25, admitted: false },
    { name: "just below equality", p: 1 - 2 ** -24, o: 0, d: 10, growth: 0.25, admitted: false },
    { name: "just above equality", p: 1 + 2 ** -23, o: 0, d: 10, growth: 0.25, admitted: true },
    { name: "exact combined equality", p: 0.5, o: 0.5, d: 10, growth: 0.25, admitted: false },
    { name: "local-water relief", p: 0.5, o: 0.5 + 2 ** -24, d: 10, growth: 0.25, admitted: true },
    { name: "positive atmospheric opportunity at zero demand", p: 2 ** -149, o: 0, d: 0, growth: 0.25, admitted: true },
    { name: "positive local opportunity at zero demand", p: 0, o: 2 ** -149, d: 0, growth: 0.25, admitted: true },
    { name: "zero generic growth despite ample opportunity", p: 120, o: 100, d: 10, growth: 0, admitted: false },
    { name: "positive Float32 generic growth", p: 120, o: 0, d: 10, growth: 2 ** -149, admitted: true },
  ])("$name", ({ p, o, d, growth, admitted }) => {
    const input = sagebrushInput();
    input.precipitation[0] = p;
    input.localSurfaceWaterOpportunity[0] = o;
    input.pet[0] = d;
    input.vegetationDensity[0] = growth;
    const before = structuredClone(input);

    expect(planner.defaultConfig.config.sagebrushSteppeMinAnnualWaterOpportunityRatio).toBe(0.1);
    expect(planner.run(input, planner.defaultConfig).placements).toEqual(admitted ? sagebrushIntent : []);
    expect(input).toEqual(before);
  });

  it("responds monotonically to local opportunity, demand and the authored ratio", () => {
    const input = sagebrushInput();
    input.precipitation[0] = 0.5;
    const opportunityResults = [0, 0.5, 0.5 + 2 ** -24, 1, 2].map((value) => {
      input.localSurfaceWaterOpportunity[0] = value;
      return planner.run(input, planner.defaultConfig).placements.length;
    });
    expect(opportunityResults).toEqual([0, 0, 1, 1, 1]);

    input.precipitation[0] = 1;
    input.localSurfaceWaterOpportunity[0] = 0;
    const demandResults = [0, 5, 10 - 2 ** -20, 10, 20].map((value) => {
      input.pet[0] = value;
      return planner.run(input, planner.defaultConfig).placements.length;
    });
    expect(demandResults).toEqual([1, 1, 1, 0, 0]);

    input.pet[0] = 10;
    expect([0.05, 0.1, 0.2].map((ratio) => planner.run(input, selectionWithRatio(ratio)).placements.length))
      .toEqual([1, 0, 0]);
  });

  it.each([
    "zero-score", "below-confidence", "incompatible-biome", "too-hot", "too-cold",
    "closed-growth", "occupied", "nonflat", "water",
  ])("local opportunity cannot rescue %s", (failure) => {
    const input = sagebrushInput();
    input.precipitation[0] = 0;
    input.localSurfaceWaterOpportunity[0] = 1000;
    if (failure === "zero-score") input.scoreSagebrushSteppe01[0] = 0;
    if (failure === "below-confidence") input.scoreSagebrushSteppe01[0] = 0.01;
    if (failure === "incompatible-biome") input.biomeIndex[0] = BIOME_SYMBOL_TO_INDEX.temperateHumid;
    if (failure === "too-hot") input.surfaceTemperature[0] = 33;
    if (failure === "too-cold") input.surfaceTemperature[0] = -13;
    if (failure === "closed-growth") input.vegetationDensity[0] = 0.8;
    if (failure === "occupied") input.featureOccupancyMask[0] = 1;
    if (failure === "nonflat") input.flatLandMask[0] = 0;
    if (failure === "water") input.landMask[0] = 0;

    const selection = failure === "zero-score"
      ? normalizeOperationSelectionForTest(planner, {
          ...planner.defaultConfig,
          config: { ...planner.defaultConfig.config, sagebrushSteppeMinConfidence01: 0 },
        })
      : planner.defaultConfig;
    expect(planner.run(input, selection).placements).toEqual([]);
  });

  it.each([
    { feature: "forest", score: "scoreForest01", biome: BIOME_SYMBOL_TO_INDEX.temperateHumid },
    { feature: "rainforest", score: "scoreRainforest01", biome: BIOME_SYMBOL_TO_INDEX.tropicalRainforest },
    { feature: "taiga", score: "scoreTaiga01", biome: BIOME_SYMBOL_TO_INDEX.boreal },
    { feature: "savanna-woodland", score: "scoreSavannaWoodland01", biome: BIOME_SYMBOL_TO_INDEX.tropicalSeasonal },
  ] as const)("leaves $feature intent unchanged by the sagebrush support gate", ({ feature, score, biome }) => {
    const input = sagebrushInput();
    input.biomeIndex[0] = biome;
    input[score][0] = 1;
    const expected = [{ x: 0, y: 0, feature }];
    expect(planner.run(input, planner.defaultConfig).placements).toEqual(expected);
    input.precipitation[0] = 0;
    input.localSurfaceWaterOpportunity[0] = 0;
    expect(planner.run(input, selectionWithRatio(100)).placements).toEqual(expected);
  });

  for (const field of ["precipitation", "pet", "localSurfaceWaterOpportunity", "vegetationDensity"] as const) {
    it.each([-1, NaN, Infinity, -Infinity])(`rejects invalid ${field} %s even on unavailable land`, (value) => {
      const input = sagebrushInput();
      input[field][0] = value;
      input.landMask[0] = 0;
      expect(() => planner.run(input, planner.defaultConfig)).toThrow(`finite nonnegative ${field} at 0`);
    });
  }

  it.each([0, -0.1, NaN, Infinity, -Infinity])("rejects invalid authored ratio %s", (ratio) => {
    expect(() => selectionWithRatio(ratio)).toThrow();
    // Direct source callers also fail rather than turning invalid policy into empty intent.
    expect(() => planner.run(sagebrushInput(), {
      ...planner.defaultConfig,
      config: { ...planner.defaultConfig.config, sagebrushSteppeMinAnnualWaterOpportunityRatio: ratio },
    })).toThrow("finite positive sagebrush minimum annual water-opportunity ratio");
  });

  it("rejects overflow of scaled annual demand even when authored ratio and demand are finite", () => {
    const input = sagebrushInput();
    input.pet[0] = 2;
    expect(() => planner.run(input, selectionWithRatio(Number.MAX_VALUE)))
      .toThrow("finite derived sagebrush annual support quantities at 0");
  });

  for (const field of ["precipitation", "pet", "localSurfaceWaterOpportunity"] as const) {
    it(`requires the exact ${field} Float32 grid without a legacy fallback`, () => {
      const input = sagebrushInput();
      const { [field]: omitted, ...missing } = input;
      void omitted;
      // @ts-expect-error Annual support inputs are required at the public boundary.
      expect(() => planner.run(missing, planner.defaultConfig)).toThrow();
      expect(() => planner.run({ ...input, [field]: new Float32Array(2) }, planner.defaultConfig)).toThrow();
      const wrongConstructor = { ...input };
      // @ts-expect-error Exact Float32 observations cannot be replaced by an integer codec.
      wrongConstructor[field] = new Uint8Array(1);
      expect(() => planner.run(wrongConstructor, planner.defaultConfig)).toThrow();
    });
  }
});
