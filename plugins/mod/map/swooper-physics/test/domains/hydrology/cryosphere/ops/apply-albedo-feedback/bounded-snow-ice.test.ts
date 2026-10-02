import { describe, expect, it } from "bun:test";
import { runAdmittedOperationForTest } from "@swooper/mapgen-core/testing";

import hydrology from "../../../../../../src/domain/hydrology/router.js";

const { applyAlbedoFeedback } = hydrology.cryosphere.ops;
const config = {
  iterations: 3,
  snowCoolingC: 3,
  seaIceCoolingC: 4,
  minC: -60,
  maxC: 60,
  landSnowStartC: 0,
  landSnowFullC: -30,
  seaIceStartC: 0,
  seaIceFullC: -20,
  precipitationInfluence: 0.5,
};

describe("hydrology/apply-albedo-feedback bounded-snow-ice", () => {
  const cases = [
    { iterations: 0, expected: [-15, -15, -10, -10, 8, 8] },
    { iterations: 1, expected: [-16.5, -17.25, -12, -12, 8, 8] },
    { iterations: 2, expected: [-18.15, -19.8375, -14.4, -14.4, 8, 8] },
    { iterations: 3, expected: [-19.965, -22.813125, -17.28, -17.28, 8, 8] },
  ];

  for (const { iterations, expected } of cases) {
    it(`applies exactly ${iterations} cooling passes without mutating inputs`, () => {
      const input = {
        width: 3,
        height: 2,
        landMask: new Uint8Array([1, 1, 0, 0, 1, 0]),
        rainfall: new Uint8Array([0, 200, 0, 200, 200, 200]),
        surfaceTemperatureC: new Float32Array([-15, -15, -10, -10, 8, 8]),
      };
      const before = structuredClone(input);
      const selection = { strategy: "bounded-snow-ice", config: { ...config, iterations } } as const;

      const result = runAdmittedOperationForTest(applyAlbedoFeedback, input, selection);

      for (let index = 0; index < expected.length; index++) {
        expect(result.surfaceTemperatureC[index]).toBeCloseTo(expected[index]!, 5);
      }
      expect(input).toEqual(before);
      expect(result.surfaceTemperatureC.buffer).not.toBe(input.surfaceTemperatureC.buffer);
      expect(runAdmittedOperationForTest(applyAlbedoFeedback, input, selection)).toEqual(result);
    });
  }

  it("enforces both temperature bounds on the first and subsequent cooling passes", () => {
    const input = {
      width: 3,
      height: 2,
      landMask: new Uint8Array([1, 0, 1, 0, 1, 0]),
      rainfall: new Uint8Array(6).fill(200),
      surfaceTemperatureC: new Float32Array([-100, -100, 100, 100, -29, -19]),
    };
    for (const iterations of [1, 2, 3]) {
      const result = runAdmittedOperationForTest(applyAlbedoFeedback, input, {
        strategy: "bounded-snow-ice",
        config: { ...config, iterations, minC: -20, maxC: 30 },
      });
      expect(Array.from(result.surfaceTemperatureC)).toEqual([-20, -20, 30, 30, -20, -20]);
    }
    expect(Array.from(input.surfaceTemperatureC)).toEqual([-100, -100, 100, 100, -29, -19]);
  });

  it("preserves out-of-bound temperatures when zero passes explicitly disable feedback", () => {
    const result = runAdmittedOperationForTest(
      applyAlbedoFeedback,
      {
        width: 2,
        height: 1,
        landMask: new Uint8Array([1, 0]),
        rainfall: new Uint8Array([200, 200]),
        surfaceTemperatureC: new Float32Array([-100, 100]),
      },
      { strategy: "bounded-snow-ice", config: { ...config, iterations: 0 } }
    );
    expect(Array.from(result.surfaceTemperatureC)).toEqual([-100, 100]);
  });
});
