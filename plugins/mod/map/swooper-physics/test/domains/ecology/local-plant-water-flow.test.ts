import { describe, expect, it } from "bun:test";
import { getEngineFeatureLegality } from "@civ7/map-policy";
import { BIOME_SYMBOL_TO_INDEX, biomeSymbolFromIndex } from "../../../src/domain/ecology/index.js";
import ecology from "../../../src/domain/ecology/router.js";
import hydrology from "../../../src/domain/hydrology/router.js";
import { SWOOPER_LAND_BIOME_PROJECTION } from "../../../src/recipes/standard/stages/ecology/model/policy/biome-projection.js";
import { resolveFeatureKeyForIntent } from "../../../src/recipes/standard/stages/ecology/model/policy/feature-projection.js";
import { noLocalWaterSources } from "../../fixtures/local-water-sources.js";

const { classifyBiomes } = ecology.biomes.ops;
const features = ecology.features.ops;
function climate(temperature = 20, moisture = 70, aridity = 0.6) {
  return {
    width: 1, height: 1,
    landMask: new Uint8Array([1]),
    effectiveMoisture: new Float32Array([moisture]),
    aridityIndex: new Float32Array([aridity]),
    plantEffectiveMoisture: new Float32Array([moisture]),
    plantWaterStress: new Float32Array([aridity]),
    surfaceTemperatureC: new Float32Array([temperature]),
    freezeIndex: new Float32Array([0.05]),
    permafrost01: new Float32Array([0]),
    soilType: new Uint8Array([2]),
    fertility: new Float32Array([0.6]),
  };
}
function substrate(input: ReturnType<typeof climate>, vegetationDensity = new Float32Array([0.2])) {
  return features.computeVegetationSubstrate.run({
    width: input.width, height: input.height,
    landMask: input.landMask,
    effectiveMoisture: input.effectiveMoisture,
    aridityIndex: input.aridityIndex,
    plantEffectiveMoisture: input.plantEffectiveMoisture,
    plantWaterStress: input.plantWaterStress,
    surfaceTemperature: input.surfaceTemperatureC,
    freezeIndex: input.freezeIndex,
    vegetationDensity,
    fertility: input.fertility,
  }, features.computeVegetationSubstrate.defaultConfig);
}

