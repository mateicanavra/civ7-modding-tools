import { describe, expect, it } from "bun:test";

import { biomeSymbolFromIndex } from "@mapgen/domain/ecology";
import ecology from "@mapgen/domain/ecology/ops";
import { normalizeOpSelectionOrThrow } from "../support/compiler-helpers.js";

describe("classifyBiomes operation", () => {
  it("maps temperature + moisture into biome symbols", () => {
    const width = 3;
    const height = 2;
    const size = width * height;

    // Keep expectations stable by deriving effectiveMoisture in the same unit scale as the legacy inputs:
    // effectiveMoisture = rainfall + 0.35 * humidity (no river bonus in this test).
    const effectiveMoisture = new Float32Array([
      210 + 0.35 * 180,
      130 + 0.35 * 80,
      70 + 0.35 * 30,
      35 + 0.35 * 20,
      180 + 0.35 * 160,
      50 + 0.35 * 10,
    ]);
    const surfaceTemperatureC = new Float32Array([30, 20, 15, 30, -10, 15]);
    const aridityIndex = new Float32Array(size);
    const freezeIndex = new Float32Array([0, 0, 0, 0, 1, 0]);
    const landMask = new Uint8Array([1, 1, 1, 1, 1, 0]);
    const soilType = new Uint8Array(size).fill(0);
    const fertility = new Float32Array(size).fill(0.5);

    const selection = normalizeOpSelectionOrThrow(ecology.ops.classifyBiomes, ecology.ops.classifyBiomes.defaultConfig);

    const result = ecology.ops.classifyBiomes.run(
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

    expect(result.biomeIndex.length).toBe(size);
    expect(result.vegetationDensity.length).toBe(size);
    expect(result.effectiveMoisture.length).toBe(size);

    expect(biomeSymbolFromIndex(result.biomeIndex[0]!)).toBe("tropicalRainforest");
    expect(biomeSymbolFromIndex(result.biomeIndex[2]!)).toBe("temperateDry");
    expect(biomeSymbolFromIndex(result.biomeIndex[3]!)).toBe("desert");
    expect(biomeSymbolFromIndex(result.biomeIndex[4]!)).toBe("snow");
    expect(result.biomeIndex[5]).toBe(255);
  });
});
