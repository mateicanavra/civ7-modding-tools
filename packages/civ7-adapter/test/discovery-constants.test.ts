import { describe, expect, it } from "bun:test";

import {
  PLACEABLE_DISCOVERY_CATALOG_SYMBOLS,
  resolvePlaceableDiscoveryCatalog,
} from "../src/discovery-constants.js";
import {
  DEFAULT_DISCOVERY_PLACEMENT,
  DISCOVERY_CATALOG,
} from "../src/manual-catalogs/discoveries.js";
import { createMockAdapter } from "../src/mock-adapter.js";

describe("resolvePlaceableDiscoveryCatalog", () => {
  it("resolves adapter-owned symbolic discovery catalog deterministically", () => {
    const ids = new Map<string, number>();
    let nextId = 10;
    const makeHash = (value: string): number => {
      const existing = ids.get(value);
      if (existing != null) return existing;
      const created = nextId++;
      ids.set(value, created);
      return created;
    };

    const result = resolvePlaceableDiscoveryCatalog(makeHash);

    expect(result.length).toBe(PLACEABLE_DISCOVERY_CATALOG_SYMBOLS.length);
    expect(result[0]).toEqual({
      discoveryVisualType: makeHash("IMPROVEMENT_CAVE"),
      discoveryActivationType: makeHash("BASIC"),
    });
    expect(result[1]).toEqual({
      discoveryVisualType: makeHash("IMPROVEMENT_CAVE"),
      discoveryActivationType: makeHash("INVESTIGATION"),
    });
  });

  it("throws when the hasher does not return finite numbers", () => {
    expect(() => resolvePlaceableDiscoveryCatalog(() => Number.NaN)).toThrow(
      /Failed to hash discovery symbol/i
    );
  });

  it("normalizes signed hash outputs into canonical unsigned ids", () => {
    const hashes = new Map<string, number>([
      ["BASIC", 210036031],
      ["INVESTIGATION", -1896217275],
      ["IMPROVEMENT_CAVE", -1607682845],
      ["IMPROVEMENT_RUINS", -1533282399],
      ["IMPROVEMENT_CAMPFIRE", -737502955],
      ["IMPROVEMENT_TENTS", -1522421206],
      ["IMPROVEMENT_PLAZA", -1526635692],
      ["IMPROVEMENT_CAIRN", -1513905947],
      ["IMPROVEMENT_RICH", -1608282526],
      ["IMPROVEMENT_WRECKAGE", 1318962585],
    ]);

    const result = resolvePlaceableDiscoveryCatalog((value) => {
      const hashed = hashes.get(value);
      if (hashed == null) throw new Error(`missing hash for ${value}`);
      return hashed;
    });

    expect(result[0]).toEqual({
      discoveryVisualType: 2687284451,
      discoveryActivationType: 210036031,
    });
    expect(result[1]).toEqual({
      discoveryVisualType: 2687284451,
      discoveryActivationType: 2398750021,
    });
    for (const entry of result) {
      expect(entry.discoveryVisualType).toBeGreaterThanOrEqual(0);
      expect(entry.discoveryVisualType).toBeLessThanOrEqual(0xffffffff);
      expect(entry.discoveryActivationType).toBeGreaterThanOrEqual(0);
      expect(entry.discoveryActivationType).toBeLessThanOrEqual(0xffffffff);
    }
  });
});

describe("manual discovery catalog", () => {
  it("is unsigned and deterministic", () => {
    expect(DISCOVERY_CATALOG).toEqual([
      { discoveryVisualType: 2687284451, discoveryActivationType: 210036031 },
      { discoveryVisualType: 2687284451, discoveryActivationType: 2398750021 },
      { discoveryVisualType: 2761684897, discoveryActivationType: 210036031 },
      { discoveryVisualType: 2761684897, discoveryActivationType: 2398750021 },
      { discoveryVisualType: 3557464341, discoveryActivationType: 210036031 },
      { discoveryVisualType: 3557464341, discoveryActivationType: 2398750021 },
      { discoveryVisualType: 2772546090, discoveryActivationType: 210036031 },
      { discoveryVisualType: 2772546090, discoveryActivationType: 2398750021 },
      { discoveryVisualType: 2768331604, discoveryActivationType: 210036031 },
      { discoveryVisualType: 2768331604, discoveryActivationType: 2398750021 },
      { discoveryVisualType: 2781061349, discoveryActivationType: 210036031 },
      { discoveryVisualType: 2781061349, discoveryActivationType: 2398750021 },
      { discoveryVisualType: 2686684770, discoveryActivationType: 210036031 },
      { discoveryVisualType: 2686684770, discoveryActivationType: 2398750021 },
      { discoveryVisualType: 1318962585, discoveryActivationType: 210036031 },
      { discoveryVisualType: 1318962585, discoveryActivationType: 2398750021 },
    ]);
    expect(DEFAULT_DISCOVERY_PLACEMENT).toEqual(DISCOVERY_CATALOG[0]);
    for (const entry of DISCOVERY_CATALOG) {
      expect(entry.discoveryVisualType).toBeGreaterThanOrEqual(0);
      expect(entry.discoveryVisualType).toBeLessThanOrEqual(0xffffffff);
      expect(entry.discoveryActivationType).toBeGreaterThanOrEqual(0);
      expect(entry.discoveryActivationType).toBeLessThanOrEqual(0xffffffff);
    }
  });

  it("keeps unsigned ids in mock adapter catalog sanitation", () => {
    const adapter = createMockAdapter({
      discoveryCatalog: [
        { discoveryVisualType: -1607682845, discoveryActivationType: -1896217275 },
        { discoveryVisualType: 2687284451, discoveryActivationType: 2398750021 },
      ],
    });

    expect(adapter.getDiscoveryCatalog()).toEqual([
      { discoveryVisualType: 2687284451, discoveryActivationType: 2398750021 },
    ]);
  });
});
