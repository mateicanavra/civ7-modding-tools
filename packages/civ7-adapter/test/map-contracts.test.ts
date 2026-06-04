import { describe, expect, it } from "bun:test";

import {
  CIV7_BROWSER_TABLES_V0,
  CIV7_MAP_INFO_BY_TYPE,
  DEFAULT_CIV7_MAP_LATITUDE_BOUNDS,
  NATURAL_WONDER_CATALOG,
  createMockAdapter,
  getCiv7MapInfo,
  getCiv7MapInfoByDimensions,
  getNaturalWonderFootprintIndices,
  resolveNaturalWonderPlacementDirection,
} from "../src/index.js";

describe("Civ7 map metadata contracts", () => {
  it("captures live Standard map info used by Civ7 setup", () => {
    const standard = CIV7_MAP_INFO_BY_TYPE.MAPSIZE_STANDARD;

    expect(getCiv7MapInfo("MAPSIZE_STANDARD")).toBe(standard);
    expect(getCiv7MapInfo(-2055278946)).toBe(standard);
    expect(getCiv7MapInfoByDimensions(84, 54)).toBe(standard);

    expect(standard.DefaultPlayers).toBe(8);
    expect(standard.PlayersLandmass1).toBe(5);
    expect(standard.PlayersLandmass2).toBe(3);
    expect(standard.StartSectorRows).toBe(4);
    expect(standard.StartSectorCols).toBe(3);
    expect(standard.NumNaturalWonders).toBe(5);
  });

  it("matches live GameInfo feature ordering including natural-wonder prefixes and DLC tails", () => {
    expect(CIV7_BROWSER_TABLES_V0.featureTypes.FEATURE_BERMUDA_TRIANGLE).toBe(0);
    expect(CIV7_BROWSER_TABLES_V0.featureTypes.FEATURE_MOUNT_EVEREST).toBe(1);
    expect(CIV7_BROWSER_TABLES_V0.featureTypes.FEATURE_SAGEBRUSH_STEPPE).toBe(2);
    expect(CIV7_BROWSER_TABLES_V0.featureTypes.FEATURE_VOLCANO).toBe(25);
    expect(CIV7_BROWSER_TABLES_V0.featureTypes.FEATURE_MACHAPUCHARE).toBe(40);
    expect(CIV7_BROWSER_TABLES_V0.featureTypes.FEATURE_GREAT_BLUE_HOLE).toBe(44);
    expect(CIV7_BROWSER_TABLES_V0.featureTypes.FEATURE_MAPU_A_VAEA_BLOWHOLES).toBe(45);
  });

  it("extracts static base-standard map policy constants for mock generation", () => {
    expect(CIV7_BROWSER_TABLES_V0.mapGlobals.polarWaterRows).toBe(2);
    expect(CIV7_BROWSER_TABLES_V0.mapGlobals.oceanWaterColumns).toBe(4);
    expect(CIV7_BROWSER_TABLES_V0.source).toContain("Base/modules/base-standard/maps/map-globals.js");
  });

  it("extracts static feature valid-terrain policy rows for natural wonders", () => {
    const { biomeGlobals, featureTypes, terrainTypeIndices } = CIV7_BROWSER_TABLES_V0;
    const validTerrainByFeature =
      CIV7_BROWSER_TABLES_V0.featureValidTerrainTypeIndices as Record<string, readonly number[]>;
    const validBiomeByFeature =
      CIV7_BROWSER_TABLES_V0.featureValidBiomeTypeIndices as Record<string, readonly number[]>;
    const featurePolicies = CIV7_BROWSER_TABLES_V0.featurePolicies as Record<
      string,
      {
        minimumElevation?: number;
        noLake: boolean;
        naturalWonderTiles?: number;
        naturalWonderPlaceFirst?: boolean;
      }
    >;
    const featureTags = CIV7_BROWSER_TABLES_V0.featureTagsByFeatureType as Record<
      string,
      readonly string[]
    >;

    expect(validTerrainByFeature[String(featureTypes.FEATURE_GULLFOSS)]).toEqual([
      terrainTypeIndices.TERRAIN_HILL,
    ]);
    expect(validTerrainByFeature[String(featureTypes.FEATURE_BARRIER_REEF)]).toEqual([
      terrainTypeIndices.TERRAIN_COAST,
    ]);
    expect(validTerrainByFeature[String(featureTypes.FEATURE_MOUNT_EVEREST)]).toEqual([
      terrainTypeIndices.TERRAIN_MOUNTAIN,
    ]);
    expect(validTerrainByFeature[String(featureTypes.FEATURE_BERMUDA_TRIANGLE)]).toEqual([
      terrainTypeIndices.TERRAIN_OCEAN,
    ]);
    expect(validBiomeByFeature[String(featureTypes.FEATURE_REDWOOD_FOREST)]).toEqual([
      biomeGlobals.BIOME_GRASSLAND,
    ]);
    expect(validBiomeByFeature[String(featureTypes.FEATURE_GRAND_CANYON)]).toEqual([
      biomeGlobals.BIOME_DESERT,
    ]);
    expect(featurePolicies[String(featureTypes.FEATURE_GRAND_CANYON)].minimumElevation).toBe(350);
    expect(featurePolicies[String(featureTypes.FEATURE_BARRIER_REEF)].naturalWonderTiles).toBe(4);
    expect(
      featurePolicies[String(featureTypes.FEATURE_VALLEY_OF_FLOWERS)].naturalWonderPlaceFirst
    ).toBe(true);
    expect(featureTags[String(featureTypes.FEATURE_BARRIER_REEF)]).toContain("ADJACENTTOLAND");
    expect(featureTags[String(featureTypes.FEATURE_REDWOOD_FOREST)]).toEqual(["FEATURE_FOREST"]);
  });

  it("extracts static resource placement policy rows for mock legality", () => {
    const { biomeGlobals, featureTypes, resourceTypes, terrainTypeIndices } = CIV7_BROWSER_TABLES_V0;
    const validRowsByResource = CIV7_BROWSER_TABLES_V0.resourceValidPlacementRows as Record<
      string,
      readonly (readonly [number, number, number])[]
    >;
    const flagsByResource = CIV7_BROWSER_TABLES_V0.resourcePlacementFlags as Record<
      string,
      { adjacentToLand: boolean; lakeEligible: boolean }
    >;

    expect(resourceTypes.RESOURCE_COTTON).toBe(0);
    expect(resourceTypes.RESOURCE_CRABS).toBe(51);
    expect(resourceTypes.RESOURCE_PITCH).toBe(54);
    expect(validRowsByResource[String(resourceTypes.RESOURCE_FISH)]).toEqual([
      [biomeGlobals.BIOME_MARINE, terrainTypeIndices.TERRAIN_COAST, -1],
    ]);
    expect(validRowsByResource[String(resourceTypes.RESOURCE_IRON)]).toContainEqual([
      biomeGlobals.BIOME_GRASSLAND,
      terrainTypeIndices.TERRAIN_HILL,
      -1,
    ]);
    expect(validRowsByResource[String(resourceTypes.RESOURCE_CLAY)]).toContainEqual([
      biomeGlobals.BIOME_TUNDRA,
      terrainTypeIndices.TERRAIN_FLAT,
      featureTypes.FEATURE_TUNDRA_BOG,
    ]);
    expect(flagsByResource[String(resourceTypes.RESOURCE_FISH)].adjacentToLand).toBe(true);
    expect(flagsByResource[String(resourceTypes.RESOURCE_WHALES)].lakeEligible).toBe(false);
  });

  it("mimics Civ7 south-at-row-zero latitude readback in the mock adapter", () => {
    const adapter = createMockAdapter({
      width: 84,
      height: 54,
      latitudeBounds: DEFAULT_CIV7_MAP_LATITUDE_BOUNDS,
    });

    expect(adapter.getLatitude(0, 0)).toBe(-90);
    expect(adapter.getLatitude(42, 27)).toBe(0);
    expect(adapter.getLatitude(0, 53)).toBe(86);
  });

  it("uses the adapter-owned natural-wonder catalog in mock runs", () => {
    const adapter = createMockAdapter({ width: 84, height: 54 });
    const catalog = adapter.getNaturalWonderCatalog();
    const catalogFeatureTypes = catalog.map((entry) => entry.featureType);

    expect(NATURAL_WONDER_CATALOG.length).toBeGreaterThanOrEqual(
      CIV7_MAP_INFO_BY_TYPE.MAPSIZE_STANDARD.NumNaturalWonders
    );
    expect(catalog).toEqual(NATURAL_WONDER_CATALOG);
    expect(catalogFeatureTypes).not.toContain(
      CIV7_BROWSER_TABLES_V0.featureTypes.FEATURE_BARRIER_REEF
    );
    expect(catalogFeatureTypes).not.toContain(
      CIV7_BROWSER_TABLES_V0.featureTypes.FEATURE_VALLEY_OF_FLOWERS
    );
    expect(catalogFeatureTypes).toContain(CIV7_BROWSER_TABLES_V0.featureTypes.FEATURE_GULLFOSS);
    expect(catalogFeatureTypes).toContain(CIV7_BROWSER_TABLES_V0.featureTypes.FEATURE_IGUAZU_FALLS);
    expect(catalogFeatureTypes).toContain(
      CIV7_BROWSER_TABLES_V0.featureTypes.FEATURE_REDWOOD_FOREST
    );
    expect(catalogFeatureTypes).toContain(CIV7_BROWSER_TABLES_V0.featureTypes.FEATURE_KILIMANJARO);
    expect(catalogFeatureTypes).toContain(CIV7_BROWSER_TABLES_V0.featureTypes.FEATURE_ZHANGJIAJIE);
    expect(catalogFeatureTypes).toContain(
      CIV7_BROWSER_TABLES_V0.featureTypes.FEATURE_TORRES_DEL_PAINE
    );
    expect(catalogFeatureTypes).toContain(CIV7_BROWSER_TABLES_V0.featureTypes.FEATURE_ULURU);
    expect(
      catalog.find(
        (entry) => entry.featureType === CIV7_BROWSER_TABLES_V0.featureTypes.FEATURE_REDWOOD_FOREST
      )?.direction
    ).toBe(-1);
  });

  it("models supported natural-wonder footprints with Civ7 direction offsets", () => {
    const { featureTypes } = CIV7_BROWSER_TABLES_V0;
    const policies = CIV7_BROWSER_TABLES_V0.featurePolicies as Record<
      string,
      { placementClass?: string; naturalWonderTiles?: number; naturalWonderDirection?: number }
    >;

    const redwoodPolicy = policies[String(featureTypes.FEATURE_REDWOOD_FOREST)]!;
    expect(resolveNaturalWonderPlacementDirection(redwoodPolicy)).toBe(-1);
    expect(
      getNaturalWonderFootprintIndices({
        x: 64,
        y: 13,
        width: 84,
        height: 54,
        policy: redwoodPolicy,
        direction: -1,
      })?.map((plotIndex) => ({ x: plotIndex % 84, y: Math.trunc(plotIndex / 84) }))
    ).toEqual([
      { x: 64, y: 13 },
      { x: 65, y: 14 },
      { x: 65, y: 13 },
    ]);

    expect(
      getNaturalWonderFootprintIndices({
        x: 24,
        y: 11,
        width: 84,
        height: 54,
        policy: policies[String(featureTypes.FEATURE_VALLEY_OF_FLOWERS)]!,
        direction: -1,
      })?.map((plotIndex) => ({ x: plotIndex % 84, y: Math.trunc(plotIndex / 84) }))
    ).toEqual([
      { x: 24, y: 11 },
      { x: 25, y: 12 },
    ]);
  });

  it("rejects mock natural-wonder stamping on occupied feature slots", () => {
    const { biomeGlobals, terrainTypeIndices } = CIV7_BROWSER_TABLES_V0;
    const adapter = createMockAdapter({
      width: 4,
      height: 4,
      defaultBiomeType: biomeGlobals.BIOME_MARINE,
      defaultTerrainType: terrainTypeIndices.TERRAIN_COAST,
    });
    adapter.setFeatureType(1, 1, {
      Feature: CIV7_BROWSER_TABLES_V0.featureTypes.FEATURE_FOREST,
      Direction: 0,
      Elevation: 0,
    });

    const featureType = NATURAL_WONDER_CATALOG[0]?.featureType ?? -1;
    expect(adapter.stampNaturalWonder(1, 1, featureType, 0, 120)).toBe(false);
    expect(adapter.getFeatureType(1, 1)).toBe(CIV7_BROWSER_TABLES_V0.featureTypes.FEATURE_FOREST);
  });
});
