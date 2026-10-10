import { describe, expect, it } from "bun:test";
import hydrologyOpsPublic from "../../../../../../src/domain/hydrology/router.js";

const { computeCryosphereState } = hydrologyOpsPublic.cryosphere.ops;
describe("hydrology cryosphere model proxies", () => {
  it("uses precipitation to distinguish equally cold land surfaces", () => {
    const syntheticDimensions = { width: 3, height: 1 } as const;
    const { width, height } = syntheticDimensions;

    const landMask = new Uint8Array([1, 1, 1]);
    const surfaceTemperatureC = new Float32Array([-5, -5, -5]);
    const precipitation = new Float32Array([200, 0, 600.75]);
    const before = precipitation.slice();

    const result = computeCryosphereState.run(
      { width, height, landMask, surfaceTemperatureC, precipitation },
      computeCryosphereState.defaultConfig
    );

    expect(result.snowCover[0]).toBeGreaterThan(result.snowCover[1] ?? 0);
    expect(result.groundIce01[0]).toBeGreaterThan(result.groundIce01[1] ?? 0);
    expect(result.snowCover[2]).toBe(result.snowCover[0]);
    expect(result.groundIce01[2]).toBe(result.groundIce01[0]);
    expect(precipitation).toEqual(before);
  });
});
