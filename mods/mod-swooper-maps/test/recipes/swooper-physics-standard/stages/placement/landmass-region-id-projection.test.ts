import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "@civ7/adapter";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import { runStandardRecipeTestMap } from "../../fixtures/standard-recipe.js";

describe("placement landmass region projection", () => {
  it("projects landmass regions before typed resources and starts through adapter constants", () => {
    const seed = 1337;
    const callOrder: string[] = [];
    const regionIds: number[] = [];

    const { adapter } = runStandardRecipeTestMap({
      seed,
      mapInfo: {
        PlayersLandmass1: 1,
        PlayersLandmass2: 1,
        StartSectorRows: 1,
        StartSectorCols: 1,
        NumNaturalWonders: 0,
      },
      createAdapter: ({ preset, mapInfo }) => {
        const instrumented = createMockAdapter({
          ...preset.dimensions,
          mapInfo,
          mapSizeId: preset.id,
          rng: createLabelRng(seed),
        });
        const originalSetLandmassRegionId = instrumented.setLandmassRegionId.bind(instrumented);
        instrumented.setLandmassRegionId = (x, y, regionId) => {
          callOrder.push("setLandmassRegionId");
          regionIds.push(regionId);
          originalSetLandmassRegionId(x, y, regionId);
        };
        const originalPlaceResourceIntent = instrumented.placeResourceIntent.bind(instrumented);
        instrumented.placeResourceIntent = (width, height, intent) => {
          callOrder.push("placeResourceIntent");
          return originalPlaceResourceIntent(width, height, intent);
        };
        const originalSetStartPosition = instrumented.setStartPosition.bind(instrumented);
        instrumented.setStartPosition = (plotIndex, playerId) => {
          callOrder.push("setStartPosition");
          originalSetStartPosition(plotIndex, playerId);
        };
        return instrumented;
      },
    });

    const firstProjection = callOrder.indexOf("setLandmassRegionId");
    const firstResourceIntent = callOrder.indexOf("placeResourceIntent");
    const firstStart = callOrder.indexOf("setStartPosition");

    expect(firstProjection).toBeGreaterThanOrEqual(0);
    expect(firstResourceIntent).toBeGreaterThan(firstProjection);
    expect(firstStart).toBeGreaterThan(firstProjection);
    expect(firstResourceIntent).toBeGreaterThan(firstStart);
    expect(adapter.calls.generateOfficialResources.length).toBe(0);
    expect(adapter.calls.setResourceType.length).toBeGreaterThan(0);

    const allowed = new Set([
      adapter.getLandmassId("WEST"),
      adapter.getLandmassId("EAST"),
      adapter.getLandmassId("NONE"),
    ]);
    expect(regionIds.length).toBeGreaterThan(0);
    for (const id of regionIds) expect(allowed.has(id)).toBe(true);
  });
});
