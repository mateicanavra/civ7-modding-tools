import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";

import { canonicalRecipeConfig } from "../../src/maps/configs/canonical.js";
import type { StandardRecipeConfig } from "../../src/recipes/standard/recipe.js";
import { collectWorldBalanceStats } from "../support/world-balance-stats.js";

function loadEarthlikeConfig(): StandardRecipeConfig {
  const raw = JSON.parse(
    readFileSync(
      new URL("../../src/maps/configs/swooper-earthlike.config.json", import.meta.url),
      "utf8"
    )
  );
  return canonicalRecipeConfig(raw) as StandardRecipeConfig;
}

describe("pipeline: earthlike mountain ranges", () => {
  it("produces long orogenic regions with internal passes and valleys", { timeout: 30_000 }, () => {
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
      expect(
        sample.plannedLargestMountainRegionComponentDiameter,
        `${sample.label} mountain region length`
      ).toBeGreaterThanOrEqual(38);
      expect(
        sample.plannedLargestMountainRegionComponentSize,
        `${sample.label} mountain region footprint`
      ).toBeGreaterThanOrEqual(450);
      expect(
        sample.plannedMountainRegionNonMountainShare,
        `${sample.label} internal non-mountain terrain`
      ).toBeGreaterThanOrEqual(0.65);
      expect(
        sample.plannedMountainRegionFlatInteriorShare,
        `${sample.label} internal valleys/passages`
      ).toBeGreaterThanOrEqual(0.35);
      expect(
        sample.plannedLargestMountainRegionFlatPocketSize,
        `${sample.label} settlement-scale interior pocket`
      ).toBeGreaterThanOrEqual(100);
      expect(
        sample.plannedMountainRegionMountainShare,
        `${sample.label} peak density inside region`
      ).toBeLessThanOrEqual(0.38);
      expect(
        sample.plannedMountainRegionFoothillShare + sample.plannedMountainRegionRoughLandShare,
        `${sample.label} rough shoulder mix`
      ).toBeGreaterThanOrEqual(0.25);
      expect(
        sample.plannedLargestMountainComponentDiameter,
        `${sample.label} peak spine still has scale`
      ).toBeGreaterThanOrEqual(25);
    }
  });
});
