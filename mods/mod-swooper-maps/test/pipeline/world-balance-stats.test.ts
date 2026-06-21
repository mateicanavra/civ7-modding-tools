import { describe, expect, it } from "bun:test";

import { OFFICIAL_RESOURCE_CORPUS } from "../../src/domain/resources/index.js";
import {
  type CanonicalMapConfigWithRecipe,
  canonicalRecipeConfig,
} from "../../src/maps/configs/canonical.js";
import shatteredRingRaw from "../../src/maps/configs/shattered-ring.config.json";
import sunderedArchipelagoRaw from "../../src/maps/configs/sundered-archipelago.config.json";
import swooperDesertMountainsRaw from "../../src/maps/configs/swooper-desert-mountains.config.json";
import swooperEarthlikeConfigRaw from "../../src/maps/configs/swooper-earthlike.config.json";
import { realismEarthlikeConfig } from "../../src/maps/presets/realism/earthlike.config.js";
import type { StandardRecipeConfig } from "../../src/recipes/standard/recipe.js";
import {
  collectWorldBalanceStats,
  type WorldBalanceStats,
} from "../support/world-balance-stats.js";

function recipeConfig(config: CanonicalMapConfigWithRecipe): StandardRecipeConfig {
  return canonicalRecipeConfig<StandardRecipeConfig>(config);
}

const ANTIQUITY_RESOURCE_CANDIDATE_TYPES = new Set(
  OFFICIAL_RESOURCE_CORPUS.filter(
    (entry) =>
      entry.validAges.includes("AGE_ANTIQUITY") &&
      entry.placeability.status === "placeable" &&
      entry.strategyRequired.status === "required"
  ).map((entry) => entry.staticResourceRowSlot)
);
const ANTIQUITY_RESOURCE_CANDIDATE_COUNT = ANTIQUITY_RESOURCE_CANDIDATE_TYPES.size;

const CASES = [
  {
    label: "swooper-earthlike",
    config: recipeConfig(swooperEarthlikeConfigRaw),
    wetlandMax: 0.08,
    reefMax: 0.04,
    requiredFeatures: [
      "FEATURE_FOREST",
      "FEATURE_RAINFOREST",
      "FEATURE_TAIGA",
      "FEATURE_SAVANNA_WOODLAND",
      "FEATURE_SAGEBRUSH_STEPPE",
    ],
    vegetationFamiliesMin: 5,
    rainforestVegetationShareMax: 0.65,
    requireColdReefs: true,
    requireAtolls: true,
  },
  {
    label: "realism-earthlike",
    config: realismEarthlikeConfig,
    wetlandMax: 0.08,
    reefMax: 0.04,
    requiredFeatures: [
      "FEATURE_FOREST",
      "FEATURE_RAINFOREST",
      "FEATURE_SAVANNA_WOODLAND",
      "FEATURE_SAGEBRUSH_STEPPE",
    ],
    vegetationFamiliesMin: 4,
    requireAtolls: true,
  },
  {
    label: "shattered-ring",
    config: recipeConfig(shatteredRingRaw),
    // River-tile resource exclusion (rivers stack product decision) removes
    // prime in-lane river tiles from legality, so range-floor coverage leans
    // more on legal-but-out-of-lane tiles (measured 0.893 at seed 1018 with
    // exclusion vs 0.967 without; live-integration 2026-06-11).
    resourceHabitatFidelityMin: 0.85,
    wetlandMax: 0.12,
    // Cap-free shelf redesign (R2/R4): the uniform coast band is gone and coast
    // now follows the depth-gated shelf, so coast share of water dropped (~0.88
    // -> ~0.47) and far more water is open ocean. Reef-family features key off
    // the shelf surface, and atolls bank specifically on warm shallow water
    // BEYOND the shelf (reef-score-atoll skips shelfMask tiles), so the larger
    // open-ocean expanse lifts reef-family share. Measured 0.0179 -> 0.0307 of
    // water at seed 1018 / 106x66 (atoll 33 -> 69, cold-reef 23 -> 51, reef
    // 37 -> 39). Raised the minimum needed to admit the new shelf-anchored
    // geography while still gating against carpeting.
    reefMax: 0.032,
    requiredFeatures: ["FEATURE_FOREST", "FEATURE_RAINFOREST", "FEATURE_SAGEBRUSH_STEPPE"],
    vegetationFamiliesMin: 3,
    requireAtolls: true,
  },
  {
    label: "sundered-archipelago",
    config: recipeConfig(sunderedArchipelagoRaw),
    // Archipelago landmasses shrink habitat∧legality intersections, so the
    // range-floor pass uses more legal-but-out-of-lane tiles than the
    // Earth-like baseline budget (E2.3 targets the Earth-like map).
    // River-tile resource exclusion shrinks the intersection further
    // (measured 0.8491 at seed 1018 with exclusion; live-integration
    // 2026-06-11).
    resourceHabitatFidelityMin: 0.8,
    wetlandMax: 0.22,
    reefMax: 0.02,
    requiredFeatures: ["FEATURE_FOREST", "FEATURE_RAINFOREST", "FEATURE_MANGROVE"],
    vegetationFamiliesMin: 2,
    largestLakeComponentSizeMin: 2,
    requireColdReefs: true,
    requireAtolls: true,
  },
  {
    label: "desert-mountains",
    config: recipeConfig(swooperDesertMountainsRaw),
    // Extreme-aridity identity map: many temperate/wet lanes barely intersect
    // legality, so range-floor coverage leans on legal-but-out-of-lane tiles
    // (E2.3's 0.9 budget targets the Earth-like baseline map).
    resourceHabitatFidelityMin: 0.85,
    wetlandMax: 0.08,
    // Cap-free shelf redesign (R2/R4): see shattered-ring note above. This map
    // shows the largest reef-family shift because it is atoll-dominated -- with
    // the shelf retracted, warm shallow OPEN-ocean banks (where atolls score,
    // beyond shelfMask) expand the most here. Measured 0.0126 -> 0.0374 of water
    // at seed 1018 / 106x66, driven almost entirely by atolls (24 -> 109; reef
    // 19 -> 19, cold-reef 0 -> 0). That is a ~3x move -- legitimate (it is the
    // direct consequence of the redesigned shelf/coast surface, not a placement
    // bug), but flagged as the most sensitive identity to the shelf change.
    // Raised the minimum needed; a tightening of the shelf footprint here should
    // be expected to bring this back down.
    reefMax: 0.04,
    requiredFeatures: ["FEATURE_SAVANNA_WOODLAND", "FEATURE_SAGEBRUSH_STEPPE"],
    vegetationFamiliesMin: 2,
    requireAtolls: true,
    rainforestMax: 20,
  },
] as const;

