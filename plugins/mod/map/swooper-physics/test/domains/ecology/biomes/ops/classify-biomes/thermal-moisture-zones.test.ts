import { describe, expect, it } from "bun:test";
import { normalizeOperationSelectionForTest } from "@swooper/mapgen-core/testing";
import { biomeSymbolFromIndex } from "../../../../../../src/domain/ecology/index.js";
import ecology from "../../../../../../src/domain/ecology/router.js";
import { TEST_MAP_SIZE } from "../../../../../setup.js";

describe("classifyBiomes thermal and moisture zones", () => {
  it.each([
    { temperature: 15, moisture: 230, biome: "temperateHumid" },
    { temperature: 28, moisture: 160, biome: "tropicalRainforest" },
    { temperature: 28, moisture: 230, biome: "tropicalRainforest" },
    { temperature: 28, moisture: 110, biome: "tropicalSeasonal" },
  ] as const)("classifies $temperature C and $moisture moisture as $biome", (climate) => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const result = ecology.biomes.ops.classifyBiomes.run(
      {
        width,
        height,
        landMask: new Uint8Array(size).fill(1),
        effectiveMoisture: new Float32Array(size).fill(climate.moisture),
        plantEffectiveMoisture: new Float32Array(size).fill(climate.moisture),
        surfaceTemperatureC: new Float32Array(size).fill(climate.temperature),
        aridityIndex: new Float32Array(size),
        plantWaterStress: new Float32Array(size),
        freezeIndex: new Float32Array(size),
        permafrost01: new Float32Array(size),
        soilType: new Uint8Array(size),
        fertility: new Float32Array(size).fill(0.5),
      },
      normalizeOperationSelectionForTest(
        ecology.biomes.ops.classifyBiomes,
        ecology.biomes.ops.classifyBiomes.defaultConfig
      )
    );

    expect(biomeSymbolFromIndex(result.biomeIndex[0]!)).toBe(climate.biome);
  });

  it.each([
    {
      boundary: "wet-inclusive lower and dry-strict upper guard edges",
      tropicalThreshold: 24,
      climates: [
        { temperature: 22.625, moisture: 190, biome: "temperateHumid" },
        { temperature: 22.75, moisture: 190, biome: "tropicalRainforest" },
        { temperature: 25.25, moisture: 140, biome: "temperateHumid" },
        { temperature: 25.375, moisture: 140, biome: "tropicalRainforest" },
      ],
    },
    {
      boundary: "interior crossings with either temperature or atmospheric moisture held",
      tropicalThreshold: 24,
      climates: [
        { temperature: 24, moisture: 165, biome: "temperateHumid" },
        { temperature: 24.25, moisture: 165, biome: "tropicalRainforest" },
        { temperature: 24, moisture: 167.5, biome: "tropicalRainforest" },
      ],
    },
    {
      boundary: "guard relocation with the authored nominal center",
      tropicalThreshold: 30,
      climates: [
        { temperature: 28.625, moisture: 190, biome: "temperateHumid" },
        { temperature: 28.75, moisture: 190, biome: "tropicalRainforest" },
        { temperature: 31.25, moisture: 140, biome: "temperateHumid" },
        { temperature: 31.375, moisture: 140, biome: "tropicalRainforest" },
      ],
    },
  ] as const)("retains the empirical envelope's $boundary", ({ climates, tropicalThreshold }) => {
    const operation = ecology.biomes.ops.classifyBiomes;
    const selection = normalizeOperationSelectionForTest(operation, {
      ...operation.defaultConfig,
      config: {
        ...operation.defaultConfig.config,
        temperature: { ...operation.defaultConfig.config.temperature, tropicalThreshold },
      },
    });
    const size = climates.length;
    const result = operation.run(
      {
        width: size,
        height: 1,
        landMask: new Uint8Array(size).fill(1),
        effectiveMoisture: new Float32Array(climates.map((climate) => climate.moisture)),
        plantEffectiveMoisture: new Float32Array(size).fill(300),
        surfaceTemperatureC: new Float32Array(climates.map((climate) => climate.temperature)),
        aridityIndex: new Float32Array(size),
        plantWaterStress: new Float32Array(size),
        freezeIndex: new Float32Array(size),
        permafrost01: new Float32Array(size),
        soilType: new Uint8Array(size),
        fertility: new Float32Array(size).fill(0.5),
      },
      selection
    );

    expect(Array.from(result.biomeIndex, (index) => biomeSymbolFromIndex(index))).toEqual(
      climates.map((climate) => climate.biome)
    );
  });
});
