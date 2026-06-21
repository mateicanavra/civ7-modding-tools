import { describe, expect, it } from "bun:test";

import { CIV7_BROWSER_TABLES_V0, NATURAL_WONDER_CATALOG } from "@civ7/map-policy";

import { createMockAdapter } from "../src/mock-adapter.js";

describe("natural-wonder catalog", () => {
  it("uses the shared map-policy supported catalog for adapter defaults", () => {
    const { featureTypes } = CIV7_BROWSER_TABLES_V0;
    const adapter = createMockAdapter();

    expect(adapter.getNaturalWonderCatalog()).toEqual(NATURAL_WONDER_CATALOG);
    // Previously-dropped 4-tile wonders are now placement-eligible (full 20 set).
    expect(NATURAL_WONDER_CATALOG.map((entry) => entry.featureType)).toContain(
      featureTypes.FEATURE_BARRIER_REEF
    );
  });
});
