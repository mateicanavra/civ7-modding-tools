import { describe, expect, it } from "bun:test";

import { biomeSymbolFromIndex } from "@mapgen/domain/ecology";
import ecology from "@mapgen/domain/ecology/ops";
import { normalizeOpSelectionOrThrow } from "../support/compiler-helpers.js";

describe("classifyBiomes operation", () => {
  it("maps temperature + moisture into biome symbols", () => {
    const width = 3;
    const height = 2;
    const size = width * height;

    const rainfall = new Uint8Array([210, 130, 70, 35, 180, 50]);
    const humidity = new Uint8Array([180, 80, 30, 20, 160, 10]);
    const surfaceTemperatureC = new Float32Array([30, 20, 15, 30, -10, 15]);
    const aridityIndex = new Float32Array(size);
    const freezeIndex = new Float32Array([0, 0, 0, 0, 1, 0]);
    const landMask = new Uint8Array([1, 1, 1, 1, 1, 0]);
    const riverClass = new Uint8Array(size).fill(0);

    const selection = normalizeOpSelectionOrThrow(ecology.ops.classifyBiomes, {
      strategy: "default",
      config: { riparian: {} },
    });

    const result = ecology.ops.classifyBiomes.run(
      {
        width,
        height,
        rainfall,
        humidity,
        surfaceTemperatureC,
        aridityIndex,
        freezeIndex,
        landMask,
        riverClass,
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