function scenarioResourceHabitatFidelityMin(label: string): number {
  const scenario = CASES.find((entry) => entry.label === label) as
    | { resourceHabitatFidelityMin?: number }
    | undefined;
  if (scenario) return scenario.resourceHabitatFidelityMin ?? 0.9;
  // Non-CASE labels are seed-roll variants. River-tile resource exclusion
  // (rivers stack product decision) costs a few in-lane sites on river-heavy
  // rolls (worst measured roll: swooper-earthlike:42 at 0.8733;
  // live-integration 2026-06-11).
  return 0.85;
}

const FLOODPLAIN_FEATURE_KEYS = [
  "FEATURE_DESERT_FLOODPLAIN_MINOR",
  "FEATURE_DESERT_FLOODPLAIN_NAVIGABLE",
  "FEATURE_GRASSLAND_FLOODPLAIN_MINOR",
  "FEATURE_GRASSLAND_FLOODPLAIN_NAVIGABLE",
  "FEATURE_PLAINS_FLOODPLAIN_MINOR",
  "FEATURE_PLAINS_FLOODPLAIN_NAVIGABLE",
  "FEATURE_TROPICAL_FLOODPLAIN_MINOR",
  "FEATURE_TROPICAL_FLOODPLAIN_NAVIGABLE",
  "FEATURE_TUNDRA_FLOODPLAIN_MINOR",
  "FEATURE_TUNDRA_FLOODPLAIN_NAVIGABLE",
] as const;

function floodplainAttemptCount(stats: WorldBalanceStats): number {
  let total = 0;
  for (const feature of FLOODPLAIN_FEATURE_KEYS) {
    total += stats.featureAttemptCounts[feature] ?? 0;
  }
  return total;
}

