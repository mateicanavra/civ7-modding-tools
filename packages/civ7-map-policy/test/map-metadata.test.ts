import { describe, expect, it } from "bun:test";
import type { Static } from "typebox";
import { Value } from "typebox/value";

import {
  admitCiv7StandardMapInfo,
  CIV7_MAP_INFO_BOOLEAN_KEYS,
  CIV7_MAP_INFO_COLUMN_DESCRIPTORS,
  CIV7_MAP_INFO_KEYS,
  CIV7_MAP_INFO_NULLABLE_KEYS,
  CIV7_MAP_INFO_NUMBER_KEYS,
  CIV7_MAP_INFO_STRING_KEYS,
  CIV7_STANDARD_MAP_METADATA_SOURCE,
  CIV7_STANDARD_MAP_SIZE_PRESETS,
  CIV7_STANDARD_ROW_LATITUDE_ENDPOINTS,
  type Civ7MapInfo,
  Civ7MapInfoSchema,
  Civ7StandardMapInfoSchema,
  findCiv7StandardMapSizePreset,
  findCiv7StandardMapSizePresetForMapInfo,
  getCiv7StandardMapSizePreset,
  getCiv7StandardMapSizePresetForDimensions,
  interpolateCiv7RowLatitude,
} from "../src/map-metadata.js";

type SchemaStaticAssignsGeneratedMapInfo =
  Static<typeof Civ7MapInfoSchema> extends Civ7MapInfo ? true : false;
const schemaStaticAssignsGeneratedMapInfo: SchemaStaticAssignsGeneratedMapInfo = true;
void schemaStaticAssignsGeneratedMapInfo;

