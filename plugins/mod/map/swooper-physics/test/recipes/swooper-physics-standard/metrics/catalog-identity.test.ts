import { describe, expect, it } from "bun:test";

import { MAP_CONFIG_CATALOG_IDS } from "../../../../src/maps/catalog/membership.js";
import { MOUNTAIN_DRAMA_STUDY } from "../../../../src/recipes/standard/metrics/studies/benchmarks/mountain-drama.study.js";
import { SHIPPED_IDENTITY_STUDIES } from "../../../../src/recipes/standard/metrics/studies/benchmarks/shipped-identities.study.js";
import { SHIPPED_IDENTITY_TARGETS } from "../../../../src/recipes/standard/metrics/targets/identities.js";
import { MOUNTAIN_DRAMA_COHORT_IDENTITY } from "../../../../src/recipes/standard/metrics/targets/relief.js";
import { EARTHLIKE_CLIMATE_STRUCTURE_STUDY } from "../../../../src/recipes/standard/metrics/studies/benchmarks/earthlike-climate-structure.study.js";
import { EARTHLIKE_WIND_STRUCTURE_STUDY } from "../../../../src/recipes/standard/metrics/studies/benchmarks/earthlike-wind-structure.study.js";
import { standardMetricScenarioSignature } from "../../../../src/recipes/standard/metrics/studies/scenarios.js";

describe("Standard catalog identity proof", () => {
  it("pins the climate cohort and reuses existing Huge and Standard scenario identities", () => {
    const { scenarios, sampleTargets } = EARTHLIKE_CLIMATE_STRUCTURE_STUDY;
    expect(
      scenarios.map(({ preset, mapSeed, gameSeed, aliveMajorPlayerIds }) => ({
        preset: preset.id,
        mapSeed,
        gameSeed,
        players: aliveMajorPlayerIds,
      }))
    ).toEqual([
      {
        preset: "MAPSIZE_HUGE",
        mapSeed: 1018,
        gameSeed: 1018,
        players: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      },
      {
        preset: "MAPSIZE_STANDARD",
        mapSeed: 1018,
        gameSeed: 1018,
        players: [0, 1, 2, 3, 4, 5, 6, 7],
      },
      {
        preset: "MAPSIZE_STANDARD",
        mapSeed: 1,
        gameSeed: 1,
        players: [0, 1, 2, 3, 4, 5, 6, 7],
      },
      {
        preset: "MAPSIZE_STANDARD",
        mapSeed: 42,
        gameSeed: 42,
        players: [0, 1, 2, 3, 4, 5, 6, 7],
      },
    ]);
    const existing = [
      ...SHIPPED_IDENTITY_STUDIES.map(({ scenario }) => scenario),
      ...EARTHLIKE_WIND_STRUCTURE_STUDY.scenarios,
    ];
    for (const scenario of scenarios) {
      const shared = existing.find(({ id }) => id === scenario.id);
      expect(shared).toBeDefined();
      if (!shared) throw new Error(`Missing shared scenario ${scenario.id}`);
      expect(standardMetricScenarioSignature(scenario)).toBe(
        standardMetricScenarioSignature(shared)
      );
    }
    expect(sampleTargets.map(({ id }) => id)).toContain("standard/integrity");
  });

  it("exhausts the eight-config durable catalog without presence filtering", () => {
    expect(MAP_CONFIG_CATALOG_IDS).toHaveLength(8);
    expect(MAP_CONFIG_CATALOG_IDS).not.toContain("mountain-rivers-patch");
    expect(Object.keys(SHIPPED_IDENTITY_TARGETS)).toEqual([...MAP_CONFIG_CATALOG_IDS]);
    expect(SHIPPED_IDENTITY_STUDIES.map(({ scenario }) => scenario.config.id)).toEqual([
      ...MAP_CONFIG_CATALOG_IDS,
    ]);
  });

  it("pins the matched mountain-drama axes and exact plate activity contrast", () => {
    expect(MOUNTAIN_DRAMA_STUDY.scenarios).toHaveLength(12);
    expect(new Set(MOUNTAIN_DRAMA_STUDY.scenarios.map(({ config }) => config.id))).toEqual(
      new Set([
        MOUNTAIN_DRAMA_COHORT_IDENTITY.referenceConfigurationId,
        ...MOUNTAIN_DRAMA_COHORT_IDENTITY.mountainConfigurationIds,
      ])
    );
    expect(new Set(MOUNTAIN_DRAMA_STUDY.scenarios.map(({ mapSeed }) => mapSeed))).toEqual(
      new Set(MOUNTAIN_DRAMA_COHORT_IDENTITY.seeds)
    );

    for (const scenario of MOUNTAIN_DRAMA_STUDY.scenarios) {
      const expected =
        scenario.config.id === MOUNTAIN_DRAMA_COHORT_IDENTITY.referenceConfigurationId ? 0.5 : 0.85;
      expect(
        scenario.config.config["foundation-tectonics"].knobs.plateActivity,
        scenario.config.id
      ).toBe(expected);
    }
  });
});
