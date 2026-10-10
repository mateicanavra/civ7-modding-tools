import { describe, expect, it } from "bun:test";
import { biomeSymbolFromIndex } from "../../../../../../src/domain/ecology/index.js";
import ecology from "../../../../../../src/domain/ecology/router.js";
import { admitStandardMapConfig } from "../../../../../../src/maps/configs/canonical.js";
import swooperEarthlikeRaw from "../../../../../../src/maps/configs/swooper-earthlike.config.json";
import { normalizeOperationSelectionForTest } from "@swooper/mapgen-core/testing";
import { TEST_MAP_SIZE } from "../../../../../setup.js";

describe("classifyBiomes operation", () => {
  it("exposes classification responses rather than local climate derivation controls", () => {
    const { strategy, config } = ecology.biomes.ops.classifyBiomes.defaultConfig;

    expect(strategy).toBe("biophysical");
    expect(Object.keys(config).sort()).toEqual(["aridity", "moisture", "temperature", "vegetation"]);
    expect(Object.keys(config.temperature).sort()).toEqual([
      "midLatitude",
      "polarCutoff",
      "tropicalThreshold",
      "tundraCutoff",
    ]);
    expect(Object.keys(config.aridity).sort()).toEqual([
      "moistureShiftThresholds",
      "vegetationPenalty",
    ]);
  });

  it("classifies supplied Hydrology temperature and aridity without re-deriving them", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const selection = normalizeOperationSelectionForTest(
      ecology.biomes.ops.classifyBiomes,
      ecology.biomes.ops.classifyBiomes.defaultConfig
    );
    const climates = [
      { temperature: 15, aridity: 0, biome: "temperateHumid" },
      { temperature: -10, aridity: 0, biome: "tundra" },
      { temperature: 15, aridity: 1, biome: "desert" },
    ] as const;

    for (const climate of climates) {
      const surfaceTemperatureC = new Float32Array(size).fill(climate.temperature);
      const aridityIndex = new Float32Array(size).fill(climate.aridity);
      const result = ecology.biomes.ops.classifyBiomes.run(
        {
          width,
          height,
          effectiveMoisture: new Float32Array(size).fill(110),
          plantEffectiveMoisture: new Float32Array(size).fill(110),
          surfaceTemperatureC,
          aridityIndex,
          plantWaterStress: aridityIndex,
          freezeIndex: new Float32Array(size),
          permafrost01: new Float32Array(size),
          landMask: new Uint8Array(size).fill(1),
          soilType: new Uint8Array(size),
          fertility: new Float32Array(size).fill(0.5),
        },
        selection
      );

      expect(biomeSymbolFromIndex(result.biomeIndex[0]!)).toBe(climate.biome);
      expect(result.surfaceTemperature).toEqual(surfaceTemperatureC);
      expect(result.aridityIndex).toEqual(aridityIndex);
    }
  });

  it("keeps Earthlike's supported warm seasonal habitat without changing its climate or biomass", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const authored = admitStandardMapConfig(swooperEarthlikeRaw)
      .config["ecology-biomes"].biomes.classify;
    const waterTile = size - 1;
    const input = {
      width,
      height,
      effectiveMoisture: new Float32Array(size).fill(150),
      plantEffectiveMoisture: new Float32Array(size).fill(150),
      surfaceTemperatureC: new Float32Array(size).fill(30),
      aridityIndex: new Float32Array(size).fill(0.35),
      plantWaterStress: new Float32Array(size).fill(0.35),
      freezeIndex: new Float32Array(size),
      permafrost01: new Float32Array(size),
      landMask: new Uint8Array(size).fill(1),
      soilType: new Uint8Array(size),
      fertility: new Float32Array(size).fill(0.5),
    };
    input.landMask[waterTile] = 0;

    const runWithFirstShift = (firstShift: number) =>
      ecology.biomes.ops.classifyBiomes.run(
        input,
        normalizeOperationSelectionForTest(ecology.biomes.ops.classifyBiomes, {
          ...authored,
          config: {
            ...authored.config,
            aridity: {
              ...authored.config.aridity,
              moistureShiftThresholds: [firstShift, authored.config.aridity.moistureShiftThresholds[1]],
            },
          },
        })
      );
    const overShifted = runWithFirstShift(0.2);
    const supported = runWithFirstShift(authored.config.aridity.moistureShiftThresholds[0]);

    expect(biomeSymbolFromIndex(overShifted.biomeIndex[0]!)).toBe("desert");
    expect(biomeSymbolFromIndex(supported.biomeIndex[0]!)).toBe("tropicalSeasonal");
    expect(supported.surfaceTemperature).toEqual(input.surfaceTemperatureC);
    expect(supported.aridityIndex).toEqual(input.aridityIndex);
    expect(supported.vegetationDensity).toEqual(overShifted.vegetationDensity);
    expect(supported.biomeIndex[waterTile]).toBe(255);
    expect(overShifted.biomeIndex[waterTile]).toBe(255);

    input.aridityIndex.fill(0.8);
    input.plantWaterStress.fill(0.8);
    const dry = runWithFirstShift(authored.config.aridity.moistureShiftThresholds[0]);
    expect(biomeSymbolFromIndex(dry.biomeIndex[0]!)).toBe("desert");
    expect(dry.biomeIndex[waterTile]).toBe(255);
  });

  it("maps temperature + moisture into biome symbols", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;

    // Keep expectations stable by deriving effectiveMoisture in the same unit scale as the legacy inputs:
    // effectiveMoisture = rainfall + 0.35 * humidity (no river bonus in this test).
    const effectiveMoisture = new Float32Array(size).fill(70 + 0.35 * 30);
    const surfaceTemperatureC = new Float32Array(size).fill(15);
    const aridityIndex = new Float32Array(size);
    const freezeIndex = new Float32Array(size);
    const landMask = new Uint8Array(size).fill(1);
    const waterTile = size - 1;
    landMask[waterTile] = 0;
    const soilType = new Uint8Array(size).fill(0);
    const fertility = new Float32Array(size).fill(0.5);
    const sampleTiles = Array.from(
      { length: 5 },
      (_, index) => Math.floor(height / 2) * width + Math.floor(((index + 1) * width) / 6)
    );
    const sampleValues = [
      { moisture: 210 + 0.35 * 180, temperature: 30, freeze: 0 },
      { moisture: 130 + 0.35 * 80, temperature: 20, freeze: 0 },
      { moisture: 70 + 0.35 * 30, temperature: 15, freeze: 0 },
      { moisture: 35 + 0.35 * 20, temperature: 30, freeze: 0 },
      { moisture: 180 + 0.35 * 160, temperature: -10, freeze: 1 },
    ] as const;
    sampleTiles.forEach((sampleTile, sampleIndex) => {
      const sample = sampleValues[sampleIndex]!;
      effectiveMoisture[sampleTile] = sample.moisture;
      surfaceTemperatureC[sampleTile] = sample.temperature;
      freezeIndex[sampleTile] = sample.freeze;
    });

    const selection = normalizeOperationSelectionForTest(
      ecology.biomes.ops.classifyBiomes,
      ecology.biomes.ops.classifyBiomes.defaultConfig
    );

    const result = ecology.biomes.ops.classifyBiomes.run(
      {
        width,
        height,
        effectiveMoisture,
        plantEffectiveMoisture: effectiveMoisture,
        surfaceTemperatureC,
        aridityIndex,
        plantWaterStress: aridityIndex,
        freezeIndex,
        permafrost01: new Float32Array(size),
        landMask,
        soilType,
        fertility,
      },
      selection
    );

    expect(biomeSymbolFromIndex(result.biomeIndex[sampleTiles[0]!]!)).toBe("tropicalRainforest");
    expect(biomeSymbolFromIndex(result.biomeIndex[sampleTiles[1]!]!)).toBe("temperateHumid");
    expect(biomeSymbolFromIndex(result.biomeIndex[sampleTiles[2]!]!)).toBe("temperateDry");
    expect(biomeSymbolFromIndex(result.biomeIndex[sampleTiles[3]!]!)).toBe("desert");
    expect(biomeSymbolFromIndex(result.biomeIndex[sampleTiles[4]!]!)).toBe("snow");
    expect(result.biomeIndex[waterTile]).toBe(255);
  });

  it.each([
    { name: "single humid cell", column: false, backgroundMoisture: 98.45, localMoisture: 164 },
    { name: "one-cell-wide humid column", column: true, backgroundMoisture: 98.45, localMoisture: 164 },
    { name: "dry receiver among humid neighbors", column: false, backgroundMoisture: 164, localMoisture: 98.45 },
  ])("preserves Earthlike's local physical support for a $name", (fixture) => {
    const width = 9;
    const height = 9;
    const size = width * height;
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    const center = centerY * width + centerX;
    const waterTile = size - 1;

    const effectiveMoisture = new Float32Array(size).fill(fixture.backgroundMoisture);
    if (fixture.column) {
      for (let y = 0; y < height; y++) effectiveMoisture[y * width + centerX] = fixture.localMoisture;
    } else {
      effectiveMoisture[center] = fixture.localMoisture;
    }

    const input = {
      width,
      height,
      effectiveMoisture,
      plantEffectiveMoisture: effectiveMoisture,
      surfaceTemperatureC: new Float32Array(size).fill(12.13),
      aridityIndex: new Float32Array(size).fill(0.35924),
      plantWaterStress: new Float32Array(size).fill(0.35924),
      freezeIndex: new Float32Array(size),
      permafrost01: new Float32Array(size),
      landMask: new Uint8Array(size).fill(1),
      soilType: new Uint8Array(size),
      fertility: new Float32Array(size).fill(0.46),
    };
    input.landMask[waterTile] = 0;
    const before = structuredClone(input);
    const authored = admitStandardMapConfig(swooperEarthlikeRaw)
      .config["ecology-biomes"].biomes.classify;
    expect(authored.config.moisture.thresholds[1]).toBe(163.5);
    const result = ecology.biomes.ops.classifyBiomes.run(
      input,
      normalizeOperationSelectionForTest(ecology.biomes.ops.classifyBiomes, authored)
    );

    for (let index = 0; index < size; index++) {
      if (index === waterTile) continue;
      expect(biomeSymbolFromIndex(result.biomeIndex[index]!)).toBe(
        effectiveMoisture[index]! >= 163.5 ? "temperateHumid" : "temperateDry"
      );
    }
    expect(result.biomeIndex[waterTile]).toBe(255);
    expect(result.vegetationDensity[waterTile]).toBe(0);
    expect(result.treeLine01).toEqual(new Float32Array(size).fill(1));
    expect(result.effectiveMoisture).toEqual(input.effectiveMoisture);
    expect(result.surfaceTemperature).toEqual(input.surfaceTemperatureC);
    expect(result.aridityIndex).toEqual(input.aridityIndex);
    expect(result.freezeIndex).toEqual(input.freezeIndex);
    expect(input).toEqual(before);
  });

  it("preserves ocean thermal ordering under the default classifier", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const surfaceTemperatureC = new Float32Array(size);
    surfaceTemperatureC[0] = 20;

    const result = ecology.biomes.ops.classifyBiomes.run(
      {
        width,
        height,
        effectiveMoisture: new Float32Array(size),
        plantEffectiveMoisture: new Float32Array(size),
        surfaceTemperatureC,
        aridityIndex: new Float32Array(size),
        plantWaterStress: new Float32Array(size),
        freezeIndex: new Float32Array(size),
        permafrost01: new Float32Array(size),
        landMask: new Uint8Array(size),
        soilType: new Uint8Array(size),
        fertility: new Float32Array(size),
      },
      normalizeOperationSelectionForTest(
        ecology.biomes.ops.classifyBiomes,
        ecology.biomes.ops.classifyBiomes.defaultConfig
      )
    );

    expect(result.surfaceTemperature[0]).toBeGreaterThan(result.surfaceTemperature[1]!);
  });

  it("owns the exact all-cell Float32 treeline response without changing classification", () => {
    const width = 8;
    const height = 1;
    const size = width * height;
    const permafrost01 = Float32Array.of(-0.25, 0, 0.1, 0.25, 0.75, 0.9, 1, 1.25);
    const input = {
      width,
      height,
      effectiveMoisture: new Float32Array(size).fill(110),
      plantEffectiveMoisture: new Float32Array(size).fill(110),
      surfaceTemperatureC: new Float32Array(size).fill(15),
      aridityIndex: new Float32Array(size),
      plantWaterStress: new Float32Array(size),
      freezeIndex: new Float32Array(size),
      permafrost01,
      landMask: Uint8Array.of(1, 0, 1, 0, 1, 0, 1, 0),
      soilType: new Uint8Array(size),
      fertility: new Float32Array(size).fill(0.5),
    };
    const before = structuredClone(input);
    const selection = normalizeOperationSelectionForTest(
      ecology.biomes.ops.classifyBiomes,
      ecology.biomes.ops.classifyBiomes.defaultConfig
    );
    const result = ecology.biomes.ops.classifyBiomes.run(input, selection);
    const control = ecology.biomes.ops.classifyBiomes.run(
      { ...input, permafrost01: new Float32Array(size) },
      selection
    );
    const expected = Float32Array.from(permafrost01, (value) => Math.min(1, Math.max(0, 1 - value)));

    expect(result.treeLine01).toBeInstanceOf(Float32Array);
    expect(result.treeLine01).toEqual(expected);
    expect(result.treeLine01).not.toBe(permafrost01);
    expect(control.treeLine01).toEqual(new Float32Array(size).fill(1));
    expect(input).toEqual(before);
    expect(result.biomeIndex).toEqual(control.biomeIndex);
    expect(result.vegetationDensity).toEqual(control.vegetationDensity);
    expect(result.effectiveMoisture).toEqual(control.effectiveMoisture);
    expect(result.surfaceTemperature).toEqual(control.surfaceTemperature);
    expect(result.aridityIndex).toEqual(control.aridityIndex);
    expect(result.freezeIndex).toEqual(control.freezeIndex);
  });
});
