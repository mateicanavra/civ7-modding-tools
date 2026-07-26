import { describe, expect, it } from "bun:test";

import { NATURAL_WONDER_CATALOG } from "@civ7/map-policy";
import { WONDER_GROUPS } from "@mapgen/domain/placement/modules/wonders/model/policy/natural-wonder-groups.js";

describe("natural wonder group policy", () => {
  it("assigns every supported Civ7 wonder to one pinned physical-suitability group", () => {
    const membership = Object.fromEntries(
      Object.entries(WONDER_GROUPS).map(([group, definition]) => [
        group,
        [...definition.features].sort((left, right) => left - right),
      ])
    );
    expect(membership).toEqual({
      A: [35, 41],
      B: [37],
      C: [29, 44, 45],
      D: [0],
      E: [32, 34],
      F: [1, 33, 36, 38, 40, 42, 43],
      G: [28],
      H: [31, 39],
      I: [30],
    });

    const allFeatures = Object.values(WONDER_GROUPS).flatMap((definition) => definition.features);
    const groupedFeatureTypes = [...new Set(allFeatures)].sort((left, right) => left - right);
    const supportedFeatureTypes = NATURAL_WONDER_CATALOG.map((entry) => entry.featureType).sort(
      (left, right) => left - right
    );
    expect(allFeatures.length).toBe(groupedFeatureTypes.length);
    expect(groupedFeatureTypes).toEqual(supportedFeatureTypes);
  });

  it("preserves the pinned physical weighting for every suitability group", () => {
    const signals = {
      relief: 0.5,
      elevN: 0.4,
      arid: 0.6,
      warm: 0.7,
      temperate: 0.8,
      vegN: 0.3,
      fertN: 0.2,
      dischN: 0.9,
      slopeN: 0.1,
      shelfN: 1,
      deepN: 0.55,
      moist: 0.45,
    };
    const suitability = (group: keyof typeof WONDER_GROUPS) =>
      WONDER_GROUPS[group].suitability(signals);

    expect(suitability("A")).toBeCloseTo(0.55 * 0.5 + 0.35 * 0.4 + 0.1 * 0.7, 9);
    expect(suitability("B")).toBeCloseTo(0.5 * 1 + 0.3 * 0.5 + 0.2 * 0.7, 9);
    expect(suitability("C")).toBeCloseTo(0.55 * 1 + 0.3 * 0.7 + 0.15 * (1 - 0.6), 9);
    expect(suitability("D")).toBeCloseTo(0.7 * 0.55 + 0.3 * (1 - 0.6), 9);
    expect(suitability("E")).toBeCloseTo(0.45 * 0.9 + 0.3 * 0.1 + 0.25 * 0.5, 9);
    expect(suitability("F")).toBeCloseTo(0.5 * 0.4 + 0.4 * 0.5 + 0.1 * (1 - 0.3), 9);
    expect(suitability("G")).toBeCloseTo(0.45 * 0.2 + 0.3 * 0.45 + 0.25 * (1 - 0.5), 9);
    expect(suitability("H")).toBeCloseTo(0.5 * 0.6 + 0.3 * 0.4 + 0.2 * 0.5, 9);
    expect(suitability("I")).toBeCloseTo(0.55 * 0.3 + 0.3 * 0.45 + 0.15 * 0.8, 9);
  });
});
