import { describe, expect, it } from "bun:test";
import ecology from "../../../../../../src/domain/ecology/router.js";

const scoreIce = ecology.features.ops.scoreIce;

describe("ecology marine-temperature ice scoring", () => {
  it("preserves the temperature ramp only on external-water recipients", () => {
    const input = {
      width: 3,
      height: 3,
      externalWaterMask: Uint8Array.of(1, 1, 1, 1, 1, 0, 0, 0, 0),
      surfaceTemperature: Float32Array.of(-20, -10, -6, -2, 10, -10, -2, -10, -2),
    };
    const before = structuredClone(input);

    expect(scoreIce.defaultConfig).toEqual({
      strategy: "marine-temperature",
      config: { seaTempColdC: -10, seaTempWarmC: -2 },
    });
    const result = scoreIce.run(input, scoreIce.defaultConfig);

    // The final four cells represent cold/warm finite water and cold/warm exposed land.
    expect(Array.from(result.score01)).toEqual([1, 1, 0.5, 0, 0, 0, 0, 0, 0]);
    expect(input).toEqual(before);
    expect(result.score01).not.toBe(input.surfaceTemperature);
  });

  it("requires exact membership rather than treating every nonzero byte as marine", () => {
    const result = scoreIce.run({
      width: 3,
      height: 1,
      externalWaterMask: Uint8Array.of(0, 1, 2),
      surfaceTemperature: new Float32Array(3).fill(-10),
    }, scoreIce.defaultConfig);

    expect(Array.from(result.score01)).toEqual([0, 1, 0]);
  });

  it("refuses retired inputs, missing evidence, and wrong typed-array cardinality", () => {
    const input = {
      width: 2,
      height: 1,
      externalWaterMask: Uint8Array.of(1, 0),
      surfaceTemperature: Float32Array.of(-10, -10),
    };
    const before = structuredClone(input);
    const invalidInputs = [
      { width: 2, height: 1, surfaceTemperature: input.surfaceTemperature },
      { width: 2, height: 1, externalWaterMask: input.externalWaterMask },
      { ...input, externalWaterMask: new Float32Array(2) },
      { ...input, externalWaterMask: new Uint8Array(1) },
      { ...input, surfaceTemperature: new Float64Array(2) },
      { ...input, surfaceTemperature: new Float32Array(1) },
      { ...input, landMask: new Uint8Array(2) },
      { ...input, elevation: new Int16Array(2).fill(3400) },
      { ...input, freezeIndex: new Float32Array(2).fill(1) },
      {
        width: 2, height: 1, surfaceTemperature: input.surfaceTemperature,
        landMask: new Uint8Array(2), elevation: new Int16Array(2),
        freezeIndex: new Float32Array(2),
      },
    ];

    for (const invalidInput of invalidInputs) {
      // Intentionally malformed data reaches the real public admission boundary, without a cast.
      expect(() => Reflect.apply(scoreIce.run, undefined, [invalidInput, scoreIce.defaultConfig])).toThrow();
    }
    expect(input).toEqual(before);
    expect(Array.from(scoreIce.run(input, scoreIce.defaultConfig).score01)).toEqual([1, 0]);
  });
});
