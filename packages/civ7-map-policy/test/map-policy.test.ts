import { describe, expect, it } from "bun:test";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import {
  CIV7_BROWSER_TABLES_V0,
  CIV7_COAST_CLASSIFICATION_POLICY_V0,
  CIV7_RIVER_TYPE_METADATA_SOURCE,
  CIV7_RIVER_TYPES_V0,
  NATURAL_WONDER_CATALOG,
  NO_RIVER_TYPE,
  RESOURCE_ADJACENT_TO_LAND_RUNTIME_OPTIONAL_TYPE_IDS,
  RIVER_TYPE_MINOR,
  RIVER_TYPE_NAVIGABLE,
  WATER_CLASS_COAST,
  WATER_CLASS_OCEAN,
  applyCiv7CoastClassificationPolicy,
  getNaturalWonderFootprintIndices,
  isResourceAdjacentToLandRuntimeOptional,
  resolveNaturalWonderMaterializationDirection,
  resolveNaturalWonderPlacementDirection,
} from "../src/index.js";
import { CIV7_BROWSER_TABLES_V0 as STUDIO_CIV7_BROWSER_TABLES_V0 } from "../../../apps/mapgen-studio/src/civ7-data/civ7-tables.gen.js";

function listSourceFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];
  for (const entry of entries) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      files.push(...listSourceFiles(path));
      continue;
    }
    if (path.endsWith(".ts")) files.push(path);
  }
  return files;
}