describe("Civ7 standard map-size policy", () => {
  it("derives the complete typed column inventory from the official gameplay schema", () => {
    const schemaProperties = (Civ7MapInfoSchema as unknown as { properties: object }).properties;
    expect(Object.keys(schemaProperties).sort()).toEqual([...CIV7_MAP_INFO_KEYS].sort());
    expect(
      [
        ...new Set([
          ...CIV7_MAP_INFO_NUMBER_KEYS,
          ...CIV7_MAP_INFO_STRING_KEYS,
          ...CIV7_MAP_INFO_BOOLEAN_KEYS,
        ]),
      ].sort()
    ).toEqual([...CIV7_MAP_INFO_KEYS].sort());
    expect(CIV7_MAP_INFO_COLUMN_DESCRIPTORS.map(({ name }) => name)).toEqual([
      ...CIV7_MAP_INFO_KEYS,
    ]);
    expect(CIV7_MAP_INFO_NULLABLE_KEYS).toEqual(["Description"]);
    expect(CIV7_MAP_INFO_COLUMN_DESCRIPTORS.find(({ name }) => name === "Description")).toEqual({
      name: "Description",
      sqlType: "TEXT",
      nullable: true,
      hasDefault: false,
      defaultValue: null,
    });
    expect(
      CIV7_MAP_INFO_COLUMN_DESCRIPTORS.find(({ name }) => name === "AllOnLargestLandmass")
    ).toEqual({
      name: "AllOnLargestLandmass",
      sqlType: "BOOLEAN",
      nullable: false,
      hasDefault: true,
      defaultValue: false,
    });
  });

  it("owns the closed official catalog in game selection order", () => {
    const expectedIds = [
      "MAPSIZE_TINY",
      "MAPSIZE_SMALL",
      "MAPSIZE_STANDARD",
      "MAPSIZE_LARGE",
      "MAPSIZE_HUGE",
    ] as const;

    expect(CIV7_STANDARD_MAP_SIZE_PRESETS.map(({ id }) => id)).toEqual([...expectedIds]);
    for (const id of expectedIds) {
      const preset = getCiv7StandardMapSizePreset(id);
      expect(preset.id).toBe(id);
      expect(preset.mapInfo.MapSizeType).toBe(id);
      expect(Value.Check(Civ7MapInfoSchema, preset.mapInfo)).toBe(true);
      expect(Value.Check(Civ7StandardMapInfoSchema, preset.mapInfo)).toBe(true);
      expect(preset.mapInfo.DefaultPlayers).toBe(preset.defaultPlayers);
      expect(preset.mapInfo.GridWidth).toBe(preset.dimensions.width);
      expect(preset.mapInfo.GridHeight).toBe(preset.dimensions.height);
      expect(preset.mapInfo).not.toHaveProperty("MinLatitude");
      expect(preset.mapInfo).not.toHaveProperty("MaxLatitude");
      expect(Object.isFrozen(preset)).toBe(true);
      expect(Object.isFrozen(preset.dimensions)).toBe(true);
      expect(Object.isFrozen(preset.rowLatitudeEndpoints)).toBe(true);
      expect(Object.isFrozen(preset.mapInfo)).toBe(true);
    }
    expect(CIV7_STANDARD_MAP_METADATA_SOURCE.files).toEqual([
      "Base/modules/base-standard/data/maps.xml",
      "Base/modules/base-standard/config/config.xml",
    ]);
    expect(CIV7_STANDARD_MAP_METADATA_SOURCE.schema).toBe(
      "Base/Assets/schema/gameplay/01_GameplaySchema.sql"
    );
    expect(CIV7_STANDARD_MAP_METADATA_SOURCE.commit).toMatch(/^[0-9a-f]{40}$/);
    expect(Object.isFrozen(CIV7_STANDARD_MAP_METADATA_SOURCE)).toBe(true);
    expect(Object.isFrozen(CIV7_STANDARD_MAP_METADATA_SOURCE.files)).toBe(true);
    expect(Object.isFrozen(CIV7_MAP_INFO_COLUMN_DESCRIPTORS)).toBe(true);
    expect(CIV7_MAP_INFO_COLUMN_DESCRIPTORS.every(Object.isFrozen)).toBe(true);
    expect(Object.isFrozen(CIV7_MAP_INFO_KEYS)).toBe(true);
    expect(Object.isFrozen(CIV7_STANDARD_MAP_SIZE_PRESETS)).toBe(true);
    expect(Reflect.set(CIV7_MAP_INFO_COLUMN_DESCRIPTORS[0], "name", "Forged")).toBe(false);
    expect(Reflect.set(CIV7_STANDARD_MAP_SIZE_PRESETS[0]!.mapInfo, "GridWidth", 1)).toBe(false);
    expect(CIV7_STANDARD_MAP_SIZE_PRESETS[0]!.mapInfo.GridWidth).toBe(60);
  });

  it("distinguishes a complete custom map row from an official Standard row", () => {
    const custom = {
      ...getCiv7StandardMapSizePreset("MAPSIZE_TINY").mapInfo,
      MapSizeType: "MAPSIZE_CUSTOM",
    };
    expect(Value.Check(Civ7MapInfoSchema, custom)).toBe(true);
    expect(Value.Check(Civ7StandardMapInfoSchema, custom)).toBe(false);
    expect(Value.Check(Civ7MapInfoSchema, { ...custom, GridWidth: 0 })).toBe(false);
    expect(Value.Check(Civ7MapInfoSchema, { ...custom, Unknown: true })).toBe(false);
    expect(Value.Check(Civ7MapInfoSchema, { ...custom, Description: null })).toBe(true);
    expect(Value.Check(Civ7MapInfoSchema, { ...custom, Name: null })).toBe(false);
  });

  it("admits a detached complete Standard row from the generated schema", () => {
    const source = { ...getCiv7StandardMapSizePreset("MAPSIZE_TINY").mapInfo };
    const admitted = admitCiv7StandardMapInfo(source);

    source.GridWidth = 1;
    expect(admitted.GridWidth).toBe(60);
    expect(Object.isFrozen(admitted)).toBe(true);
    expect(() => admitCiv7StandardMapInfo({ ...admitted, Name: "" })).toThrow(
      "complete generated column schema"
    );
  });

  it("resolves runtime row identity independently from dimension validation", () => {
    const standard = getCiv7StandardMapSizePreset("MAPSIZE_STANDARD");
    expect(findCiv7StandardMapSizePreset("MAPSIZE_STANDARD")).toBe(standard);
    expect(findCiv7StandardMapSizePresetForMapInfo({ MapSizeType: "MAPSIZE_STANDARD" })).toBe(
      standard
    );
    expect(getCiv7StandardMapSizePresetForDimensions(84, 54)).toBe(standard);
    expect(findCiv7StandardMapSizePreset("MAPSIZE_CUSTOM")).toBeNull();
    expect(findCiv7StandardMapSizePreset(3)).toBeNull();
    expect(findCiv7StandardMapSizePresetForMapInfo({})).toBeNull();
    expect(findCiv7StandardMapSizePresetForMapInfo({ MapSizeType: "MAPSIZE_CUSTOM" })).toBeNull();
    expect(getCiv7StandardMapSizePresetForDimensions(1, 1)).toBeNull();
  });

  it("names row-coordinate latitude endpoints without impersonating map setup bounds", () => {
    expect(CIV7_STANDARD_ROW_LATITUDE_ENDPOINTS).toEqual({
      firstRowLatitude: -90,
      exclusiveEndLatitude: 90,
    });
    expect(interpolateCiv7RowLatitude(CIV7_STANDARD_ROW_LATITUDE_ENDPOINTS, 4, 0)).toBe(-90);
    expect(interpolateCiv7RowLatitude(CIV7_STANDARD_ROW_LATITUDE_ENDPOINTS, 4, 3)).toBe(45);
    expect(getCiv7StandardMapSizePreset("MAPSIZE_TINY")).not.toHaveProperty("latitudeBounds");
  });
});