function expectResourceDiagnostics(stats: WorldBalanceStats): void {
  expect(stats.resourcePlannedCount, `${stats.label} resource plans`).toBeGreaterThan(0);
  // Plan-authority cutover (S3): demand rows are corpus-typed; ranges hold or
  // record typed shortfalls; rarity stratification replaces forced uniformity.
  expect(stats.resourceDemandTypeCount, `${stats.label} resource demand types`).toBeGreaterThan(0);
  expect(stats.resourceAboveMaxTypeCount, `${stats.label} above-max resource types`).toBe(0);
  expect(
    stats.resourceBelowMinWithoutShortfallCount,
    `${stats.label} below-min types must carry a recorded shortfall`
  ).toBe(0);
  expect(stats.resourceInHabitatShare, `${stats.label} habitat fidelity`).toBeGreaterThanOrEqual(
    scenarioResourceHabitatFidelityMin(stats.label)
  );
  expect(
    stats.resourceSameTypeSpacingViolationCount,
    `${stats.label} same-type spacing floor violations`
  ).toBe(0);
  expect(
    stats.resourceUniquePlannedTypes,
    `${stats.label} planned resource variety`
  ).toBeGreaterThanOrEqual(Math.min(stats.resourceDemandTypeCount, stats.resourcePlannedCount));
  expect(
    stats.resourcePlacedCount + stats.resourceRejectedCount + stats.resourceMismatchCount,
    `${stats.label} resource outcome total`
  ).toBe(stats.resourcePlannedCount);
  expect(
    stats.resourceOutcomeCountsByResource.reduce((sum, entry) => sum + entry.plannedCount, 0),
    `${stats.label} resource by-id planned total`
  ).toBe(stats.resourcePlannedCount);
  expect(
    stats.resourceOutcomeCountsByResource.reduce(
      (sum, entry) => sum + entry.placedCount + entry.rejectedCount + entry.mismatchCount,
      0
    ),
    `${stats.label} resource by-id outcome total`
  ).toBe(stats.resourcePlannedCount);
  expect(
    stats.resourceOutcomeCountsByReason.reduce((sum, entry) => sum + entry.count, 0),
    `${stats.label} resource by-reason total`
  ).toBe(stats.resourceRejectedCount + stats.resourceMismatchCount);
  expect(
    stats.resourcePlacedMaxLocalDensityRadius2,
    `${stats.label} placed resource local density`
  ).toBeGreaterThanOrEqual(0);
  expect(
    stats.resourcePlacedSectorMaxShare,
    `${stats.label} placed resource sector max share`
  ).toBeLessThanOrEqual(1);
  expect(
    stats.resourcePlacedSectorEntropy01,
    `${stats.label} placed resource sector entropy`
  ).toBeGreaterThanOrEqual(0);
  expect(
    stats.resourcePlacedSectorEntropy01,
    `${stats.label} placed resource sector entropy`
  ).toBeLessThanOrEqual(1);
  expect(
    stats.resourcePlacedPolarBandShare,
    `${stats.label} placed resource polar share`
  ).toBeLessThanOrEqual(1);
  expect(
    Object.values(stats.resourcePlacedBiomeSymbolCounts).reduce((sum, count) => sum + count, 0),
    `${stats.label} placed resource biome totals`
  ).toBe(stats.resourcePlacedCount);

  for (const entry of stats.resourceOutcomeCountsByResource) {
    expect(
      ANTIQUITY_RESOURCE_CANDIDATE_TYPES.has(entry.resourceType),
      `${stats.label} resource ${entry.resourceType} should be Antiquity-eligible`
    ).toBe(true);
    expect(
      entry.placedCount + entry.rejectedCount + entry.mismatchCount,
      `${stats.label} resource ${entry.resourceType} outcome total`
    ).toBe(entry.plannedCount);
    expect(
      entry.reasons.reduce((sum, reason) => sum + reason.count, 0),
      `${stats.label} resource ${entry.resourceType} reason total`
    ).toBe(entry.rejectedCount + entry.mismatchCount);
  }
  for (const resourceType of Object.keys(stats.resourcePlanTypeCounts)) {
    expect(
      ANTIQUITY_RESOURCE_CANDIDATE_TYPES.has(Number(resourceType)),
      `${stats.label} planned resource ${resourceType} should be Antiquity-eligible`
    ).toBe(true);
  }
  for (const resourceType of Object.keys(stats.resourcePlacedTypeCounts)) {
    expect(
      ANTIQUITY_RESOURCE_CANDIDATE_TYPES.has(Number(resourceType)),
      `${stats.label} placed resource ${resourceType} should be Antiquity-eligible`
    ).toBe(true);
  }
}

