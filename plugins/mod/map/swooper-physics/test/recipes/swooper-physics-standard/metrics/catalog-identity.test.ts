import { describe, expect, it } from "bun:test";

import { MAP_CONFIG_CATALOG_IDS } from "../../../../src/maps/catalog/membership.js";
import { SHIPPED_IDENTITY_STUDIES } from "../../../../src/recipes/standard/metrics/studies/benchmarks/shipped-identities.study.js";
import { SHIPPED_IDENTITY_TARGETS } from "../../../../src/recipes/standard/metrics/targets/identities.js";
import { STANDARD_METRIC_STUDIES } from "../../../../src/recipes/standard/metrics/studies/catalog.js";
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

  it("exhausts the three-config durable catalog without presence filtering", () => {
    expect(MAP_CONFIG_CATALOG_IDS).toEqual([
      "swooper-earthlike", "swooper-desert-mountains", "sundered-archipelago",
    ]);
    expect(MAP_CONFIG_CATALOG_IDS).not.toContain("mountain-rivers-patch");
    expect(Object.keys(SHIPPED_IDENTITY_TARGETS)).toEqual([...MAP_CONFIG_CATALOG_IDS]);
    expect(SHIPPED_IDENTITY_STUDIES.map(({ scenario }) => scenario.config.id)).toEqual([
      ...MAP_CONFIG_CATALOG_IDS,
    ]);
  });

  it("retires only the Archipelago unconditional lake floor", () => {
    for (const id of MAP_CONFIG_CATALOG_IDS) {
      const floor = SHIPPED_IDENTITY_TARGETS[id].expectations.find(
        (expectation) => expectation.id === "largest-lake-component"
      );
      if (id === "sundered-archipelago") expect(floor).toBeUndefined();
      else expect(floor?.comparator).toEqual({ kind: "at-least", value: 4 });
    }
    expect(SHIPPED_IDENTITY_TARGETS["sundered-archipelago"].expectations.map(({ id }) => id))
      .toEqual(["configuration-identity", "wetland-share", "reef-family-share", "vegetation-family-variety",
        "required-feature/feature_atoll", "required-feature/feature_forest", "required-feature/feature_rainforest",
        "required-feature/feature_mangrove"]);
  });

  it("retains all thirteen Earthlike studies inside the 22-study, 57-scenario bank", () => {
    expect(STANDARD_METRIC_STUDIES).toHaveLength(22);
    expect(STANDARD_METRIC_STUDIES.filter(({ id }) => id.startsWith("earthlike/")).map(({ id }) => id))
      .toEqual([
        "earthlike/geography", "earthlike/biome-structure", "earthlike/climate-structure",
        "earthlike/deep-ocean", "earthlike/river-network", "earthlike/wind-structure",
        "earthlike/ecology", "earthlike/cold-reef", "earthlike/floodplain", "earthlike/orogeny",
        "earthlike/relief-representative", "earthlike/huge-relief-cohort", "earthlike/placement",
      ]);
    const scenarios = new Map(STANDARD_METRIC_STUDIES.flatMap((study) =>
      study.kind === "sample" ? [study.scenario] : study.scenarios
    ).map((scenario) => [scenario.id, scenario]));
    expect(scenarios.size).toBe(57);
    for (const [configurationId, count] of [
      ["swooper-earthlike", 47], ["swooper-desert-mountains", 5], ["sundered-archipelago", 5],
    ] as const) {
      expect([...scenarios.values()].filter(({ config }) => config.id === configurationId))
        .toHaveLength(count);
    }
  });
});
