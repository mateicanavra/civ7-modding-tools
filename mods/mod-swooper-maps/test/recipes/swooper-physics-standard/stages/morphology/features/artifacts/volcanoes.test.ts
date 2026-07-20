import { describe, expect, it } from "bun:test";
import { runStandardRecipeTestMap } from "../../../../fixtures/standard-recipe.js";

type MorphologyTopographyArtifact = {
  landMask: Uint8Array;
};

type VolcanoKind = "subductionArc" | "rift" | "hotspot";
type MorphologyVolcanoesArtifact = {
  volcanoMask: Uint8Array;
  volcanoes: Array<{ tileIndex: number; kind: VolcanoKind; strength01: number }>;
};

describe("volcano artifact structure", () => {
  it("enforces land-only, stable ordering, and mask/list consistency", () => {
    const seed = 424242;
    const { context, preset } = runStandardRecipeTestMap({
      presetId: "MAPSIZE_HUGE",
      seed,
    });
    const { width, height } = preset.dimensions;

    const topography = context.artifacts.get("artifact:morphology.topography") as
      | MorphologyTopographyArtifact
      | undefined;
    const volcanoes = context.artifacts.get("artifact:morphology.volcanoes") as
      | MorphologyVolcanoesArtifact
      | undefined;
    expect(topography?.landMask).toBeInstanceOf(Uint8Array);
    expect(volcanoes?.volcanoMask).toBeInstanceOf(Uint8Array);
    expect(Array.isArray(volcanoes?.volcanoes)).toBe(true);

    const size = width * height;
    const landMask = topography!.landMask;
    const volcanoMask = volcanoes!.volcanoMask;
    const list = volcanoes!.volcanoes;

    expect(landMask.length).toBe(size);
    expect(volcanoMask.length).toBe(size);

    let lastTileIndex = -1;
    const seen = new Set<number>();
    for (const entry of list) {
      expect(Number.isInteger(entry.tileIndex)).toBe(true);
      expect(entry.tileIndex).toBeGreaterThanOrEqual(0);
      expect(entry.tileIndex).toBeLessThan(size);
      expect(entry.tileIndex).toBeGreaterThan(lastTileIndex);
      lastTileIndex = entry.tileIndex;

      expect(
        entry.kind === "subductionArc" || entry.kind === "rift" || entry.kind === "hotspot"
      ).toBe(true);
      expect(entry.strength01).toBeGreaterThanOrEqual(0);
      expect(entry.strength01).toBeLessThanOrEqual(1);

      expect(landMask[entry.tileIndex]).toBe(1);
      expect(volcanoMask[entry.tileIndex]).toBe(1);

      expect(seen.has(entry.tileIndex)).toBe(false);
      seen.add(entry.tileIndex);
    }

    let maskCount = 0;
    for (let i = 0; i < volcanoMask.length; i++) if (volcanoMask[i] === 1) maskCount++;
    expect(maskCount).toBe(list.length);
  });
});
