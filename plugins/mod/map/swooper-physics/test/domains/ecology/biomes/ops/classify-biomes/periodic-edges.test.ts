import { describe, expect, it } from "bun:test";
import { runAdmittedOperationForTest } from "@swooper/mapgen-core/testing";
import { biomeSymbolFromIndex } from "../../../../../../src/domain/ecology/index.js";
import ecology from "../../../../../../src/domain/ecology/router.js";

const { classifyBiomes } = ecology.biomes.ops;

function inputFor(width: number, height: number) {
  const size = width * height;
  return {
    width,
    height,
    effectiveMoisture: new Float32Array(size).fill(70),
    surfaceTemperatureC: new Float32Array(size).fill(15),
    aridityIndex: new Float32Array(size),
    freezeIndex: new Float32Array(size),
    permafrost01: new Float32Array(size),
    landMask: new Uint8Array(size).fill(1),
    soilType: new Uint8Array(size),
    fertility: new Float32Array(size).fill(0.5),
  };
}

function translateX(values: ArrayLike<number>, width: number, offset: number) {
  return Array.from({ length: values.length }, (_, index) => {
    const rowStart = Math.floor(index / width) * width;
    const sourceX = ((index % width) - offset + width) % width;
    return values[rowStart + sourceX]!;
  });
}

function translateInputX(input: ReturnType<typeof inputFor>, offset: number) {
  const { width } = input;
  return {
    ...input,
    effectiveMoisture: new Float32Array(translateX(input.effectiveMoisture, width, offset)),
    surfaceTemperatureC: new Float32Array(translateX(input.surfaceTemperatureC, width, offset)),
    aridityIndex: new Float32Array(translateX(input.aridityIndex, width, offset)),
    freezeIndex: new Float32Array(translateX(input.freezeIndex, width, offset)),
    permafrost01: new Float32Array(translateX(input.permafrost01, width, offset)),
    landMask: new Uint8Array(translateX(input.landMask, width, offset)),
    soilType: new Uint8Array(translateX(input.soilType, width, offset)),
    fertility: new Float32Array(translateX(input.fertility, width, offset)),
  };
}

function classify(input: ReturnType<typeof inputFor>, radius: number, iterations: number) {
  const selection = classifyBiomes.defaultConfig;
  return runAdmittedOperationForTest(classifyBiomes, input, {
    ...selection,
    config: { ...selection.config, edgeRefine: { radius, iterations } },
  });
}

