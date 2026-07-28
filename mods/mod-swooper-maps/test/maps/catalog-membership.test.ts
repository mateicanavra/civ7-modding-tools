import { describe, expect, it } from "vitest";
import {
  admitMapConfigCatalogIds,
  MAP_CONFIG_CATALOG_IDS,
} from "../../src/maps/catalog/membership";

describe("Swooper catalog membership", () => {
  it("is an ordered unique list of shipped config ids", () => {
    const entries = admitMapConfigCatalogIds(MAP_CONFIG_CATALOG_IDS);

    expect(entries).toEqual(MAP_CONFIG_CATALOG_IDS);
    expect(entries.every((entry) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry))).toBe(true);
    expect(new Set(entries)).toHaveLength(entries.length);
  });

  it("keeps transient Studio current out of durable catalog membership", () => {
    expect(MAP_CONFIG_CATALOG_IDS).not.toContain("studio-current");
  });

  it("rejects duplicate and malformed config-id membership", () => {
    const [first] = MAP_CONFIG_CATALOG_IDS;
    expect(() =>
      admitMapConfigCatalogIds([first, first, "not a config id", { id: first }])
    ).toThrow(/duplicates membership\[0\][\s\S]*lowercase kebab-case map config id/);
  });
});
