import { describe, expect, it } from "vitest";
import { CatalogSourceIndex } from "../../src/maps/catalog/sourceIndex";
import {
  CATALOG_CONFIG_PATH_PREFIX,
  readCatalogSourceIndex,
  validateCatalogSourceIndex,
} from "../../src/maps/catalog/sources";

describe("Swooper catalog source index", () => {
  it("is an ordered path-only membership list", () => {
    const knownConfigPaths = new Set(CatalogSourceIndex);
    const entries = readCatalogSourceIndex({ knownConfigPaths });

    expect(entries).toEqual(CatalogSourceIndex);
    expect(entries.every((entry) => entry.startsWith(CATALOG_CONFIG_PATH_PREFIX))).toBe(true);
    expect(new Set(entries)).toHaveLength(entries.length);
  });

  it("keeps transient Studio current out of durable catalog membership", () => {
    expect(CatalogSourceIndex).not.toContain(
      "mods/mod-swooper-maps/src/maps/configs/studio-current.config.json"
    );
  });

  it("rejects duplicate, unresolved, and non-path membership entries", () => {
    const first = CatalogSourceIndex[0];
    const missing = `${CATALOG_CONFIG_PATH_PREFIX}missing-config.config.json`;
    const errors = validateCatalogSourceIndex([first, first, missing, { sourcePath: first }], {
      knownConfigPaths: new Set(CatalogSourceIndex),
    });

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining("duplicates CatalogSourceIndex[0]"),
        expect.stringContaining("does not resolve in the repository"),
        expect.stringContaining("must be a non-empty config path string"),
      ])
    );
  });
});
