import { describe, expect, it } from "vitest";
import type { LayerVariant } from "../../src/features/viz/dataTypeModel";
import {
  findVariantIdForEra,
  findVariantKeyForEra,
  listEraVariants,
  parseEraVariantKey,
  resolveFixedEraUiValue,
  snapEraToAvailable,
} from "../../src/features/viz/era";

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
  it("snaps sparse eras to nearest available variantId", () => {
    const variants = [
      makeVariant("era:1", "era:1"),
      makeVariant("era:3", "era:3"),
      makeVariant("era:5", "era:5"),
    ];
    expect(findVariantIdForEra(variants, 4)).toBe("era:3");
  });

  it("matches zero-padded variants through normalized era parsing", () => {
    const variants = [makeVariant("era:01", "era:01"), makeVariant("era:03", "era:03")];
    expect(findVariantIdForEra(variants, 2)).toBe("era:01");
  });

  it("returns null when no era variants are available", () => {
    const variants = [makeVariant("era:3", "era:3"), makeVariant("snapshot:latest", "snapshot:latest")];
    expect(findVariantIdForEra(variants, 3)).toBe("era:3");
    expect(findVariantIdForEra([makeVariant("snapshot:latest", "snapshot:latest")], 2)).toBe(null);
  });
});

describe("snapEraToAvailable", () => {
  it("snaps to nearest lower era on ties", () => {
    const variants = [
      makeVariant("era:1", "era:1"),
      makeVariant("era:3", "era:3"),
      makeVariant("era:5", "era:5"),
    ];
    expect(snapEraToAvailable(variants, 4)).toBe(3);
  });
});

describe("findVariantKeyForEra", () => {
  it("returns the normalized existing variant key for overlays", () => {
    const variants = [makeVariant("display-era-001", "era:001"), makeVariant("display-era-003", "era:003")];
    expect(findVariantKeyForEra(variants, 2)).toBe("era:001");
    expect(findVariantKeyForEra(variants, 3)).toBe("era:003");
  });
});

describe("resolveFixedEraUiValue", () => {
  it("uses the selected rendered era when fixed mode snaps to sparse variants", () => {
    const variants = [
      makeVariant("era:1", "era:1"),
      makeVariant("era:3", "era:3"),
      makeVariant("era:5", "era:5"),
    ];
    expect(resolveFixedEraUiValue({ variants, selectedVariantKey: "era:3", requestedEra: 4 })).toBe(3);
  });

  it("falls back to nearest snapped era with lower-era tiebreak", () => {
    const variants = [
      makeVariant("era:1", "era:1"),
      makeVariant("era:3", "era:3"),
      makeVariant("era:5", "era:5"),
    ];
    expect(resolveFixedEraUiValue({ variants, selectedVariantKey: null, requestedEra: 4 })).toBe(3);
  });
});