describe("@civ7/map-policy", () => {
  it("has no runtime dependency on adapter, mapgen-core, mods, Studio, or base-standard imports", () => {
    const sourceRoot = join(import.meta.dir, "../src");
    const forbiddenImports = [
      "@civ7/adapter",
      "@swooper/mapgen-core",
      "mod-swooper-maps",
      "mapgen-studio",
      `/base-${"standard"}/`,
    ];
    const violations: string[] = [];
    for (const file of listSourceFiles(sourceRoot)) {
      const source = readFileSync(file, "utf8");
      const imports = [...source.matchAll(/\b(?:import|export)\s+(?:type\s+)?(?:[^"']*?\s+from\s+)?["']([^"']+)["']/g)];
      for (const [, specifier] of imports) {
        for (const token of forbiddenImports) {
          if (specifier?.includes(token)) violations.push(`${file}:${specifier}`);
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it("owns the generated Civ7 map policy table", () => {
    expect(CIV7_BROWSER_TABLES_V0.mapGlobals.polarWaterRows).toBe(2);
    expect(CIV7_BROWSER_TABLES_V0.mapGlobals.oceanWaterColumns).toBe(4);
    expect(CIV7_BROWSER_TABLES_V0.source).toContain("Base/modules/base-standard/maps/map-globals.js");
    expect(CIV7_BROWSER_TABLES_V0.featureTypes.FEATURE_BERMUDA_TRIANGLE).toBe(0);
    expect(CIV7_BROWSER_TABLES_V0.resourceTypes.RESOURCE_PITCH).toBe(54);
    expect(CIV7_BROWSER_TABLES_V0.riverTypes.values.RIVER_MINOR).toBe(0);
  });

  it("owns live-observed Civ7 river type metadata values", () => {
    expect(CIV7_BROWSER_TABLES_V0.riverTypes).toEqual(CIV7_RIVER_TYPE_METADATA_SOURCE);
    expect(CIV7_RIVER_TYPES_V0).toBe(CIV7_BROWSER_TABLES_V0.riverTypes);
    expect(CIV7_RIVER_TYPES_V0.values).toEqual({
      NO_RIVER: -1,
      RIVER_MINOR: 0,
      RIVER_NAVIGABLE: 1,
    });
    expect(NO_RIVER_TYPE).toBe(-1);
    expect(RIVER_TYPE_MINOR).toBe(0);
    expect(RIVER_TYPE_NAVIGABLE).toBe(1);
    expect(CIV7_RIVER_TYPES_V0.source).toContain("live-direct-control:2026-06-09:RiverTypes");
    expect(CIV7_RIVER_TYPES_V0.source).toContain("Base/modules/base-standard/data/unit-movement.xml");
    expect(CIV7_RIVER_TYPES_V0.source).toContain(
      "Base/modules/base-standard/ui-next/tooltips/plot-tooltip/helpers.js"
    );
  });

  it("keeps generated map-policy and Studio river metadata catalogs in sync", () => {
    expect(CIV7_BROWSER_TABLES_V0.riverTypes).toEqual(CIV7_RIVER_TYPE_METADATA_SOURCE);
    expect(STUDIO_CIV7_BROWSER_TABLES_V0.riverTypes).toEqual(
      CIV7_RIVER_TYPE_METADATA_SOURCE
    );
  });

  it("labels generated Civ7 table inputs as source evidence rather than repo truth", () => {
    const generatedTables = [
      join(import.meta.dir, "../src/civ7-tables.gen.ts"),
      join(import.meta.dir, "../../../apps/mapgen-studio/src/civ7-data/civ7-tables.gen.ts"),
    ];

    for (const path of generatedTables) {
      const source = readFileSync(path, "utf8");
      expect(source).toContain("Source evidence:");
      expect(source).not.toContain("Source of truth: Civ7 official");
      expect(source).not.toContain("Source of truth: `Base/modules/base-standard/data/terrain.xml`");
    }
  });

  it("keeps ambient Civ7 runtime RiverTypes declarations generated from the same source", () => {
    const dts = readFileSync(
      join(import.meta.dir, "../../civ7-types/generated/river-types.gen.d.ts"),
      "utf8"
    );

    for (const source of CIV7_RIVER_TYPE_METADATA_SOURCE.source) {
      expect(dts).toContain(source);
    }
    for (const [key, value] of Object.entries(CIV7_RIVER_TYPE_METADATA_SOURCE.values)) {
      expect(dts).toContain(`readonly ${key}: ${value};`);
    }
  });

  it("classifies coast buffers with the policy-owned odd-q projection", () => {
    const width = 5;
    const height = 3;
    const waterClass = new Uint8Array(width * height).fill(WATER_CLASS_OCEAN);
    waterClass[1 * width + 1] = WATER_CLASS_COAST;

    const result = applyCiv7CoastClassificationPolicy({
      width,
      height,
      waterClass,
      coastBufferTiles: 1,
    });

    expect(result.promotedOceanToCoast).toBeGreaterThan(0);
    expect(result.waterClass[1 * width + 2]).toBe(WATER_CLASS_COAST);
    expect(CIV7_COAST_CLASSIFICATION_POLICY_V0.source).toContain(
      "Base/modules/base-standard/maps/map-globals.js"
    );
  });

  it("models supported natural-wonder footprints and filters unsupported catalog entries", () => {
    const { featureTypes } = CIV7_BROWSER_TABLES_V0;
    const policies = CIV7_BROWSER_TABLES_V0.featurePolicies as Record<
      string,
      { placementClass?: string; naturalWonderTiles?: number; naturalWonderDirection?: number }
    >;
    const catalogFeatureTypes = NATURAL_WONDER_CATALOG.map((entry) => entry.featureType);

    expect(catalogFeatureTypes).not.toContain(featureTypes.FEATURE_BARRIER_REEF);
    expect(catalogFeatureTypes).toContain(featureTypes.FEATURE_REDWOOD_FOREST);
    expect(catalogFeatureTypes).toContain(featureTypes.FEATURE_MACHAPUCHARE);
    expect(catalogFeatureTypes).toContain(featureTypes.FEATURE_MOUNT_FUJI);
    expect(catalogFeatureTypes).toContain(featureTypes.FEATURE_VIHREN);
    const redwoodPolicy = policies[String(featureTypes.FEATURE_REDWOOD_FOREST)]!;
    expect(resolveNaturalWonderPlacementDirection(redwoodPolicy)).toBe(-1);
    expect(resolveNaturalWonderMaterializationDirection(redwoodPolicy)).toBe(0);
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
  });

  it("records the live-observed adjacent-land resource exception narrowly", () => {
    const { resourceTypes } = CIV7_BROWSER_TABLES_V0;

    expect(RESOURCE_ADJACENT_TO_LAND_RUNTIME_OPTIONAL_TYPE_IDS).toEqual([
      resourceTypes.RESOURCE_DYES,
      resourceTypes.RESOURCE_FISH,
      resourceTypes.RESOURCE_PEARLS,
      resourceTypes.RESOURCE_COWRIE,
      resourceTypes.RESOURCE_TURTLES,
    ]);
    expect(isResourceAdjacentToLandRuntimeOptional(resourceTypes.RESOURCE_FISH)).toBe(true);
    expect(isResourceAdjacentToLandRuntimeOptional(resourceTypes.RESOURCE_WHALES)).toBe(false);
    expect(isResourceAdjacentToLandRuntimeOptional(resourceTypes.RESOURCE_CRABS)).toBe(false);
  });

});
