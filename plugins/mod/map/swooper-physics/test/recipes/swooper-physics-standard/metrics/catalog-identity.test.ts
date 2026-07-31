import { describe, expect, it } from "bun:test";

import { MAP_CONFIG_CATALOG_IDS } from "../../../../src/maps/catalog/membership.js";
import { MOUNTAIN_DRAMA_STUDY } from "../../../../src/recipes/standard/metrics/studies/benchmarks/mountain-drama.study.js";
import { SHIPPED_IDENTITY_STUDIES } from "../../../../src/recipes/standard/metrics/studies/benchmarks/shipped-identities.study.js";
import { SHIPPED_IDENTITY_TARGETS } from "../../../../src/recipes/standard/metrics/targets/identities.js";
import { MOUNTAIN_DRAMA_COHORT_IDENTITY } from "../../../../src/recipes/standard/metrics/targets/relief.js";

describe("Standard catalog identity proof", () => {
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
