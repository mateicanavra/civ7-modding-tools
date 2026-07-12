import { describe, expect, it } from "bun:test";
import { canonicalRecipeConfig } from "../../../src/maps/configs/canonical.js";
import swooperEarthlikeConfigRaw from "../../../src/maps/configs/swooper-earthlike.config.json";
import { collectWorldBalanceStats } from "../../support/world-balance-stats.js";

describe("terrain relief balance", () => {
  it("keeps Swooper Earthlike relief varied without rough-upland carpets", () => {
    const stats = collectWorldBalanceStats({
      label: "swooper-earthlike:1018",
      config: canonicalRecipeConfig(swooperEarthlikeConfigRaw),
      seed: 1018,
      width: 106,
      height: 66,
    });

    expect(stats.plannedFoothillShareOfPreLakeLand).toBeGreaterThanOrEqual(0.12);
    expect(stats.plannedFoothillShareOfPreLakeLand).toBeGreaterThan(
      stats.plannedRoughLandHillShareOfPreLakeLand
    );
    expect(stats.plannedRoughLandHillShareOfPreLakeLand).toBeGreaterThanOrEqual(0.04);
    expect(stats.plannedRoughLandHillShareOfPreLakeLand).toBeLessThanOrEqual(0.08);
    expect(stats.plannedLargestRoughLandHillComponentSize).toBeLessThanOrEqual(60);
    expect(stats.plannedHillShareOfPreLakeLand).toBeGreaterThanOrEqual(0.12);
    expect(stats.finalHillShareOfPreLakeLand).toBeGreaterThanOrEqual(0.1);
    expect(stats.finalFlatShareOfPreLakeLand).toBeLessThanOrEqual(0.75);
    expect(stats.finalNonVolcanoRoughTerrainShareOfPreLakeLand).toBeGreaterThanOrEqual(0.18);
  }, 30_000);

  it("keeps Earthlike foothills useful and interior rough uplands broken across stable seed rolls", () => {
    const config = canonicalRecipeConfig(swooperEarthlikeConfigRaw);
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
      expect(
        stats.plannedHillShareOfPreLakeLand,
        `${stats.label} planned hills`
      ).toBeGreaterThanOrEqual(0.12);
      expect(
        stats.plannedFoothillShareOfPreLakeLand,
        `${stats.label} foothills`
      ).toBeGreaterThanOrEqual(0.08);
      expect(
        stats.plannedRoughLandHillShareOfPreLakeLand,
        `${stats.label} rough uplands`
      ).toBeLessThanOrEqual(0.08);
      expect(
        stats.plannedLargestRoughLandHillComponentSize,
        `${stats.label} largest rough-upland component`
      ).toBeLessThanOrEqual(40);
      expect(
        stats.finalHillShareOfPreLakeLand,
        `${stats.label} final hills`
      ).toBeGreaterThanOrEqual(0.08);
      expect(stats.finalFlatShareOfPreLakeLand, `${stats.label} final flats`).toBeLessThanOrEqual(
        0.85
      );
      expect(
        stats.plannedLargestMountainRegionComponentDiameter,
        `${stats.label} largest mountain-region length`
      ).toBeGreaterThanOrEqual(30);
      expect(
        stats.plannedMountainRegionNonMountainShare,
        `${stats.label} non-mountain region interior`
      ).toBeGreaterThanOrEqual(0.65);
      expect(
        stats.plannedMountainRegionFlatInteriorShare,
        `${stats.label} flat region passages`
      ).toBeGreaterThanOrEqual(0.35);
      expect(
        stats.plannedLargestMountainRegionFlatPocketSize,
        `${stats.label} region pocket size`
      ).toBeGreaterThanOrEqual(50);
    }
  }, 30_000);
});
