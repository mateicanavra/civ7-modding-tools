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
        surfaceTemperatureC: new Float32Array(size).fill(climate.temperature),
        aridityIndex: new Float32Array(size),
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
});