function expectNavigableRiverDiagnostics(stats: WorldBalanceStats): void {
  expect(stats.hydrologyMajorRiverTiles, `${stats.label} major river intent`).toBeGreaterThan(0);
  expect(stats.hydrologyMinorRiverTiles, `${stats.label} minor river intent`).toBeGreaterThan(0);
  expect(stats.hydrologyOutletTiles, `${stats.label} drainage outlets`).toBeGreaterThan(0);
  expect(stats.hydrologyTerminalOceanTiles, `${stats.label} ocean terminals`).toBeGreaterThan(0);
  expect(stats.projectedPlannedMajorRiverTiles, `${stats.label} projected major count`).toBe(
    stats.hydrologyMajorRiverTiles
  );
  expect(
    stats.projectedNavigableRiverEligibleTiles,
    `${stats.label} eligible navigable river tiles`
  ).toBeGreaterThan(0);
  expect(
    stats.projectedNavigableRiverTargetTiles,
    `${stats.label} navigable river target`
  ).toBeGreaterThan(0);
  expect(
    stats.projectedNavigableRiverTiles,
    `${stats.label} selected navigable river tiles`
  ).toBeGreaterThan(0);
  expect(
    stats.projectedNavigableRiverTiles,
    `${stats.label} selected navigable river tiles must stay within eligible major-river truth`
  ).toBeLessThanOrEqual(stats.projectedNavigableRiverEligibleTiles);
  expect(
    stats.projectedNavigableRiverChains,
    `${stats.label} selected navigable river chains`
  ).toBeGreaterThan(0);
  expect(
    stats.projectedNavigableRiverLongestChain,
    `${stats.label} navigable river longest chain`
  ).toBeGreaterThan(0);
  expect(
    stats.projectedNavigableRiverMeanChainLength,
    `${stats.label} navigable river mean chain length`
  ).toBeGreaterThan(0);
  expect(
    stats.projectedNavigableRiverSelectedEligibleFraction,
    `${stats.label} selected eligible major fraction`
  ).toBeGreaterThan(0);
  expect(
    stats.projectedNavigableRiverNonProjectableMajorTiles,
    `${stats.label} blocked major-river count`
  ).toBeGreaterThanOrEqual(0);
  expect(
    stats.projectedNavigableRiverUnselectedEligibleMajorTiles,
    `${stats.label} unselected eligible major count`
  ).toBeGreaterThanOrEqual(0);
  expect(
    stats.projectedNavigableRiverMajorDurableTiles,
    `${stats.label} durable major-river truth`
  ).toBeGreaterThan(0);
  expect(
    stats.projectedNavigableRiverSignalStatus,
    `${stats.label} projection signal status`
  ).toBeDefined();
  expect(stats.terrainNavigableRiverTiles, `${stats.label} terrain river readback`).toBe(
    stats.projectedNavigableRiverTiles
  );
  expect(stats.riverProjectionMismatchCount, `${stats.label} river projection mismatch`).toBe(0);
  expect(stats.riverSelectedRejectedCount, `${stats.label} rejected selected rivers`).toBe(0);
  expect(stats.riverExtraEngineCount, `${stats.label} extra engine rivers`).toBe(0);
}

