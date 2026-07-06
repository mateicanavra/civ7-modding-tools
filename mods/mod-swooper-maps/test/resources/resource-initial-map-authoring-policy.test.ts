import { describe, expect, it } from "bun:test";

import { OFFICIAL_RESOURCE_CORPUS } from "@civ7/map-policy";
import {
  DEFERRED_INITIAL_MAP_RESOURCE_TYPES,
  getInitialMapResourcePolicyForType,
  INITIAL_MAP_RESOURCE_AUTHORING_AGE,
  INITIAL_MAP_RESOURCE_AUTHORING_POLICY,
  INITIAL_MAP_RESOURCE_TYPES,
} from "@mapgen/domain/resources/model/policy/initial-map-authoring.js";

function expectedTypesForAge(age: string): string[] {
  return OFFICIAL_RESOURCE_CORPUS.filter(
    (entry) => entry.validAges.includes(age as never) && entry.placeability.status === "placeable"
  ).map((entry) => entry.resourceType);
}

describe("initial map resource authoring policy", () => {
  it("derives complete initial-map eligibility from the official resource corpus", () => {
    expect(INITIAL_MAP_RESOURCE_AUTHORING_AGE).toBe("AGE_ANTIQUITY");
    expect(INITIAL_MAP_RESOURCE_AUTHORING_POLICY).toHaveLength(OFFICIAL_RESOURCE_CORPUS.length);
    expect(INITIAL_MAP_RESOURCE_TYPES).toHaveLength(34);
    expect(INITIAL_MAP_RESOURCE_TYPES).toEqual(expectedTypesForAge("AGE_ANTIQUITY"));

    for (const entry of INITIAL_MAP_RESOURCE_AUTHORING_POLICY) {
      const corpus = OFFICIAL_RESOURCE_CORPUS.find(
        (row) => row.resourceType === entry.resourceType
      );
      expect(corpus).toBeDefined();
      expect(entry.validAges).toEqual(corpus!.validAges);
      const expectedStatus =
        corpus!.placeability.status !== "placeable"
          ? "blocked-official"
          : corpus!.validAges.includes("AGE_ANTIQUITY")
            ? "eligible"
            : "deferred-future-age";
      expect(entry.status).toBe(expectedStatus);
      expect(entry.rationale.length).toBeGreaterThan(0);
      expect(getInitialMapResourcePolicyForType(entry.resourceType)).toEqual(entry);
    }
  });

  it("defers future-age resources including oil, coal, and rubber from initial map authoring", () => {
    expect(DEFERRED_INITIAL_MAP_RESOURCE_TYPES).toEqual([
      "RESOURCE_COCOA",
      "RESOURCE_FURS",
      "RESOURCE_SPICES",
      "RESOURCE_SUGAR",
      "RESOURCE_TEA",
      "RESOURCE_TRUFFLES",
      "RESOURCE_NITER",
      "RESOURCE_WHALES",
      "RESOURCE_COFFEE",
      "RESOURCE_TOBACCO",
      "RESOURCE_CITRUS",
      "RESOURCE_COAL",
      "RESOURCE_OIL",
      "RESOURCE_QUININE",
      "RESOURCE_RUBBER",
      "RESOURCE_PITCH",
    ]);

    for (const resourceType of ["RESOURCE_COAL", "RESOURCE_OIL", "RESOURCE_RUBBER"] as const) {
      const policy = getInitialMapResourcePolicyForType(resourceType);
      expect(policy).toMatchObject({
        authoringAge: "AGE_ANTIQUITY",
        status: "deferred-future-age",
      });
      expect(INITIAL_MAP_RESOURCE_TYPES).not.toContain(resourceType);
    }
  });

  it("derives symbolic authoring policy for an explicit age", () => {
    const modern = INITIAL_MAP_RESOURCE_AUTHORING_POLICY.filter((entry) => {
      const policy = getInitialMapResourcePolicyForType(entry.resourceType, "AGE_MODERN");
      return policy?.status === "eligible";
    }).map((entry) => entry.resourceType);

    expect(modern).toEqual(expectedTypesForAge("AGE_MODERN"));
    expect(modern).not.toContain("RESOURCE_HIDES"); // Antiquity-only
    expect(modern).not.toContain("RESOURCE_SALT"); // Antiquity-only
    expect(modern).toContain("RESOURCE_COAL"); // Modern-only
    expect(modern).toContain("RESOURCE_OIL"); // Modern-only
  });
});
