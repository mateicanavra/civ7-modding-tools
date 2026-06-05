import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";

import { canonicalRecipeConfig } from "../../src/maps/configs/canonical.js";
import type { StandardRecipeConfig } from "../../src/recipes/standard/recipe.js";
import { collectWorldBalanceStats } from "../support/world-balance-stats.js";

function loadEarthlikeConfig(): StandardRecipeConfig {
  const raw = JSON.parse(
    readFileSync(new URL("../../src/maps/configs/swooper-earthlike.config.json", import.meta.url), "utf8")
  );
  return canonicalRecipeConfig(raw) as StandardRecipeConfig;
}

describe("pipeline: earthlike mountain ranges", () => {
  it("produces long connected mountain spines instead of only local peak clusters", { timeout: 30_000 }, () => {
    const config = loadEarthlikeConfig();
    const seeds = [1018, 2024, 5050] as const;

    const stats = seeds.map((seed) =>
      collectWorldBalanceStats({
        label: `earthlike-range-${seed}`,
        config,
        width: 106,
        height: 66,
        seed,
      })
    );

    for (const sample of stats) {
      expect(sample.plannedMountainTiles).toBeGreaterThan(0);
      expect(sample.plannedLargestMountainComponentDiameter).toBeGreaterThanOrEqual(30);
      expect(sample.plannedLargestMountainComponentSize).toBeGreaterThanOrEqual(30);
    }
  });
});