describe("plant water and climatic habitat meanings", () => {
  it("uses plant moisture for jungle growth while preserving its heat, density, biome and land gates", () => {
    const operation = ecology.plotEffects.ops.scorePlotEffectsJungle;
    const input = {
      width: 1, height: 1, landMask: new Uint8Array([1]),
      biomeIndex: new Uint8Array([BIOME_SYMBOL_TO_INDEX.tropicalRainforest]),
      vegetationDensity: new Float32Array([1]), surfaceTemperature: new Float32Array([35]),
      plantEffectiveMoisture: new Float32Array([500]),
    };
    const run = () => operation.run(input, operation.defaultConfig);
    const supported = run();
    expect(supported.eligibleMask[0]).toBe(1);
    expect(supported.score01[0]).toBeGreaterThan(0);
    input.plantEffectiveMoisture.fill(0);
    expect(run().eligibleMask[0]).toBe(0);
    input.plantEffectiveMoisture.fill(500);
    input.surfaceTemperature.fill(-5);
    expect(run().eligibleMask[0]).toBe(0);
    input.surfaceTemperature.fill(35);
    input.vegetationDensity.fill(0);
    expect(run().eligibleMask[0]).toBe(0);
    input.vegetationDensity.fill(1);
    input.biomeIndex.fill(BIOME_SYMBOL_TO_INDEX.desert);
    expect(run().eligibleMask[0]).toBe(0);
    input.biomeIndex.fill(BIOME_SYMBOL_TO_INDEX.tropicalRainforest);
    input.landMask.fill(0);
    expect(run().eligibleMask[0]).toBe(0);
  });

  it.each([30, 70, 130, 230])("holds polar lookup wetness and dry shifts at atmospheric moisture %i", (moisture) => {
    const input = climate(-5, moisture, 0.6);
    const baseline = classifyBiomes.run(input, classifyBiomes.defaultConfig);
    input.plantEffectiveMoisture.fill(1000);
    input.plantWaterStress.fill(0);
    const supported = classifyBiomes.run(input, classifyBiomes.defaultConfig);
    expect(supported.biomeIndex).toEqual(baseline.biomeIndex);
    expect(supported.effectiveMoisture).toEqual(input.effectiveMoisture);
    expect(supported.aridityIndex).toEqual(input.aridityIndex);
  });

  it.each([22.9, 23.5, 24, 24.5, 25.1])("holds tropical transition context at %f C while plant moisture can change the category", (temperature) => {
    const input = climate(temperature, 70, 0);
    input.plantEffectiveMoisture.fill(110);
    const seasonal = classifyBiomes.run(input, classifyBiomes.defaultConfig);
    input.plantEffectiveMoisture.fill(300);
    const supported = classifyBiomes.run(input, classifyBiomes.defaultConfig);
    // Atmospheric dryness keeps the thermal transition temperate over this complete band.
    expect(biomeSymbolFromIndex(seasonal.biomeIndex[0]!)).toBe("temperateHumid");
    expect(biomeSymbolFromIndex(supported.biomeIndex[0]!)).toBe("temperateHumid");
    expect(supported.vegetationDensity[0]).toBeGreaterThan(seasonal.vegetationDensity[0]!);
    expect(supported.surfaceTemperature).toEqual(seasonal.surfaceTemperature);
  });

  it("uses plant moisture/stress for nonpolar category and density without changing atmosphere, energy, freeze or soil", () => {
    const input = climate();
    const before = structuredClone(input);
    const baseline = classifyBiomes.run(input, classifyBiomes.defaultConfig);
    const supportedInput = { ...input, plantEffectiveMoisture: new Float32Array([230]), plantWaterStress: new Float32Array([0.1]) };
    const supported = classifyBiomes.run(supportedInput, classifyBiomes.defaultConfig);
    expect(biomeSymbolFromIndex(baseline.biomeIndex[0]!)).toBe("desert");
    expect(biomeSymbolFromIndex(supported.biomeIndex[0]!)).toBe("temperateHumid");
    expect(supported.vegetationDensity[0]).toBeGreaterThan(baseline.vegetationDensity[0]!);
    expect(supported.effectiveMoisture).toEqual(baseline.effectiveMoisture);
    expect(supported.aridityIndex).toEqual(baseline.aridityIndex);
    expect(supported.surfaceTemperature).toEqual(baseline.surfaceTemperature);
    expect(supported.freezeIndex).toEqual(baseline.freezeIndex);
    expect(input).toEqual(before);
  });

  it("keeps taiga's atmospheric upper-water habitat band while relieving plant growth stress", () => {
    const input = climate(-3, 115, 0.6);
    input.freezeIndex.fill(0.65);
    const baseline = substrate(input);
    input.plantEffectiveMoisture.fill(1000);
    input.plantWaterStress.fill(0.1);
    const supported = substrate(input);
    const score = (fields: ReturnType<typeof substrate>) => features.scoreVegetationTaiga.run({
      width: 1, height: 1, landMask: input.landMask,
      energy01: fields.energy01,
      atmosphericWater01: fields.atmosphericWater01,
      plantWaterStress01: fields.plantWaterStress01,
      coldStress01: fields.coldStress01,
      biomass01: fields.biomass01,
      fertility01: fields.fertility01,
    }, features.scoreVegetationTaiga.defaultConfig).score01[0]!;
    expect(supported.plantWater01[0]).toBe(1);
    expect(supported.atmosphericWater01[0]).toBe(0.5);
    expect(supported.climaticAridity01).toEqual(baseline.climaticAridity01);
    expect(score(supported)).toBeGreaterThan(score(baseline));
    expect(score(supported)).toBeGreaterThan(0);
    expect(score({ ...supported, atmosphericWater01: supported.plantWater01 })).toBe(0);
  });

  it("retains savanna climatic dry-season context with monotone plant support, and steppe climatic bands with plant biomass", () => {
    const input = climate(28, 46, 0.55);
    const baseline = substrate(input);
    input.plantEffectiveMoisture.fill(1000);
    input.plantWaterStress.fill(0.01);
    const supported = substrate(input);
    const growth = {
      width: 1, height: 1, landMask: input.landMask,
      energy01: supported.energy01, coldStress01: supported.coldStress01,
      biomass01: supported.biomass01, fertility01: supported.fertility01,
    };
    const savanna = (fields: ReturnType<typeof substrate>) => features.scoreVegetationSavannaWoodland.run({
      ...growth, plantWater01: fields.plantWater01, climaticAridity01: fields.climaticAridity01,
    }, features.scoreVegetationSavannaWoodland.defaultConfig).score01[0]!;
    expect(savanna(supported)).toBeGreaterThan(savanna(baseline));
    expect(savanna(supported)).toBeGreaterThan(0);
    expect(savanna({ ...supported, climaticAridity01: supported.plantWaterStress01 })).toBe(0);
    const steppeInput = {
      ...growth, energy01: new Float32Array([0.55]),
      atmosphericWater01: supported.atmosphericWater01,
      climaticAridity01: new Float32Array([0.75]),
    };
    const steppe = features.scoreVegetationSagebrushSteppe;
    const kept = steppe.run(steppeInput, steppe.defaultConfig).score01;
    expect(kept[0]).toBeGreaterThan(0);
    expect(steppe.run({ ...steppeInput, atmosphericWater01: supported.plantWater01 }, steppe.defaultConfig).score01[0]).toBe(0);
    expect(steppe.run({ ...steppeInput, biomass01: new Float32Array([0.8]) }, steppe.defaultConfig).score01[0]).toBeLessThan(kept[0]!);
  });

  it("retains the planner's climatic savanna <=0.9 gate even with abundant plant water", () => {
    const planner = features.planVegetation;
    const input = {
      width: 2, height: 1, seed: 1,
      landMask: new Uint8Array([1, 1]), flatLandMask: new Uint8Array([1, 1]),
      featureOccupancyMask: new Uint8Array(2),
      biomeIndex: new Uint8Array(2).fill(BIOME_SYMBOL_TO_INDEX.tropicalSeasonal),
      surfaceTemperature: new Float32Array(2).fill(28),
      plantEffectiveMoisture: new Float32Array(2).fill(1000),
      climaticAridityIndex: new Float32Array([0.91, 0.89]),
      vegetationDensity: new Float32Array(2).fill(0.4),
      scoreForest01: new Float32Array(2), scoreRainforest01: new Float32Array(2), scoreTaiga01: new Float32Array(2),
      scoreSavannaWoodland01: new Float32Array(2).fill(1), scoreSagebrushSteppe01: new Float32Array(2),
    };
    expect(planner.run(input, planner.defaultConfig).placements).toEqual([{ x: 1, y: 0, feature: "savanna-woodland" }]);
  });

  for (const source of ["ordinary", "finite-body"] as const) {
    it(`carries ${source} input through plant indices, local class, growth score and lawful flat unoccupied forest admission`, () => {
      const width = 5, height = 3, size = width * height, receiver = 8;
      const budgetInput = {
        width, height, ...noLocalWaterSources(width, height),
        landMask: new Uint8Array(size).fill(1),
        rainfall: new Uint8Array(size).fill(20), humidity: new Uint8Array(size).fill(60), pet: Array<number>(size).fill(30.123456789),
      };
      budgetInput.elevation.fill(10);
      if (source === "finite-body") budgetInput.landMask[7] = 0;
      const budget = hydrology.climate.ops.computeLandWaterBudget;
      const baseline = budget.run(budgetInput, budget.defaultConfig);
      if (source === "ordinary") budgetInput.discharge[7] = 1400;
      else budgetInput.bodies.push({
        bodyId: 8, componentId: 8, poolId: 1, wetCells: [7], level: 10,
        flux: { incomingOverflow: 1200, wetPrecipitation: 200, wetDemand: 1400, dryRunoff: 0, balance: 0 }, outflow: 0, unresolvedResidual: 0,
      });
      const before = structuredClone(budgetInput);
      const supported = budget.run(budgetInput, budget.defaultConfig);
      const runPath = (indices: typeof supported) => {
        const biomes = classifyBiomes.run({
          width, height, landMask: budgetInput.landMask,
          effectiveMoisture: indices.effectiveMoisture, aridityIndex: indices.aridityIndex,
          plantEffectiveMoisture: indices.plantEffectiveMoisture, plantWaterStress: indices.plantWaterStress,
          surfaceTemperatureC: new Float32Array(size).fill(20), freezeIndex: new Float32Array(size).fill(0.05), permafrost01: new Float32Array(size),
          fertility: new Float32Array(size).fill(0.6), soilType: new Uint8Array(size).fill(2),
        }, classifyBiomes.defaultConfig);
        const fields = features.computeVegetationSubstrate.run({
          width, height, landMask: budgetInput.landMask,
          effectiveMoisture: indices.effectiveMoisture, aridityIndex: indices.aridityIndex,
          plantEffectiveMoisture: indices.plantEffectiveMoisture, plantWaterStress: indices.plantWaterStress,
          surfaceTemperature: biomes.surfaceTemperature, freezeIndex: biomes.freezeIndex,
          vegetationDensity: biomes.vegetationDensity, fertility: new Float32Array(size).fill(0.6),
        }, features.computeVegetationSubstrate.defaultConfig);
        const forest = features.scoreVegetationForest.run({
          width, height, landMask: budgetInput.landMask,
          energy01: fields.energy01, plantWater01: fields.plantWater01, plantWaterStress01: fields.plantWaterStress01,
          coldStress01: fields.coldStress01, biomass01: fields.biomass01, fertility01: fields.fertility01,
        }, features.scoreVegetationForest.defaultConfig).score01;
        const flatLandMask = new Uint8Array(size).fill(1);
        flatLandMask[6] = 0;
        const featureOccupancyMask = new Uint8Array(size);
        featureOccupancyMask[9] = 1;
        const placements = features.planVegetation.run({
          width, height, seed: 1, landMask: budgetInput.landMask, flatLandMask, featureOccupancyMask,
          biomeIndex: biomes.biomeIndex, vegetationDensity: biomes.vegetationDensity,
          surfaceTemperature: biomes.surfaceTemperature, plantEffectiveMoisture: indices.plantEffectiveMoisture, climaticAridityIndex: indices.aridityIndex,
          scoreForest01: forest, scoreRainforest01: new Float32Array(size), scoreTaiga01: new Float32Array(size),
          scoreSavannaWoodland01: new Float32Array(size), scoreSagebrushSteppe01: new Float32Array(size),
        }, features.planVegetation.defaultConfig).placements;
        return { biomes, fields, forest, placements };
      };
      const incumbent = runPath(baseline), candidate = runPath(supported);
      expect(supported.plantEffectiveMoisture[receiver]).toBe(241);
      expect(candidate.biomes.biomeIndex[receiver]).toBe(BIOME_SYMBOL_TO_INDEX.temperateHumid);
      expect(candidate.biomes.vegetationDensity[receiver]).toBeGreaterThan(incumbent.biomes.vegetationDensity[receiver]!);
      expect(incumbent.forest[receiver]).toBe(0);
      expect(candidate.forest[receiver]).toBeGreaterThan(features.planVegetation.defaultConfig.config.forestMinConfidence01);
      expect(candidate.placements).toContainEqual({ x: 3, y: 1, feature: "forest" });
      expect(candidate.placements.every(({ x, y }) => ![6, 9].includes(y * width + x))).toBe(true);
      for (const placement of candidate.placements) {
        const symbol = biomeSymbolFromIndex(candidate.biomes.biomeIndex[placement.y * width + placement.x]!);
        const legality = getEngineFeatureLegality(resolveFeatureKeyForIntent(placement.feature));
        expect(legality?.biomes).toContain(SWOOPER_LAND_BIOME_PROJECTION[symbol]);
        expect(legality?.terrains).toContain("TERRAIN_FLAT");
      }
      expect(supported.effectiveMoisture).toEqual(baseline.effectiveMoisture);
      expect(supported.aridityIndex).toEqual(baseline.aridityIndex);
      expect(supported.pet).toEqual(baseline.pet);
      expect(budgetInput).toEqual(before);
    });
  }
});
