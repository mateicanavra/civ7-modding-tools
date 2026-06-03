import { describe, expect, it } from "bun:test";

import {
  CIV7_BROWSER_TABLES_V0,
  CIV7_MAP_INFO_BY_TYPE,
  DEFAULT_CIV7_MAP_LATITUDE_BOUNDS,
  NATURAL_WONDER_CATALOG,
  createMockAdapter,
  getCiv7MapInfo,
  getCiv7MapInfoByDimensions,
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

    expect(NATURAL_WONDER_CATALOG.length).toBeGreaterThanOrEqual(
      CIV7_MAP_INFO_BY_TYPE.MAPSIZE_STANDARD.NumNaturalWonders
    );
    expect(catalog).toEqual(NATURAL_WONDER_CATALOG);
  });

  it("lets mock natural-wonder stamping overwrite existing feature stamps", () => {
    const adapter = createMockAdapter({ width: 4, height: 4 });
    adapter.setFeatureType(1, 1, {
      Feature: CIV7_BROWSER_TABLES_V0.featureTypes.FEATURE_FOREST,
      Direction: 0,
      Elevation: 0,
    });

    const featureType = NATURAL_WONDER_CATALOG[0]?.featureType ?? -1;
    expect(adapter.stampNaturalWonder(1, 1, featureType, 0, 120)).toBe(true);
    expect(adapter.getFeatureType(1, 1)).toBe(featureType);
  });
});
