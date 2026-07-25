import { describe, expect, it } from "bun:test";
import {
  admitPositiveResourceRegionMinimum,
  INITIAL_MAP_RESOURCE_AUTHORING_AGE,
  resolveResourceRegionMinimumRequirement,
} from "@mapgen/domain/resources";

describe("resource regional-minimum policy", () => {
  const minimumPerHemisphere = admitPositiveResourceRegionMinimum(8);

  it("preserves exact engine decisions", () => {
    expect(
      resolveResourceRegionMinimumRequirement({
        resourceType: "RESOURCE_GOLD",
        age: INITIAL_MAP_RESOURCE_AUTHORING_AGE,
        minimumPerHemisphere,
        observedRequiredForAge: true,
      })
    ).toEqual({ kind: "required", minimumPerHemisphere, source: "engine" });
    expect(
      resolveResourceRegionMinimumRequirement({
        resourceType: "RESOURCE_GOLD",
        age: INITIAL_MAP_RESOURCE_AUTHORING_AGE,
        minimumPerHemisphere,
        observedRequiredForAge: false,
      })
    ).toEqual({ kind: "not-required", minimumPerHemisphere, source: "engine" });
  });

  it("uses unconditional staple authority when the engine observation is unavailable", () => {
    expect(
      resolveResourceRegionMinimumRequirement({
        resourceType: "RESOURCE_GOLD",
        age: INITIAL_MAP_RESOURCE_AUTHORING_AGE,
        minimumPerHemisphere,
        observedRequiredForAge: null,
      })
    ).toEqual({
      kind: "required",
      minimumPerHemisphere,
      source: "static-unconditional",
      basis: ["staple"],
    });
  });

  it("keeps unavailable conditional requirements unresolved", () => {
    expect(
      resolveResourceRegionMinimumRequirement({
        resourceType: "RESOURCE_FISH",
        age: INITIAL_MAP_RESOURCE_AUTHORING_AGE,
        minimumPerHemisphere,
        observedRequiredForAge: null,
      })
    ).toEqual({
      kind: "unresolved",
      minimumPerHemisphere,
      source: "engine-unavailable",
    });
  });

  it("keeps a zero official minimum not applicable", () => {
    expect(
      resolveResourceRegionMinimumRequirement({
        resourceType: "RESOURCE_FISH",
        age: INITIAL_MAP_RESOURCE_AUTHORING_AGE,
        minimumPerHemisphere: 0,
        observedRequiredForAge: true,
      })
    ).toEqual({ kind: "not-applicable", reason: "no-official-minimum" });
  });
});
