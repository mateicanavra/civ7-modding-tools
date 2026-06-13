import { describe, expect, it } from "bun:test";

import {
  OFFICIAL_RESOURCE_CORPUS,
  requireResourceRuntimeId,
  resolveResourceRuntimeIds,
} from "../../src/domain/resources/index.js";

describe("resource runtime id proof (placement-realignment S3)", () => {
  it("proves every corpus symbolic id against the generated policy tables", () => {
    const resolution = resolveResourceRuntimeIds();
    expect(resolution.status).toBe("verified");
    expect(resolution.checkedCount).toBe(OFFICIAL_RESOURCE_CORPUS.length);
    expect(resolution.byType.size).toBe(OFFICIAL_RESOURCE_CORPUS.length);
    expect(resolution.byId.size).toBe(OFFICIAL_RESOURCE_CORPUS.length);
  });

  it("carries official Weight / MinimumPerHemisphere / required-age facts", () => {
    const gold = requireResourceRuntimeId("RESOURCE_GOLD");
    expect(gold.weight).toBe(20);
    expect(gold.minimumPerHemisphere).toBe(8);
    expect(gold.requiredForAges).toContain("AGE_ANTIQUITY");

    const hides = requireResourceRuntimeId("RESOURCE_HIDES");
    expect(hides.weight).toBe(40);

    const fish = requireResourceRuntimeId("RESOURCE_FISH");
    expect(fish.requiredForAges).toContain("AGE_ANTIQUITY");
  });

  it("hard-fails on unresolvable symbolic ids instead of degrading", () => {
    expect(() => requireResourceRuntimeId("RESOURCE_DOES_NOT_EXIST" as never)).toThrow(
      /No proven runtime id/
    );
  });
});
