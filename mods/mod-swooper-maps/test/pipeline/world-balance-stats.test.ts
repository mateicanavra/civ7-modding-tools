import { describe, expect, it } from "bun:test";
import { stripSchemaMetadataRoot } from "@swooper/mapgen-core/authoring";

import swooperEarthlikeConfigRaw from "../../src/maps/configs/swooper-earthlike.config.json";
import earthlikePresetRaw from "../../src/presets/standard/earthlike.json";
import { realismEarthlikeConfig } from "../../src/maps/presets/realism/earthlike.config.js";
import { SHATTERED_RING_CONFIG } from "../../src/maps/configs/shattered-ring.config.js";
import { SUNDERED_ARCHIPELAGO_CONFIG } from "../../src/maps/configs/sundered-archipelago.config.js";
import { SWOOPER_DESERT_MOUNTAINS_CONFIG } from "../../src/maps/configs/swooper-desert-mountains.config.js";
import type { StandardRecipeConfig } from "../../src/recipes/standard/recipe.js";
import { collectWorldBalanceStats, type WorldBalanceStats } from "../support/world-balance-stats.js";

function unwrapConfig(config: unknown): StandardRecipeConfig {
  const unwrapped = stripSchemaMetadataRoot(structuredClone(config)) as
    | StandardRecipeConfig
    | { config: StandardRecipeConfig };
  return "config" in unwrapped ? unwrapped.config : unwrapped;
}

const CASES = [
  {
    label: "swooper-earthlike",
    config: unwrapConfig(swooperEarthlikeConfigRaw),
    wetlandMax: 0.08,
    reefMax: 0.04,
    requireColdReefs: true,
    requireAtolls: true,
  },
  {
    label: "standard-earthlike-preset",
    config: unwrapConfig(earthlikePresetRaw),
    wetlandMax: 0.08,
    reefMax: 0.04,
    requireColdReefs: true,
    requireAtolls: true,
  },
  {
    label: "realism-earthlike",
    config: realismEarthlikeConfig,
    wetlandMax: 0.08,
    reefMax: 0.03,
    requireAtolls: true,
  },
  {
    label: "shattered-ring",
    config: SHATTERED_RING_CONFIG,
    wetlandMax: 0.12,
    reefMax: 0.02,
    requireAtolls: true,
  },
  {
    label: "sundered-archipelago",
    config: SUNDERED_ARCHIPELAGO_CONFIG,
    wetlandMax: 0.22,
    reefMax: 0.02,
    requireColdReefs: true,
    requireAtolls: true,
  },
  {
    label: "desert-mountains",
    config: SWOOPER_DESERT_MOUNTAINS_CONFIG,
    wetlandMax: 0.08,
    reefMax: 0.03,
    requireAtolls: true,
    rainforestMax: 20,
  },
] as const;

