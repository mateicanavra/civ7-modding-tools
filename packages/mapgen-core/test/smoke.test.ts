/**
 * Smoke test - verifies the test infrastructure works
 */

import { describe, it, expect } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { createExtendedMapContext, ctxRandom, snapshotEngineHeightfield } from "../src";

describe("Test Infrastructure", () => {
  it("should have global mocks available", () => {
    expect(GameplayMap).toBeDefined();
    expect(GameplayMap.getGridWidth()).toBe(128);
    expect(GameplayMap.getGridHeight()).toBe(80);
  });

  it("should have GameInfo mocks available", () => {
    expect(GameInfo).toBeDefined();
    expect(GameInfo.Maps.lookup("MAPSIZE_HUGE")).toBeDefined();
  });

});

describe("MockAdapter", () => {
  it("should create a mock adapter with default dimensions", () => {
    const adapter = createMockAdapter();
    expect(adapter.width).toBe(128);
    expect(adapter.height).toBe(80);
  });

  it("should create a mock adapter with custom dimensions", () => {
    const adapter = createMockAdapter({ width: 64, height: 40 });
    expect(adapter.width).toBe(64);
    expect(adapter.height).toBe(40);
  });

  it("should allow setting and getting terrain data", () => {
    const adapter = createMockAdapter({ width: 10, height: 10 });

    // Initial state
    expect(adapter.isWater(5, 5)).toBe(false);
    expect(adapter.getTerrainType(5, 5)).toBe(0);

    // Modify and verify
    adapter.setWater(5, 5, true);
    expect(adapter.isWater(5, 5)).toBe(true);

    adapter.setTerrainType(5, 5, 3);
    expect(adapter.getTerrainType(5, 5)).toBe(3);
  });

  it("should provide deterministic RNG with custom function", () => {
    let callCount = 0;
    const adapter = createMockAdapter({
      rng: (max, _label) => {
        callCount++;
        return callCount % max;
      },
    });

    expect(adapter.getRandomNumber(10, "test")).toBe(1);
    expect(adapter.getRandomNumber(10, "test")).toBe(2);
    expect(adapter.getRandomNumber(10, "test")).toBe(3);
  });
});

describe("ctxRandom", () => {
  it("uses the map env seed instead of adapter RNG", () => {
    let adapterRngCalls = 0;
    const env = {
      seed: 1234,
      dimensions: { width: 4, height: 3 },
      latitudeBounds: { topLatitude: 90, bottomLatitude: -90 },
    };
    const first = createExtendedMapContext(
      env.dimensions,
      createMockAdapter({
        width: env.dimensions.width,
        height: env.dimensions.height,
        rng: () => {
          adapterRngCalls++;
          return 7;
        },
      }),
      env
    );
    const second = createExtendedMapContext(
      env.dimensions,
      createMockAdapter({
        width: env.dimensions.width,
        height: env.dimensions.height,
        rng: () => {
          adapterRngCalls++;
          return 3;
        },
      }),
      env
    );

    expect(ctxRandom(first, "parity", 10_000)).toBe(ctxRandom(second, "parity", 10_000));
    expect(ctxRandom(first, "parity", 10_000)).toBe(ctxRandom(second, "parity", 10_000));
    expect(adapterRngCalls).toBe(0);
  });
});

describe("snapshotEngineHeightfield", () => {
  it("captures final engine classifications in row-major tile order", () => {
    const adapter = createMockAdapter({ width: 3, height: 2 });
    const terrain = 5;
    const biome = 7;
    const feature = 9;
    const resource = 11;
    adapter.setTerrainType(1, 1, terrain);
    adapter.setBiomeType(1, 1, biome);
    adapter.setFeatureType(1, 1, { Feature: feature, Direction: 0, Elevation: 0 });
    adapter.setResourceType(1, 1, resource);

    const context = createExtendedMapContext(
      { width: 3, height: 2 },
      adapter,
      {
        seed: 1,
        dimensions: { width: 3, height: 2 },
        latitudeBounds: { topLatitude: 90, bottomLatitude: -90 },
      }
    );

    const snapshot = snapshotEngineHeightfield(context);
    expect(snapshot).not.toBeNull();
    const idx = 1 + 1 * 3;
    expect(snapshot?.terrain[idx]).toBe(terrain);
    expect(snapshot?.biome[idx]).toBe(biome);
    expect(snapshot?.feature[idx]).toBe(feature);
    expect(snapshot?.resource[idx]).toBe(resource);
  });
});
