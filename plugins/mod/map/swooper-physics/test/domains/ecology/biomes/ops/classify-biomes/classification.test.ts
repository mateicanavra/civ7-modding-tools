import { describe, expect, it } from "bun:test";
import { biomeSymbolFromIndex } from "../../../../../../src/domain/ecology/index.js";
import ecology from "../../../../../../src/domain/ecology/router.js";
import { normalizeOperationSelectionForTest } from "@swooper/mapgen-core/testing";
import { TEST_MAP_SIZE } from "../../../../../setup.js";

describe("classifyBiomes operation", () => {
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
      const centerX = sampleTile % width;
      const centerY = Math.floor(sampleTile / width);
      const sample = sampleValues[sampleIndex]!;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const tile = (centerY + dy) * width + centerX + dx;
          effectiveMoisture[tile] = sample.moisture;
          surfaceTemperatureC[tile] = sample.temperature;
          freezeIndex[tile] = sample.freeze;
        }
      }
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
        surfaceTemperatureC,
        aridityIndex,
        freezeIndex,
        landMask,
        soilType,
        fertility,
      },
      selection
    );

    expect(biomeSymbolFromIndex(result.biomeIndex[sampleTiles[0]!]!)).toBe("tropicalRainforest");
    expect(biomeSymbolFromIndex(result.biomeIndex[sampleTiles[2]!]!)).toBe("temperateDry");
    expect(biomeSymbolFromIndex(result.biomeIndex[sampleTiles[3]!]!)).toBe("desert");
    expect(biomeSymbolFromIndex(result.biomeIndex[sampleTiles[4]!]!)).toBe("snow");
    expect(result.biomeIndex[waterTile]).toBe(255);
  });

  it("applies authored edge smoothing through classification without erasing water", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    const center = centerY * width + centerX;
    const waterTile = size - 1;

    const effectiveMoisture = new Float32Array(size).fill(70);
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        effectiveMoisture[(centerY + dy) * width + centerX + dx] = 210;
      }
    }

    const input = {
      width,
      height,
      effectiveMoisture,
      surfaceTemperatureC: new Float32Array(size).fill(15),
      aridityIndex: new Float32Array(size),
      freezeIndex: new Float32Array(size),
      landMask: new Uint8Array(size).fill(1),
      soilType: new Uint8Array(size),
      fertility: new Float32Array(size).fill(0.5),
    };
    input.landMask[waterTile] = 0;

    const defaultSelection = ecology.biomes.ops.classifyBiomes.defaultConfig;
    const runWithRadius = (radius: number) =>
      ecology.biomes.ops.classifyBiomes.run(
        input,
        normalizeOperationSelectionForTest(ecology.biomes.ops.classifyBiomes, {
          ...defaultSelection,
          config: {
            ...defaultSelection.config,
            edgeRefine: { radius, iterations: 1 },
          },
        })
      );

    const localSmoothing = runWithRadius(1);
    const broadSmoothing = runWithRadius(3);

    expect(biomeSymbolFromIndex(localSmoothing.biomeIndex[center]!)).toBe("tropicalRainforest");
    expect(biomeSymbolFromIndex(broadSmoothing.biomeIndex[center]!)).toBe("temperateDry");
    expect(localSmoothing.biomeIndex[waterTile]).toBe(255);
    expect(broadSmoothing.biomeIndex[waterTile]).toBe(255);
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
        surfaceTemperatureC,
        aridityIndex: new Float32Array(size),
        freezeIndex: new Float32Array(size),
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
});