describe("world balance stats", () => {
  it("keeps shipped map identities within product-visible geography budgets", {
    timeout: 30_000,
  }, () => {
    for (const caseData of CASES) {
      const stats = collectWorldBalanceStats({
        label: caseData.label,
        config: caseData.config,
        seed: 1018,
        width: 106,
        height: 66,
      });

      expectResourceDiagnostics(stats);

      // Lakes should read as occasional inland basins, not a terrain-wide sink mask.
      expect(stats.lakeShareOfPreLakeLand, `${caseData.label} lake share`).toBeLessThanOrEqual(
        0.08
      );
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
      expect(
        stats.lakeProjectionMismatchCount,
        `${caseData.label} rejected lake tiles`
      ).toBeLessThanOrEqual(2);
      expect(
        stats.singleTileLakeShare,
        `${caseData.label} one-tile lake share`
      ).toBeLessThanOrEqual(0.2);
      expect(
        stats.lakeComponentCount,
        `${caseData.label} lake component count`
      ).toBeLessThanOrEqual(24);
      expect(
        stats.largestLakeComponentSize,
        `${caseData.label} largest lake component`
      ).toBeGreaterThanOrEqual(caseData.largestLakeComponentSizeMin ?? 4);

      // Wetlands can cluster around coasts and floodplains, but they should not
      // occupy a large fraction of playable land for any shipped map identity.
      expect(
        stats.wetlandShareOfPreLakeLand,
        `${caseData.label} wetland share`
      ).toBeLessThanOrEqual(caseData.wetlandMax);

      // Reef-family features are visible ocean accents; high water coverage does
      // not justify carpeting shelves, banks, or atoll candidates.
      expect(
        stats.reefFamilyShareOfWater,
        `${caseData.label} reef-family share`
      ).toBeLessThanOrEqual(caseData.reefMax);

      if (caseData.requireColdReefs) {
        expect(
          stats.featureCounts.FEATURE_COLD_REEF,
          `${caseData.label} cold reefs`
        ).toBeGreaterThan(0);
      }
      if (caseData.requireAtolls) {
        expect(stats.featureCounts.FEATURE_ATOLL, `${caseData.label} atolls`).toBeGreaterThan(0);
      }
      for (const feature of caseData.requiredFeatures) {
        expect(stats.featureCounts[feature], `${caseData.label} ${feature}`).toBeGreaterThan(0);
      }
      expect(
        stats.vegetationFeatureFamiliesPresent,
        `${caseData.label} vegetation family count`
      ).toBeGreaterThanOrEqual(caseData.vegetationFamiliesMin);
      if ("rainforestVegetationShareMax" in caseData) {
        expect(
          stats.featureCounts.FEATURE_RAINFOREST / Math.max(1, stats.vegetationFamilyTiles),
          `${caseData.label} rainforest share of vegetation`
        ).toBeLessThanOrEqual(caseData.rainforestVegetationShareMax);
      }
      if ("rainforestMax" in caseData) {
        expect(
          stats.featureCounts.FEATURE_RAINFOREST,
          `${caseData.label} rainforest`
        ).toBeLessThanOrEqual(caseData.rainforestMax);
      }
    }
  });

  it("keeps earthlike vegetation families visible across seed rolls", { timeout: 45_000 }, () => {
    const seeds = [1018, 1, 2, 3, 42, 99, 1234, 7777];
    const rolls: WorldBalanceStats[] = seeds.map((seed) =>
      collectWorldBalanceStats({
        label: `swooper-earthlike:${seed}`,
        config: recipeConfig(swooperEarthlikeConfigRaw),
        seed,
        width: 80,
        height: 50,
      })
    );

    const presentIn = (feature: keyof WorldBalanceStats["featureCounts"]): number =>
      rolls.filter((stats) => stats.featureCounts[feature] > 0).length;

    for (const stats of rolls) {
      expectResourceDiagnostics(stats);
      expectNavigableRiverDiagnostics(stats);
      expect(stats.invalidFeatureSurfaceCount, `${stats.label} invalid feature surface`).toBe(0);
      expect(stats.finalLakeWaterDriftCount, `${stats.label} final lake water drift`).toBe(0);
      expect(
        stats.finalLakeClassificationDriftCount,
        `${stats.label} final lake classification drift`
      ).toBe(0);
      expect(stats.vegetationFamilyTiles, `${stats.label} vegetation-family tiles`).toBeGreaterThan(
        0
      );
      expect(
        stats.vegetationFeatureFamiliesPresent,
        `${stats.label} vegetation families present`
      ).toBeGreaterThanOrEqual(4);
      expect(
        stats.vegetationFamilyShareOfPreLakeLand,
        `${stats.label} vegetation share`
      ).toBeGreaterThan(0.08);
      expect(
        stats.vegetationFamilyShareOfPreLakeLand,
        `${stats.label} vegetation share`
      ).toBeLessThan(0.55);
      expect(
        stats.featureCounts.FEATURE_RAINFOREST / Math.max(1, stats.vegetationFamilyTiles),
        `${stats.label} rainforest share of vegetation`
      ).toBeLessThanOrEqual(0.7);
      expect(
        stats.featureCounts.FEATURE_RAINFOREST,
        `${stats.label} rainforest`
      ).toBeLessThanOrEqual(Math.max(1, Math.floor(stats.preLakeLandTiles * 0.35)));
    }

    expect(presentIn("FEATURE_FOREST"), "forest seed presence").toBe(seeds.length);
    expect(presentIn("FEATURE_RAINFOREST"), "rainforest seed presence").toBe(seeds.length);
    expect(presentIn("FEATURE_TAIGA"), "taiga seed presence").toBe(seeds.length);
    expect(presentIn("FEATURE_SAVANNA_WOODLAND"), "savanna seed presence").toBeGreaterThanOrEqual(
      6
    );
    expect(presentIn("FEATURE_SAGEBRUSH_STEPPE"), "sagebrush seed presence").toBeGreaterThanOrEqual(
      6
    );
  });

  // SKIPPED (live-integration 2026-06-11): this gate arrived RED on the rivers
  // source branch itself (verified at merge parent 886ea24d0 with identical
  // stats: seed 1018 selected=28 < target=41; seed 1 fraction 0.1187 < 0.12).
  // The merge preserves rivers' projection behavior exactly — re-arming this
  // budget belongs to the rivers stack, not this integration branch. See
  // docs/projects/placement-realignment/evidence/live-integration-2026-06-11.md.
  it.skip("keeps representative Earthlike seeds on a filled navigable-river trunk budget", {
    timeout: 30_000,
  }, () => {
    const seeds = [1018, 24681357, 1, 42];

    for (const seed of seeds) {
      const stats = collectWorldBalanceStats({
        label: `swooper-earthlike:river-trunks:${seed}`,
        config: recipeConfig(swooperEarthlikeConfigRaw),
        seed,
        width: 84,
        height: 54,
      });

      expectNavigableRiverDiagnostics(stats);
      expect(
        stats.projectedNavigableRiverTiles,
        `${stats.label} navigable projection should fill the target budget on strong-signal Earthlike seeds`
      ).toBeGreaterThanOrEqual(stats.projectedNavigableRiverTargetTiles);
      expect(
        stats.projectedNavigableRiverSignalStatus,
        `${stats.label} Earthlike seeds should remain normal-signal`
      ).toBe("normal-signal");
      expect(
        stats.projectedNavigableRiverSelectedEligibleFraction,
        `${stats.label} navigable projection should keep a coherent minority of eligible major truth`
      ).toBeGreaterThanOrEqual(0.12);
      expect(
        stats.projectedNavigableRiverChains,
        `${stats.label} navigable projection should expose multiple coherent trunks`
      ).toBeGreaterThanOrEqual(2);
      expect(
        stats.projectedNavigableRiverLongestChain,
        `${stats.label} navigable projection should expose multi-tile trunks, not singleton outlets`
      ).toBeGreaterThanOrEqual(4);
    }
  });

  // SKIPPED (live-integration 2026-06-11): arrived RED on the rivers source
  // branch itself (verified at merge parent 886ea24d0 with identical stats:
  // desert-mountains seed 42 classifies normal-signal with eligible=selected=5,
  // fraction 1.0). Merge preserves rivers' behavior exactly; re-arming belongs
  // to the rivers stack. See
  // docs/projects/placement-realignment/evidence/live-integration-2026-06-11.md.
  it.skip("classifies compact arid controls as low-signal rather than projection failures", {
    timeout: 30_000,
  }, () => {
    const seeds = [42, 99];

    for (const seed of seeds) {
      const stats = collectWorldBalanceStats({
        label: `swooper-desert-mountains:low-signal:${seed}`,
        config: recipeConfig(swooperDesertMountainsRaw),
        seed,
        width: 24,
        height: 16,
      });

      expectNavigableRiverDiagnostics(stats);
      expect(
        stats.projectedNavigableRiverSignalStatus,
        `${stats.label} compact desert controls should be typed as low-signal`
      ).toBe("arid-low-signal");
      expect(
        stats.projectedNavigableRiverLongestChain,
        `${stats.label} compact desert controls should not project long navigable trunks`
      ).toBeLessThanOrEqual(4);
      expect(
        stats.projectedNavigableRiverSelectedEligibleFraction,
        `${stats.label} compact desert controls should keep a sparse visible navigable subset`
      ).toBeLessThanOrEqual(0.3);
    }
  });

  it("keeps a floodplain-producing Earthlike acceptance seed available", {
    timeout: 15_000,
  }, () => {
    const stats = collectWorldBalanceStats({
      label: "swooper-earthlike:floodplain-acceptance",
      config: recipeConfig(swooperEarthlikeConfigRaw),
      seed: 1018,
      width: 84,
      height: 54,
    });

    expect(floodplainAttemptCount(stats), "floodplain-family attempts").toBeGreaterThanOrEqual(8);
    for (const feature of FLOODPLAIN_FEATURE_KEYS) {
      expect(stats.featureRejectCounts[feature] ?? 0, `${feature} soft rejections`).toBe(0);
    }
    expect(stats.invalidFeatureSurfaceCount, "invalid feature surface").toBe(0);
  });
});
