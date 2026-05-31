import { describe, expect, it } from "bun:test";

import swooperEarthlikeConfigRaw from "../../src/maps/configs/swooper-earthlike.config.json";
import { canonicalRecipeConfig, type CanonicalMapConfigWithRecipe } from "../../src/maps/configs/canonical.js";
import type { StandardRecipeConfig } from "../../src/recipes/standard/recipe.js";
import { collectWorldBalanceStats } from "../support/world-balance-stats.js";

function recipeConfig(config: CanonicalMapConfigWithRecipe): StandardRecipeConfig {
  return canonicalRecipeConfig<StandardRecipeConfig>(config);
}

function expectComponentMetrics(
  label: string,
  tileCount: number,
  componentCount: number,
  largestComponentSize: number
): void {
  expect(componentCount, `${label} component count`).toBeGreaterThanOrEqual(0);
  expect(largestComponentSize, `${label} largest component`).toBeGreaterThanOrEqual(0);
  expect(largestComponentSize, `${label} largest component <= tiles`).toBeLessThanOrEqual(tileCount);
  if (tileCount === 0) {
    expect(componentCount, `${label} empty component count`).toBe(0);
    expect(largestComponentSize, `${label} empty largest component`).toBe(0);
  } else {
    expect(componentCount, `${label} nonempty component count`).toBeGreaterThan(0);
    expect(largestComponentSize, `${label} nonempty largest component`).toBeGreaterThan(0);
  }
}

describe("terrain relief diagnostics", () => {
  it("separates planned hills, final hills, volcano mountains, and flat budgets", { timeout: 30_000 }, () => {
    const stats = collectWorldBalanceStats({
      label: "swooper-earthlike:relief-diagnostics",
      config: recipeConfig(swooperEarthlikeConfigRaw),
      seed: 1018,
      width: 106,
      height: 66,
    });

    expect(stats.plannedRoughTerrainTiles).toBe(stats.plannedMountainTiles + stats.plannedHillTiles);
    expect(stats.plannedHillTiles).toBe(
      stats.plannedFoothillTiles + stats.plannedRoughLandHillTiles
    );
    expect(stats.finalRoughTerrainTiles).toBe(stats.finalMountainTiles + stats.finalHillTiles);
    expect(stats.finalNonVolcanoRoughTerrainTiles).toBe(
      stats.finalNonVolcanoMountainTiles + stats.finalHillTiles
    );
    expect(stats.finalMountainTiles).toBe(
      stats.finalNonVolcanoMountainTiles + stats.finalVolcanoMountainTiles
    );

    expect(stats.plannedRoughTerrainShareOfPreLakeLand).toBeCloseTo(
      stats.plannedRoughTerrainTiles / stats.preLakeLandTiles,
      8
    );
    expect(stats.plannedFoothillShareOfPreLakeLand).toBeCloseTo(
      stats.plannedFoothillTiles / stats.preLakeLandTiles,
      8
    );
    expect(stats.plannedRoughLandHillShareOfPreLakeLand).toBeCloseTo(
      stats.plannedRoughLandHillTiles / stats.preLakeLandTiles,
      8
    );
    expect(stats.finalRoughTerrainShareOfPreLakeLand).toBeCloseTo(
      stats.finalRoughTerrainTiles / stats.preLakeLandTiles,
      8
    );
    expect(stats.finalNonVolcanoRoughTerrainShareOfPreLakeLand).toBeCloseTo(
      stats.finalNonVolcanoRoughTerrainTiles / stats.preLakeLandTiles,
      8
    );

    expect(stats.finalVolcanoMountainTiles).toBeLessThanOrEqual(stats.finalMountainTiles);
    expect(stats.finalVolcanoMountainTiles).toBeLessThanOrEqual(stats.volcanoFeatureTiles);
    expect(stats.volcanoFeatureTiles).toBeLessThanOrEqual(stats.preLakeLandTiles);
    expect(Object.values(stats.volcanoKindCounts).reduce((sum, count) => sum + count, 0)).toBe(
      stats.plannedVolcanoTiles
    );

    expectComponentMetrics(
      "planned mountains",
      stats.plannedMountainTiles,
      stats.plannedMountainComponentCount,
      stats.plannedLargestMountainComponentSize
    );
    expectComponentMetrics(
      "planned hills",
      stats.plannedHillTiles,
      stats.plannedHillComponentCount,
      stats.plannedLargestHillComponentSize
    );
    expectComponentMetrics(
      "final mountains",
      stats.finalMountainTiles,
      stats.finalMountainComponentCount,
      stats.finalLargestMountainComponentSize
    );
    expectComponentMetrics(
      "final hills",
      stats.finalHillTiles,
      stats.finalHillComponentCount,
      stats.finalLargestHillComponentSize
    );

    expect(stats.finalFlatToRoughRatio).toBeGreaterThanOrEqual(0);
    expect(stats.finalFlatToNonVolcanoRoughRatio).toBeGreaterThanOrEqual(0);
    expect(stats.plannedMountainToHillRatio).toBeGreaterThanOrEqual(0);
    expect(stats.finalMountainToHillRatio).toBeGreaterThanOrEqual(0);
    expect(stats.finalNonVolcanoMountainToHillRatio).toBeGreaterThanOrEqual(0);
    expect(stats.plannedMeanRoughnessPotential).toBeGreaterThanOrEqual(0);
    expect(stats.plannedMeanRoughnessPotential).toBeLessThanOrEqual(255);
  });
});
