import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "@civ7/adapter";
import { createExtendedMapContext } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import standardRecipe from "../../src/recipes/standard/recipe.js";
import { initializeStandardRuntime } from "../../src/recipes/standard/runtime.js";
import { realismEarthlikeConfig } from "../../src/maps/presets/realism/earthlike.config.js";

describe("placement landmass region projection", () => {
  it("projects LandmassRegionId before deterministic resource stamping and starts using adapter constants", () => {
    const width = 20;
    const height = 12;
    const seed = 1337;
    const mapInfo = {
      GridWidth: width,
      GridHeight: height,
      MinLatitude: -60,
      MaxLatitude: 60,
      PlayersLandmass1: 1,
      PlayersLandmass2: 1,
      StartSectorRows: 1,
      StartSectorCols: 1,
      NumNaturalWonders: 0,
    };
    const env = {
      seed,
      dimensions: { width, height },
      latitudeBounds: {
        topLatitude: mapInfo.MaxLatitude,
        bottomLatitude: mapInfo.MinLatitude,
      },
    };

    const adapter = createMockAdapter({ width, height, mapInfo, mapSizeId: 1, rng: createLabelRng(seed) });
    const callOrder: string[] = [];
    const regionIds: number[] = [];

    const originalSetLandmassRegionId = adapter.setLandmassRegionId.bind(adapter);
    adapter.setLandmassRegionId = (x, y, regionId) => {
      callOrder.push("setLandmassRegionId");
      regionIds.push(regionId);
      originalSetLandmassRegionId(x, y, regionId);
    };
    const originalSetResourceType = adapter.setResourceType.bind(adapter);
    adapter.setResourceType = (x, y, resourceType) => {
      callOrder.push("setResourceType");
      originalSetResourceType(x, y, resourceType);
    };
    const originalSetStartPosition = adapter.setStartPosition.bind(adapter);
    adapter.setStartPosition = (plotIndex, playerId) => {
      callOrder.push("setStartPosition");
      originalSetStartPosition(plotIndex, playerId);
    };

    const context = createExtendedMapContext({ width, height }, adapter, env);
    initializeStandardRuntime(context, { mapInfo, logPrefix: "[test]", storyEnabled: true });
    standardRecipe.run(context, env, realismEarthlikeConfig, { log: () => {} });

    const firstProjection = callOrder.indexOf("setLandmassRegionId");
    const firstResourceStamp = callOrder.indexOf("setResourceType");
    const firstStart = callOrder.indexOf("setStartPosition");

    expect(firstProjection).toBeGreaterThanOrEqual(0);
    expect(firstResourceStamp).toBeGreaterThan(firstProjection);
    expect(firstStart).toBeGreaterThan(firstProjection);
    expect(firstStart).toBeGreaterThan(firstResourceStamp);
    expect(adapter.calls.setResourceType.length).toBeGreaterThan(0);

    const allowed = new Set([
      adapter.getLandmassId("WEST"),
      adapter.getLandmassId("EAST"),
      adapter.getLandmassId("NONE"),
    ]);
    expect(regionIds.length).toBeGreaterThan(0);
    for (const id of regionIds) {
      expect(allowed.has(id)).toBe(true);
    }
  });
});
