import { describe, expect, it } from "bun:test";

import {
  PLACEABLE_DISCOVERY_CATALOG_SYMBOLS,
  resolvePlaceableDiscoveryCatalog,
} from "../src/discovery-constants.js";

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
});
