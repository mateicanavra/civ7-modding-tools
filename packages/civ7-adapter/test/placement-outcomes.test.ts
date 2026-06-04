import { describe, expect, it } from "bun:test";

import { CIV7_BROWSER_TABLES_V0 } from "../src/civ7-tables.gen.js";
import { createMockAdapter } from "../src/mock-adapter.js";

/**
 * Adapter outcome tests live at the adapter boundary by design.
 *
 * Recipes should exercise placement through recipe execution, but the adapter
 * package still needs direct unit coverage for the typed reconciliation contract
 * it exposes to every map type.
 */
describe("typed placement outcomes", () => {
  it("uses generated static feature legality in the mock adapter", () => {
    const { biomeGlobals, featureTypes, terrainTypeIndices } = CIV7_BROWSER_TABLES_V0;
    const adapter = createMockAdapter({
      width: 4,
      height: 3,
      defaultBiomeType: biomeGlobals.BIOME_TROPICAL,
      defaultTerrainType: terrainTypeIndices.TERRAIN_FLAT,
    });

    expect(adapter.canHaveFeature(1, 1, featureTypes.FEATURE_REDWOOD_FOREST)).toBe(false);
    adapter.setBiome(1, 1, biomeGlobals.BIOME_GRASSLAND);
    expect(adapter.canHaveFeature(1, 1, featureTypes.FEATURE_REDWOOD_FOREST)).toBe(true);

    expect(adapter.canHaveFeature(2, 1, featureTypes.FEATURE_BARRIER_REEF)).toBe(false);
    adapter.setTerrainType(2, 1, terrainTypeIndices.TERRAIN_COAST);
    adapter.setBiome(2, 1, biomeGlobals.BIOME_MARINE);
    expect(adapter.canHaveFeature(2, 1, featureTypes.FEATURE_BARRIER_REEF)).toBe(true);

    adapter.setTerrainType(3, 1, terrainTypeIndices.TERRAIN_MOUNTAIN);
    adapter.setBiome(3, 1, biomeGlobals.BIOME_GRASSLAND);
    expect(adapter.canHaveFeature(3, 1, featureTypes.FEATURE_HOERIKWAGGO)).toBe(true);
  });

  it("uses generated static resource legality in the mock adapter", () => {
    const { biomeGlobals, resourceTypes, terrainTypeIndices } = CIV7_BROWSER_TABLES_V0;
    const adapter = createMockAdapter({
      width: 5,
      height: 3,
      defaultBiomeType: biomeGlobals.BIOME_MARINE,
      defaultTerrainType: terrainTypeIndices.TERRAIN_OCEAN,
    });

    adapter.setTerrainType(2, 1, terrainTypeIndices.TERRAIN_COAST);
    adapter.setBiome(2, 1, biomeGlobals.BIOME_MARINE);
    expect(adapter.canHaveResource(2, 1, resourceTypes.RESOURCE_FISH)).toBe(false);

    adapter.setTerrainType(1, 1, terrainTypeIndices.TERRAIN_FLAT);
    adapter.setBiome(1, 1, biomeGlobals.BIOME_GRASSLAND);
    expect(adapter.canHaveResource(2, 1, resourceTypes.RESOURCE_FISH)).toBe(true);
    expect(adapter.canHaveResource(1, 1, resourceTypes.RESOURCE_IRON)).toBe(false);

    adapter.setTerrainType(1, 1, terrainTypeIndices.TERRAIN_HILL);
    expect(adapter.canHaveResource(1, 1, resourceTypes.RESOURCE_IRON)).toBe(true);
  });

  it("returns placed resource outcomes with readback evidence", () => {
    const { biomeGlobals, resourceTypes, terrainTypeIndices } = CIV7_BROWSER_TABLES_V0;
    const adapter = createMockAdapter({
      width: 4,
      height: 3,
      defaultBiomeType: biomeGlobals.BIOME_GRASSLAND,
      defaultTerrainType: terrainTypeIndices.TERRAIN_HILL,
    });

    const outcome = adapter.placeResourceIntent(4, 3, {
      plotIndex: 5,
      resourceType: resourceTypes.RESOURCE_GOLD,
    });

    expect(outcome).toEqual({
      status: "placed",
      plotIndex: 5,
      x: 1,
      y: 1,
      resourceType: resourceTypes.RESOURCE_GOLD,
      observedResourceType: resourceTypes.RESOURCE_GOLD,
    });
    expect(adapter.getResourceType(1, 1)).toBe(resourceTypes.RESOURCE_GOLD);
  });

  it("returns typed resource rejections without mutating the tile", () => {
    const adapter = createMockAdapter({
      width: 4,
      height: 3,
      canHaveResource: () => false,
    });

    const outcome = adapter.placeResourceIntent(4, 3, {
      plotIndex: 5,
      resourceType: 7,
    });

    expect(outcome).toEqual({
      status: "rejected",
      plotIndex: 5,
      x: 1,
      y: 1,
      resourceType: 7,
      reason: "cannot-have-resource",
      observedResourceType: adapter.NO_RESOURCE,
    });
    expect(adapter.calls.setResourceType.length).toBe(0);
  });

  it("returns typed discovery outcomes and structural rejections", () => {
    const adapter = createMockAdapter({ width: 4, height: 3 });

    const placed = adapter.placeDiscoveryIntent(4, 3, {
      plotIndex: 6,
      discoveryVisualType: 2687284451,
      discoveryActivationType: 2398750021,
    });
    const rejected = adapter.placeDiscoveryIntent(4, 3, {
      plotIndex: -1,
      discoveryVisualType: 2687284451,
      discoveryActivationType: 2398750021,
    });

    expect(placed).toEqual({
      status: "placed",
      plotIndex: 6,
      x: 2,
      y: 1,
      discoveryVisualType: 2687284451,
      discoveryActivationType: 2398750021,
    });
    expect(rejected).toMatchObject({
      status: "rejected",
      reason: "out-of-bounds",
    });
  });
});
