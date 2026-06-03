import { describe, expect, it } from "bun:test";

import swooperEarthlikeConfigRaw from "../../src/maps/configs/swooper-earthlike.config.json";
import { canonicalRecipeConfig, type CanonicalMapConfigWithRecipe } from "../../src/maps/configs/canonical.js";
import type { StandardRecipeConfig } from "../../src/recipes/standard/recipe.js";
import { collectWorldBalanceStats } from "../support/world-balance-stats.js";

function recipeConfig(config: CanonicalMapConfigWithRecipe): StandardRecipeConfig {
  return canonicalRecipeConfig<StandardRecipeConfig>(config);
}

describe("terrain relief balance", () => {
  it("lifts Swooper Earthlike hills out of the flatness failure band", { timeout: 30_000 }, () => {
    const stats = collectWorldBalanceStats({
      label: "swooper-earthlike:1018",
      config: recipeConfig(swooperEarthlikeConfigRaw),
      seed: 1018,
      width: 106,
      height: 66,
    });

    expect(stats.plannedMountainShareOfPreLakeLand).toBeGreaterThanOrEqual(0.04);
    expect(stats.finalNonVolcanoMountainShareOfPreLakeLand).toBeGreaterThanOrEqual(0.04);
    expect(stats.plannedFoothillShareOfPreLakeLand).toBeGreaterThanOrEqual(0.03);
    expect(stats.plannedRoughLandHillShareOfPreLakeLand).toBeGreaterThanOrEqual(0.1);
    expect(stats.plannedHillShareOfPreLakeLand).toBeGreaterThanOrEqual(0.12);
    expect(stats.finalHillShareOfPreLakeLand).toBeGreaterThanOrEqual(0.1);
    expect(stats.finalFlatShareOfPreLakeLand).toBeLessThanOrEqual(0.68);
    expect(stats.finalNonVolcanoRoughTerrainShareOfPreLakeLand).toBeGreaterThanOrEqual(0.3);
  });

  it("keeps Earthlike hills above the hard-fail band across stable seed rolls", { timeout: 30_000 }, () => {
    const config = recipeConfig(swooperEarthlikeConfigRaw);
    const seeds = [1, 42, 99, 7777];
    const rolls = seeds.map((seed) =>
      collectWorldBalanceStats({
        label: `swooper-earthlike:${seed}`,
        config,
        seed,
        width: 80,
        height: 50,
      })
    );

    for (const stats of rolls) {
      expect(stats.plannedMountainShareOfPreLakeLand, `${stats.label} planned mountains`).toBeGreaterThanOrEqual(0.03);
      expect(stats.finalNonVolcanoMountainShareOfPreLakeLand, `${stats.label} final mountains`).toBeGreaterThanOrEqual(0.035);
      expect(stats.plannedFoothillShareOfPreLakeLand, `${stats.label} foothills`).toBeGreaterThanOrEqual(0.02);
      expect(stats.plannedHillShareOfPreLakeLand, `${stats.label} planned hills`).toBeGreaterThanOrEqual(0.12);
      expect(stats.finalHillShareOfPreLakeLand, `${stats.label} final hills`).toBeGreaterThanOrEqual(0.08);
      expect(stats.plannedRoughLandHillShareOfPreLakeLand, `${stats.label} rough-land hills`).toBeGreaterThanOrEqual(0.22);
      expect(stats.finalFlatShareOfPreLakeLand, `${stats.label} final flats`).toBeLessThanOrEqual(0.7);
    }
  });
});
