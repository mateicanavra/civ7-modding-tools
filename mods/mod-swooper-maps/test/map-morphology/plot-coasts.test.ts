import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "@civ7/adapter";
import { createExtendedMapContext } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";
import { COAST_TERRAIN, FLAT_TERRAIN, OCEAN_TERRAIN } from "@swooper/mapgen-core";

import plotCoasts from "../../src/recipes/standard/stages/map-morphology/steps/plotCoasts.js";
import { buildTestDeps } from "../support/step-deps.js";

describe("map-morphology/plot-coasts", () => {
  it("stamps coast terrain from coastlineMetrics.coastalWater (no Civ expandCoasts)", () => {
    const width = 4;
    const height = 3;
    const seed = 1234;
    const mapInfo = { GridWidth: width, GridHeight: height, MinLatitude: -60, MaxLatitude: 60 };
    const env = {
      seed,
      dimensions: { width, height },
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    };

    const adapter = createMockAdapter({ width, height, mapInfo, mapSizeId: 1, rng: createLabelRng(seed) });
    const context = createExtendedMapContext({ width, height }, adapter, env);

    const size = width * height;
    const landMask = new Uint8Array(size).fill(0);
    landMask[0] = 1;

    const coastalWater = new Uint8Array(size).fill(0);
    coastalWater[1] = 1;
    coastalWater[6] = 1;

    context.artifacts.set("artifact:morphology.topography", { landMask });
    context.artifacts.set("artifact:morphology.coastlineMetrics", {
      coastalLand: new Uint8Array(size),
      coastalWater,
      distanceToCoast: new Uint16Array(size),
    });

    plotCoasts.run(context as any, {}, {} as any, buildTestDeps(plotCoasts));

    // land stays land
    expect(adapter.getTerrainType(0, 0)).toBe(FLAT_TERRAIN);
    // coastalWater becomes COAST terrain
    expect(adapter.getTerrainType(1, 0)).toBe(COAST_TERRAIN);
    expect(adapter.getTerrainType(2, 1)).toBe(COAST_TERRAIN);
    // other water stays OCEAN terrain
    expect(adapter.getTerrainType(2, 0)).toBe(OCEAN_TERRAIN);
    expect(adapter.getTerrainType(3, 2)).toBe(OCEAN_TERRAIN);

    // expandCoasts is intentionally not invoked by this step.
    expect((adapter as any).calls?.expandCoasts?.length ?? 0).toBe(0);
  });
});
