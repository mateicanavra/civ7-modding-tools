import { describe, expect, it } from "bun:test";
import { runAdmittedOperationForTest } from "@swooper/mapgen-core/testing";
import hydrologyOpsPublic from "../../../../../../src/domain/hydrology/router.js";

const { computeCryosphereState } = hydrologyOpsPublic.cryosphere.ops;
describe("hydrology cryosphere model proxies", () => {
  it("uses precipitation to distinguish equally cold land surfaces", () => {
    const syntheticDimensions = { width: 2, height: 1 } as const;
    const { width, height } = syntheticDimensions;

    const landMask = new Uint8Array([1, 1]);
    const surfaceTemperatureC = new Float32Array([-5, -5]);
    const precipitation = new Float32Array([200, 0]);

    const result = computeCryosphereState.run(
      { width, height, landMask, surfaceTemperatureC, precipitation },
      computeCryosphereState.defaultConfig
    );

    expect(result.snowCover[0]).toBeGreaterThan(result.snowCover[1] ?? 0);
    expect(result.groundIce01[0]).toBeGreaterThan(result.groundIce01[1] ?? 0);
  });

  it("keeps the frozen snow and ground-ice law for fractional and high float precipitation", () => {
    const input = {
      width: 4, height: 1, landMask: new Uint8Array(4).fill(1),
      surfaceTemperatureC: new Float32Array(4).fill(-5),
      precipitation: new Float32Array([0, 100.25, 200, 400.75]),
    };
    const result = runAdmittedOperationForTest(computeCryosphereState, input, computeCryosphereState.defaultConfig);
    for (let i = 0; i < 4; i++) {
      const snow = Math.round((5 / 12) * 255 * (1 + 0.25 * Math.min(1, input.precipitation[i]! / 200)));
      expect(result.snowCover[i]).toBe(snow);
      expect(result.groundIce01[i]).toBe(Math.fround(0.5 * (1 - 0.75 + 0.75 * snow / 255)));
    }
    expect(result.snowCover[3]).toBe(result.snowCover[2]);
    expect(result.groundIce01[3]).toBe(result.groundIce01[2]);
    for (const precipitation of [NaN, Infinity, -0.25]) {
      const malformed = structuredClone(input);
      malformed.precipitation[0] = precipitation;
      expect(() => computeCryosphereState.run(malformed, computeCryosphereState.defaultConfig)).toThrow("precipitation");
    }
  });
});