describe("world balance stats", () => {
  it("keeps shipped map identities within product-visible geography budgets", { timeout: 30_000 }, () => {
    for (const caseData of CASES) {
      const stats = collectWorldBalanceStats({
        label: caseData.label,
        config: caseData.config,
        seed: 1018,
        width: 106,
        height: 66,
      });

      // Lakes should read as occasional inland basins, not a terrain-wide sink mask.
      expect(stats.lakeShareOfPreLakeLand, `${caseData.label} lake share`).toBeLessThanOrEqual(0.08);
      expect(stats.lakeWaterDriftCount, `${caseData.label} lake water drift`).toBe(0);
      expect(stats.finalLakeWaterDriftCount, `${caseData.label} final lake water drift`).toBe(0);
      expect(
        stats.finalLakeClassificationDriftCount,
        `${caseData.label} final lake classification drift`
      ).toBe(0);
      expect(stats.invalidFeatureSurfaceCount, `${caseData.label} invalid feature surface`).toBe(0);
      for (const [feature, count] of Object.entries(stats.featureHabitatMismatchCounts)) {
        expect(count, `${caseData.label} ${feature} habitat mismatch`).toBe(0);
      }
      expect(stats.lakeProjectionMismatchCount, `${caseData.label} rejected lake tiles`).toBeLessThanOrEqual(2);
      expect(stats.singleTileLakeShare, `${caseData.label} one-tile lake share`).toBeLessThanOrEqual(0.2);
      expect(stats.lakeComponentCount, `${caseData.label} lake component count`).toBeLessThanOrEqual(24);
      expect(stats.largestLakeComponentSize, `${caseData.label} largest lake component`).toBeGreaterThanOrEqual(4);

      // Wetlands can cluster around coasts and floodplains, but they should not
      // occupy a large fraction of playable land for any shipped map identity.
      expect(stats.wetlandShareOfPreLakeLand, `${caseData.label} wetland share`).toBeLessThanOrEqual(
        caseData.wetlandMax
      );

      // Reef-family features are visible ocean accents; high water coverage does
      // not justify carpeting shelves, banks, or atoll candidates.
      expect(stats.reefFamilyShareOfWater, `${caseData.label} reef-family share`).toBeLessThanOrEqual(
        caseData.reefMax
      );

      if (caseData.requireColdReefs) {
        expect(stats.featureCounts.FEATURE_COLD_REEF, `${caseData.label} cold reefs`).toBeGreaterThan(0);
      }
      if (caseData.requireAtolls) {
        expect(stats.featureCounts.FEATURE_ATOLL, `${caseData.label} atolls`).toBeGreaterThan(0);
      }
      if ("rainforestMax" in caseData) {
        expect(stats.featureCounts.FEATURE_RAINFOREST, `${caseData.label} rainforest`).toBeLessThanOrEqual(
          caseData.rainforestMax
        );
      }
    }
  });

  it("keeps earthlike vegetation families visible across seed rolls", { timeout: 30_000 }, () => {
    const seeds = [1018, 1, 2, 3, 42, 99, 1234, 7777];
    const rolls: WorldBalanceStats[] = seeds.map((seed) =>
      collectWorldBalanceStats({
        label: `swooper-earthlike:${seed}`,
        config: unwrapConfig(swooperEarthlikeConfigRaw),
        seed,
        width: 80,
        height: 50,
      })
    );

    const presentIn = (feature: keyof WorldBalanceStats["featureCounts"]): number =>
      rolls.filter((stats) => stats.featureCounts[feature] > 0).length;

    for (const stats of rolls) {
      expect(stats.invalidFeatureSurfaceCount, `${stats.label} invalid feature surface`).toBe(0);
      expect(stats.finalLakeWaterDriftCount, `${stats.label} final lake water drift`).toBe(0);
      expect(stats.finalLakeClassificationDriftCount, `${stats.label} final lake classification drift`).toBe(0);
      expect(stats.vegetationFamilyTiles, `${stats.label} vegetation-family tiles`).toBeGreaterThan(0);
      expect(stats.vegetationFeatureFamiliesPresent, `${stats.label} vegetation families present`).toBeGreaterThanOrEqual(4);
      expect(stats.vegetationFamilyShareOfPreLakeLand, `${stats.label} vegetation share`).toBeGreaterThan(0.08);
      expect(stats.vegetationFamilyShareOfPreLakeLand, `${stats.label} vegetation share`).toBeLessThan(0.55);
      expect(stats.featureCounts.FEATURE_RAINFOREST, `${stats.label} rainforest`).toBeLessThanOrEqual(
        Math.max(1, Math.floor(stats.preLakeLandTiles * 0.35))
      );
    }

    expect(presentIn("FEATURE_FOREST"), "forest seed presence").toBe(seeds.length);
    expect(presentIn("FEATURE_RAINFOREST"), "rainforest seed presence").toBe(seeds.length);
    expect(presentIn("FEATURE_TAIGA"), "taiga seed presence").toBe(seeds.length);
    expect(presentIn("FEATURE_SAVANNA_WOODLAND"), "savanna seed presence").toBeGreaterThanOrEqual(6);
    expect(presentIn("FEATURE_SAGEBRUSH_STEPPE"), "sagebrush seed presence").toBeGreaterThanOrEqual(6);
  });
});
