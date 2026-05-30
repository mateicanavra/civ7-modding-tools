import { describe, expect, it } from "bun:test";
import { stripSchemaMetadataRoot } from "@swooper/mapgen-core/authoring";

import swooperEarthlikeConfigRaw from "../../src/maps/configs/swooper-earthlike.config.json";
import earthlikePresetRaw from "../../src/presets/standard/earthlike.json";
import { realismEarthlikeConfig } from "../../src/maps/presets/realism/earthlike.config.js";
import { SHATTERED_RING_CONFIG } from "../../src/maps/configs/shattered-ring.config.js";
import { SUNDERED_ARCHIPELAGO_CONFIG } from "../../src/maps/configs/sundered-archipelago.config.js";
import { SWOOPER_DESERT_MOUNTAINS_CONFIG } from "../../src/maps/configs/swooper-desert-mountains.config.js";
import type { StandardRecipeConfig } from "../../src/recipes/standard/recipe.js";
import { collectWorldBalanceStats } from "../support/world-balance-stats.js";

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
});
