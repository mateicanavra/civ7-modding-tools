import { describe, expect, it } from "bun:test";
import { BIOME_SYMBOL_TO_INDEX } from "../../../../../src/domain/ecology/index.js";
import ecology from "../../../../../src/domain/ecology/router.js";
import hydrology from "../../../../../src/domain/hydrology/router.js";
import { isStandardFeatureHabitatMismatch } from "../../../../../src/recipes/standard/metrics/policy/feature-habitat.js";
import { noLocalWaterSources } from "../../../../fixtures/local-water-sources.js";

function supportedRainforestModel() {
  const operation = hydrology.climate.ops.computeLandWaterBudget;
  const physical = {
    width: 1, height: 1, ...noLocalWaterSources(1, 1),
    landMask: new Uint8Array([1]), rainfall: new Uint8Array([20]), humidity: new Uint8Array([0]), pet: [80],
  };
  physical.discharge[0] = 250;
  const indices = operation.run(physical, operation.defaultConfig);
  const surfaceTemperature = new Float32Array([27]);
  const classification = ecology.biomes.ops.classifyBiomes.run({
    width: 1, height: 1, landMask: physical.landMask,
    effectiveMoisture: indices.effectiveMoisture, aridityIndex: indices.aridityIndex,
    plantEffectiveMoisture: indices.plantEffectiveMoisture, plantWaterStress: indices.plantWaterStress,
    surfaceTemperatureC: surfaceTemperature, freezeIndex: new Float32Array(1), permafrost01: new Float32Array(1),
    soilType: new Uint8Array([2]), fertility: new Float32Array([0.6]),
  }, ecology.biomes.ops.classifyBiomes.defaultConfig);
  return {
    effectiveMoisture: indices.effectiveMoisture,
    plantEffectiveMoisture: indices.plantEffectiveMoisture,
    aridityIndex: indices.aridityIndex,
    plantWaterStress: indices.plantWaterStress,
    surfaceTemperature,
    vegetationDensity: classification.vegetationDensity,
    biomeIndex: classification.biomeIndex,
  };
}

describe("Standard feature habitat meanings", () => {
  it("admits locally supported rainforest over dry atmosphere using the published plant channel", () => {
    const model = supportedRainforestModel();
    const before = structuredClone(model);
    expect(model.effectiveMoisture[0]).toBe(20);
    expect(model.plantEffectiveMoisture[0]).toBe(270);
    expect(model.plantWaterStress[0]).toBeLessThan(model.aridityIndex[0]!);
    expect(model.biomeIndex[0]).toBe(BIOME_SYMBOL_TO_INDEX.tropicalRainforest);
    expect(isStandardFeatureHabitatMismatch("FEATURE_RAINFOREST", 0, model)).toBe(false);
    expect(model).toEqual(before);
  });

  it("retains the exact rainforest moisture, temperature and density floors and categorical biome gate", () => {
    const model = supportedRainforestModel();
    model.effectiveMoisture.fill(400);
    model.plantEffectiveMoisture.fill(84);
    expect(isStandardFeatureHabitatMismatch("FEATURE_RAINFOREST", 0, model)).toBe(true);
    model.plantEffectiveMoisture.fill(85);
    model.surfaceTemperature.fill(16);
    model.vegetationDensity.fill(0.18);
    expect(isStandardFeatureHabitatMismatch("FEATURE_RAINFOREST", 0, model)).toBe(false);
    model.surfaceTemperature.fill(15.9);
    expect(isStandardFeatureHabitatMismatch("FEATURE_RAINFOREST", 0, model)).toBe(true);
    model.surfaceTemperature.fill(16);
    model.vegetationDensity.fill(0.17);
    expect(isStandardFeatureHabitatMismatch("FEATURE_RAINFOREST", 0, model)).toBe(true);
    model.vegetationDensity.fill(0.18);
    model.biomeIndex.fill(BIOME_SYMBOL_TO_INDEX.tropicalSeasonal);
    expect(isStandardFeatureHabitatMismatch("FEATURE_RAINFOREST", 0, model)).toBe(true);
  });

  it("keeps savanna habitat aridity climatic despite abundant plant moisture and low plant stress", () => {
    const model = supportedRainforestModel();
    model.biomeIndex.fill(BIOME_SYMBOL_TO_INDEX.tropicalSeasonal);
    model.vegetationDensity.fill(0.3);
    model.plantEffectiveMoisture.fill(1000);
    model.plantWaterStress.fill(0.01);
    model.aridityIndex.fill(0.91);
    expect(isStandardFeatureHabitatMismatch("FEATURE_SAVANNA_WOODLAND", 0, model)).toBe(true);
    model.aridityIndex.fill(0.89);
    expect(isStandardFeatureHabitatMismatch("FEATURE_SAVANNA_WOODLAND", 0, model)).toBe(false);
    model.plantWaterStress.fill(0.99);
    expect(isStandardFeatureHabitatMismatch("FEATURE_SAVANNA_WOODLAND", 0, model)).toBe(false);
  });

  it("preserves the existing no-access rainforest result when plant and atmospheric channels match", () => {
    const model = supportedRainforestModel();
    for (const moisture of [20, 84, 85, 200]) {
      model.effectiveMoisture.fill(moisture);
      model.plantEffectiveMoisture.fill(moisture);
      model.plantWaterStress.set(model.aridityIndex);
      expect(isStandardFeatureHabitatMismatch("FEATURE_RAINFOREST", 0, model)).toBe(moisture < 85);
    }
  });
});
