import { describe, expect, it } from "bun:test";
import hydrologyOpsPublic from "@mapgen/domain/hydrology/router";

const { computeCryosphereState } = hydrologyOpsPublic.cryosphere.ops;
describe("hydrology cryosphere model proxies", () => {
  it("uses precipitation to distinguish equally cold land surfaces", () => {
    const syntheticDimensions = { width: 2, height: 1 } as const;
    const { width, height } = syntheticDimensions;

    const landMask = new Uint8Array([1, 1]);
    const surfaceTemperatureC = new Float32Array([-5, -5]);
    const rainfall = new Uint8Array([200, 0]);

    const result = computeCryosphereState.run(
      { width, height, landMask, surfaceTemperatureC, rainfall },
      computeCryosphereState.defaultConfig
    );

    expect(result.snowCover[0]).toBeGreaterThan(result.snowCover[1] ?? 0);
    expect(result.groundIce01[0]).toBeGreaterThan(result.groundIce01[1] ?? 0);
  });
});
