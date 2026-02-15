import { describe, expect, it } from "bun:test";

import { DISCOVERY_CATALOG } from "../src/manual-catalogs/discoveries.js";
import { createMockAdapter } from "../src/mock-adapter.js";

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
