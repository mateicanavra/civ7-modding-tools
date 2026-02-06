import { describe, expect, it } from "vitest";
import type { LayerVariant } from "../../src/features/viz/dataTypeModel";
import { findVariantIdForEra, listEraVariants, parseEraVariantKey } from "../../src/features/viz/era";

function makeVariant(variantId: string, variantKey: string | null): LayerVariant {
  return {
    variantId,
    label: variantId,
    layerKey: `layer:${variantId}`,
    layer: {
      variantKey,
    } as any,
  };
}

describe("parseEraVariantKey", () => {
  it("parses era keys and ignores other dimensions", () => {
    expect(parseEraVariantKey("era:1")).toBe(1);
    expect(parseEraVariantKey("era:01")).toBe(1);
    expect(parseEraVariantKey("season:1")).toBe(null);
    expect(parseEraVariantKey("snapshot:latest")).toBe(null);
    expect(parseEraVariantKey("era:0")).toBe(null);
    expect(parseEraVariantKey("era:-2")).toBe(null);
  });
});

describe("listEraVariants", () => {
  it("returns sorted era entries from a variant list", () => {
    const variants = [
      makeVariant("snapshot:latest", "snapshot:latest"),
      makeVariant("era:2", "era:2"),
      makeVariant("era:1", "era:1"),
    ];
    const eras = listEraVariants(variants);
    expect(eras.map((entry) => entry.era)).toEqual([1, 2]);
    expect(eras.map((entry) => entry.variantId)).toEqual(["era:1", "era:2"]);
  });
});

describe("findVariantIdForEra", () => {
  it("finds a variantId by era number", () => {
    const variants = [makeVariant("era:3", "era:3"), makeVariant("snapshot:latest", "snapshot:latest")];
    expect(findVariantIdForEra(variants, 3)).toBe("era:3");
    expect(findVariantIdForEra(variants, 2)).toBe(null);
  });
});
