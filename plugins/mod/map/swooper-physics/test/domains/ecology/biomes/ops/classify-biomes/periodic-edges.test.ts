import { describe, expect, it } from "bun:test";
import { runAdmittedOperationForTest } from "@swooper/mapgen-core/testing";
import { biomeSymbolFromIndex } from "../../../../../../src/domain/ecology/index.js";
import ecology from "../../../../../../src/domain/ecology/router.js";

const { classifyBiomes } = ecology.biomes.ops;

function inputFor(width: number, height: number) {
  const size = width * height;
  const effectiveMoisture = new Float32Array(size).fill(70);
  const aridityIndex = new Float32Array(size);
  return {
    width,
    height,
    effectiveMoisture,
    plantEffectiveMoisture: effectiveMoisture,
    surfaceTemperatureC: new Float32Array(size).fill(15),
    aridityIndex,
    plantWaterStress: aridityIndex,
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
    plantEffectiveMoisture: new Float32Array(translateX(input.plantEffectiveMoisture, width, offset)),
    surfaceTemperatureC: new Float32Array(translateX(input.surfaceTemperatureC, width, offset)),
    aridityIndex: new Float32Array(translateX(input.aridityIndex, width, offset)),
    plantWaterStress: new Float32Array(translateX(input.plantWaterStress, width, offset)),
    freezeIndex: new Float32Array(translateX(input.freezeIndex, width, offset)),
    permafrost01: new Float32Array(translateX(input.permafrost01, width, offset)),
    landMask: new Uint8Array(translateX(input.landMask, width, offset)),
    soilType: new Uint8Array(translateX(input.soilType, width, offset)),
    fertility: new Float32Array(translateX(input.fertility, width, offset)),
  };
}

function classify(input: ReturnType<typeof inputFor>) {
  return runAdmittedOperationForTest(classifyBiomes, input, classifyBiomes.defaultConfig);
}

describe("classifyBiomes periodic edges", () => {
  it("commutes with cyclic X translations", () => {
    const input = inputFor(9, 5);
    for (let y = 0; y < input.height; y++) input.effectiveMoisture[y * input.width] = 230;
    for (let index = 0; index < input.permafrost01.length; index++) {
      input.permafrost01[index] = (index % 5) / 4;
    }
    const baseline = classify(input);

    for (let offset = 1; offset < input.width; offset++) {
      const translated = classify(translateInputX(input, offset));
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

  it("keeps land support independent of water across the seam while preserving the water sentinel", () => {
    const input = inputFor(9, 5);
    input.landMask.fill(0);
    for (let y = 0; y < input.height; y++) {
      const row = y * input.width;
      input.landMask[row] = 1;
      input.landMask[row + 1] = 1;
      input.landMask[row + input.width - 1] = 1;
      input.effectiveMoisture[row] = 230;
    }
    const baseline = classify(input);

    for (let index = 0; index < input.landMask.length; index++) {
      if (input.landMask[index] === 0) {
        expect(baseline.biomeIndex[index]).toBe(255);
        expect(baseline.vegetationDensity[index]).toBe(0);
      } else {
        expect(biomeSymbolFromIndex(baseline.biomeIndex[index]!)).toBe(
          index % input.width === 0 ? "temperateHumid" : "temperateDry"
        );
      }
    }
    for (let offset = 1; offset < input.width; offset++) {
      const translated = classify(translateInputX(input, offset));
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
    const changedWater = classify(differentWaterClimate);
    expect(changedWater.biomeIndex).toEqual(baseline.biomeIndex);
    expect(changedWater.vegetationDensity).toEqual(baseline.vegetationDensity);
  });

  it("does not transfer support between north and south", () => {
    const input = inputFor(4, 5);
    input.landMask.fill(0, input.width, input.width * 3);
    input.effectiveMoisture.fill(230, input.width * 3);
    const result = classify(input);

    for (let x = 0; x < input.width; x++) {
      expect(biomeSymbolFromIndex(result.biomeIndex[x]!)).toBe("temperateDry");
      expect(biomeSymbolFromIndex(result.biomeIndex[input.width * 4 + x]!)).toBe("temperateHumid");
    }
    for (let index = input.width; index < input.width * 3; index++) {
      expect(result.biomeIndex[index]).toBe(255);
    }
  });

  it("retains each column's local support on a width-two grid", () => {
    const input = inputFor(2, 3);
    for (let y = 0; y < input.height; y++) input.effectiveMoisture[y * input.width] = 230;
    const result = classify(input);

    for (let y = 0; y < input.height; y++) {
      expect(biomeSymbolFromIndex(result.biomeIndex[y * input.width]!)).toBe("temperateHumid");
      expect(biomeSymbolFromIndex(result.biomeIndex[y * input.width + 1]!)).toBe("temperateDry");
    }
    const translated = classify(translateInputX(input, 1));
    expect(Array.from(translated.biomeIndex)).toEqual(translateX(result.biomeIndex, 2, 1));
  });

  it("admits a width-one grid without transferring support between rows", () => {
    const input = inputFor(1, 4);
    input.effectiveMoisture[1] = 230;
    input.landMask[2] = 0;
    const result = classify(input);

    for (const index of [0, 3]) {
      expect(biomeSymbolFromIndex(result.biomeIndex[index]!)).toBe("temperateDry");
    }
    expect(biomeSymbolFromIndex(result.biomeIndex[1]!)).toBe("temperateHumid");
    expect(result.biomeIndex[2]).toBe(255);
    expect(result.vegetationDensity[2]).toBe(0);
  });

  it("is deterministic and preserves admitted inputs, local density, treeline, and forwarded climate", () => {
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
    const result = classify(input);
    const config = classifyBiomes.defaultConfig.config;
    const moistureNormalization =
      config.moisture.thresholds[3] + config.vegetation.moistureNormalizationPadding;
    const energyRange = config.temperature.tropicalThreshold - config.temperature.polarCutoff;
    const expectedDensity = Float32Array.from(input.effectiveMoisture, (moisture, index) => {
      if (input.landMask[index] === 0) return 0;
      const moistureNorm = Math.min(1, moisture / moistureNormalization);
      const energy01 = (input.surfaceTemperatureC[index]! - config.temperature.polarCutoff) / energyRange;
      const soilDelta = [-0.15, -0.08, 0.05][input.soilType[index]!]!;
      return (
        (config.vegetation.base + config.vegetation.moistureWeight * moistureNorm)
        * energy01 * (1 - input.freezeIndex[index]!)
        * (1 - input.aridityIndex[index]! * config.aridity.vegetationPenalty)
        * (0.6 + 0.5 * input.fertility[index]! + soilDelta)
      );
    });

    expect(input).toEqual(before);
    expect(classify(input)).toEqual(result);
    expect(result.vegetationDensity).toEqual(expectedDensity);
    expect(result.treeLine01).toEqual(Float32Array.from(input.permafrost01, (value) => 1 - value));
    expect(result.effectiveMoisture).toEqual(input.effectiveMoisture);
    expect(result.surfaceTemperature).toEqual(input.surfaceTemperatureC);
    expect(result.aridityIndex).toEqual(input.aridityIndex);
    expect(result.freezeIndex).toEqual(input.freezeIndex);
    expect(result.effectiveMoisture).not.toBe(input.effectiveMoisture);
    expect(result.surfaceTemperature).not.toBe(input.surfaceTemperatureC);
    expect(result.aridityIndex).not.toBe(input.aridityIndex);
    expect(result.freezeIndex).not.toBe(input.freezeIndex);
  });
});