describe("classifyBiomes periodic edges", () => {
  it.each([1, 2, 4])("commutes with cyclic X translations over %i refinement iterations", (iterations) => {
    const input = inputFor(9, 5);
    for (let y = 0; y < input.height; y++) input.effectiveMoisture[y * input.width] = 230;
    for (let index = 0; index < input.permafrost01.length; index++) {
      input.permafrost01[index] = (index % 5) / 4;
    }
    const baseline = classify(input, 1, iterations);

    for (let offset = 1; offset < input.width; offset++) {
      const translated = classify(translateInputX(input, offset), 1, iterations);
      expect(Array.from(translated.biomeIndex)).toEqual(
        translateX(baseline.biomeIndex, input.width, offset)
      );
      expect(Array.from(translated.vegetationDensity)).toEqual(
        translateX(baseline.vegetationDensity, input.width, offset)
      );
      expect(Array.from(translated.treeLine01)).toEqual(
        translateX(baseline.treeLine01, input.width, offset)
      );
    }
  });

  it("excludes water votes across the seam while preserving the water sentinel", () => {
    const input = inputFor(9, 5);
    input.landMask.fill(0);
    for (let y = 0; y < input.height; y++) {
      const row = y * input.width;
      input.landMask[row] = 1;
      input.landMask[row + 1] = 1;
      input.landMask[row + input.width - 1] = 1;
      input.effectiveMoisture[row] = 230;
    }
    const baseline = classify(input, 3, 4);

    for (let index = 0; index < input.landMask.length; index++) {
      if (input.landMask[index] === 0) {
        expect(baseline.biomeIndex[index]).toBe(255);
        expect(baseline.vegetationDensity[index]).toBe(0);
      } else {
        expect(biomeSymbolFromIndex(baseline.biomeIndex[index]!)).toBe("temperateDry");
      }
    }
    for (let offset = 1; offset < input.width; offset++) {
      const translated = classify(translateInputX(input, offset), 3, 4);
      expect(Array.from(translated.biomeIndex)).toEqual(
        translateX(baseline.biomeIndex, input.width, offset)
      );
    }

    const differentWaterClimate = structuredClone(input);
    for (let index = 0; index < input.landMask.length; index++) {
      if (input.landMask[index] !== 0) continue;
      differentWaterClimate.effectiveMoisture[index] = 230;
      differentWaterClimate.surfaceTemperatureC[index] = -10;
      differentWaterClimate.aridityIndex[index] = 1;
      differentWaterClimate.freezeIndex[index] = 1;
    }
    const changedWater = classify(differentWaterClimate, 3, 4);
    expect(changedWater.biomeIndex).toEqual(baseline.biomeIndex);
    expect(changedWater.vegetationDensity).toEqual(baseline.vegetationDensity);
  });

  it.each([1, 4])("does not wrap between north and south over %i refinement iterations", (iterations) => {
    const input = inputFor(4, 5);
    input.landMask.fill(0, input.width, input.width * 3);
    input.effectiveMoisture.fill(230, input.width * 3);
    const result = classify(input, 2, iterations);

    for (let x = 0; x < input.width; x++) {
      expect(biomeSymbolFromIndex(result.biomeIndex[x]!)).toBe("temperateDry");
      expect(biomeSymbolFromIndex(result.biomeIndex[input.width * 4 + x]!)).toBe("temperateHumid");
    }
    for (let index = input.width; index < input.width * 3; index++) {
      expect(result.biomeIndex[index]).toBe(255);
    }
  });

  it.each([1, 2, 4])("retains every Gaussian offset on a width-two grid over %i iterations", (iterations) => {
    const input = inputFor(2, 3);
    for (let y = 0; y < input.height; y++) input.effectiveMoisture[y * input.width] = 230;
    const result = classify(input, 5, iterations);

    // At radius five, the six odd X offsets outweigh the five even offsets.
    for (let y = 0; y < input.height; y++) {
      expect(biomeSymbolFromIndex(result.biomeIndex[y * input.width]!)).toBe(
        iterations % 2 === 1 ? "temperateDry" : "temperateHumid"
      );
      expect(biomeSymbolFromIndex(result.biomeIndex[y * input.width + 1]!)).toBe(
        iterations % 2 === 1 ? "temperateHumid" : "temperateDry"
      );
    }
    const translated = classify(translateInputX(input, 1), 5, iterations);
    expect(Array.from(translated.biomeIndex)).toEqual(translateX(result.biomeIndex, 2, 1));
  });

  it("admits a width-one grid with a kernel wider than the map", () => {
    const input = inputFor(1, 4);
    input.landMask[2] = 0;
    const result = classify(input, 5, 4);

    for (const index of [0, 1, 3]) {
      expect(biomeSymbolFromIndex(result.biomeIndex[index]!)).toBe("temperateDry");
    }
    expect(result.biomeIndex[2]).toBe(255);
    expect(result.vegetationDensity[2]).toBe(0);
  });

  it("leaves admitted inputs, forwarded climate fields, and vegetation unchanged by refinement", () => {
    const input = inputFor(9, 5);
    for (let index = 0; index < input.landMask.length; index++) {
      input.effectiveMoisture[index] = index % input.width === 0 ? 230 : 70;
      input.surfaceTemperatureC[index] += index % 3;
      input.aridityIndex[index] = (index % 4) / 20;
      input.freezeIndex[index] = (index % 3) / 10;
      input.permafrost01[index] = (index % 5) / 4;
      input.soilType[index] = index % 3;
      input.fertility[index] = (index % 5) / 5;
    }
    input.landMask[input.width - 1] = 0;
    const before = structuredClone(input);
    const local = classify(input, 1, 1);
    const broad = classify(input, 5, 4);

    expect(input).toEqual(before);
    expect(classify(input, 5, 4)).toEqual(broad);
    expect(broad.vegetationDensity).toEqual(local.vegetationDensity);
    expect(broad.treeLine01).toEqual(local.treeLine01);
    for (const result of [local, broad]) {
      expect(result.effectiveMoisture).toEqual(input.effectiveMoisture);
      expect(result.surfaceTemperature).toEqual(input.surfaceTemperatureC);
      expect(result.aridityIndex).toEqual(input.aridityIndex);
      expect(result.freezeIndex).toEqual(input.freezeIndex);
      expect(result.effectiveMoisture).not.toBe(input.effectiveMoisture);
      expect(result.surfaceTemperature).not.toBe(input.surfaceTemperatureC);
      expect(result.aridityIndex).not.toBe(input.aridityIndex);
      expect(result.freezeIndex).not.toBe(input.freezeIndex);
    }
  });
});
