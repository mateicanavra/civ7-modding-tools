import { describe, expect, it } from "bun:test";

import {
  CIV7_BROWSER_TABLES_V0,
  type OfficialResourceType,
  type ResourceLegalitySurface,
  resolveResourceRuntimeIds,
} from "@civ7/map-policy";
import {
  admitPositiveResourceRegionMinimum,
  getInitialMapResourcePolicyForType,
  INITIAL_MAP_RESOURCE_AUTHORING_AGE,
} from "@mapgen/domain/resources";
import { EARTHLIKE_RESOURCE_EXPECTATIONS } from "@mapgen/domain/resources/model/data/earthlike-expectations/index.js";
import { RESOURCE_HABITAT_SIGNALS } from "@mapgen/domain/resources/model/policy/habitat-eligibility.js";
import {
  buildResourceDemands,
  buildRiverResourceExclusionMask,
  resolveResourceRegionMinimumRequirement,
} from "../../../../../../src/recipes/standard/stages/placement/steps/plan-resources/planning.js";

const SYNTHETIC_DIMENSIONS = { width: 4, height: 3 } as const;

/**
 * Rivers product requirement re-expressed in the resources demand pipeline:
 * river tiles (planned or engine-projected, navigable water included) are
 * removed from every demand's legalMask before legal/eligible counts, so the
 * exclusion flows through site selection, the support pass, and stamping.
 */
describe("resource demand planning", () => {
  const { width, height } = SYNTHETIC_DIMENSIONS;
  const size = width * height;

  function findFixtureFacts(requestedType?: OfficialResourceType) {
    const age = INITIAL_MAP_RESOURCE_AUTHORING_AGE;
    const resolution = resolveResourceRuntimeIds();
    const validRows = CIV7_BROWSER_TABLES_V0.resourceValidPlacementRows as Record<
      string,
      readonly (readonly [number, number, number])[] | undefined
    >;
    for (const expectation of EARTHLIKE_RESOURCE_EXPECTATIONS) {
      const resourceType = expectation.resourceType;
      if (requestedType !== undefined && resourceType !== requestedType) continue;
      const signal = RESOURCE_HABITAT_SIGNALS.get(resourceType);
      if (!signal || signal.family === "aquatic") continue;
      if (getInitialMapResourcePolicyForType(resourceType, age)?.status !== "eligible") continue;
      const resolved = resolution.byType.get(resourceType);
      if (!resolved) continue;
      if (requestedType === undefined && resolved.minimumPerHemisphere > 0) continue;
      const rows = validRows[String(resolved.resourceTypeId)];
      if (!rows?.length) continue;
      return { resourceType, signal, placementRow: rows[0]! };
    }
    throw new Error(
      requestedType === undefined
        ? "No age-eligible land resource without an official minimum has policy placement rows."
        : `No age-eligible land fixture facts found for ${requestedType}.`
    );
  }

  function buildFixture(requestedType?: OfficialResourceType) {
    const { resourceType, signal, placementRow } = findFixtureFacts(requestedType);
    const legalitySurface: ResourceLegalitySurface = {
      width,
      height,
      biomeType: new Uint8Array(size).fill(placementRow[0]),
      terrainType: new Uint8Array(size).fill(placementRow[1]),
      featureType: new Int16Array(size).fill(placementRow[2]),
      engineWaterMask: new Uint8Array(size),
    };
    const habitat: Record<string, Uint8Array | Float32Array> = {
      aquaticIntensity: new Float32Array(size).fill(1),
      cultivatedIntensity: new Float32Array(size).fill(1),
      terrestrialIntensity: new Float32Array(size).fill(1),
      geologicalIntensity: new Float32Array(size).fill(1),
    };
    for (const field of signal.primary) habitat[field] = new Uint8Array(size).fill(1);
    const plannedRows = [
      {
        resourceType,
        status: "planned" as const,
        targetIntentCount: 2,
        eligibleTileCount: size,
      },
    ];
    return { legalitySurface, habitat, plannedRows };
  }

  it("unions planned and engine-projected river masks", () => {
    const plannedMajorRiverMask = new Uint8Array(size);
    plannedMajorRiverMask[1] = 1;
    const engineNavigableRiverMask = new Uint8Array(size);
    engineNavigableRiverMask[5] = 1;

    const mask = buildRiverResourceExclusionMask({
      width,
      height,
      projectedNavigableRivers: { plannedMajorRiverMask },
      engineProjectionRivers: { engineNavigableRiverMask },
    });

    expect(mask.length).toBe(size);
    expect(mask[1]).toBe(1);
    expect(mask[5]).toBe(1);
    expect([...mask].reduce((sum, value) => sum + value, 0)).toBe(2);
  });

  it("rejects river masks whose length does not match the grid", () => {
    expect(() =>
      buildRiverResourceExclusionMask({
        width,
        height,
        projectedNavigableRivers: { riverMask: new Uint8Array(size + 1) },
      })
    ).toThrow(/projectedNavigableRivers\.riverMask/);
  });

  it("zeroes river tiles out of demand legalMask before legal/eligible counts", () => {
    const fixture = buildFixture();
    const baseline = buildResourceDemands({
      width,
      height,
      plannedRows: fixture.plannedRows,
      habitat: fixture.habitat as never,
      legalitySurface: fixture.legalitySurface,
      requiredForAgeByResourceType: new Map(),
    });
    expect(baseline.demands.length).toBe(1);
    expect(baseline.demands[0]!.legalMask[0]).toBe(1);
    expect(baseline.demands[0]!.legalMask[1]).toBe(1);
    const baselineSummary = baseline.summaries[0]!;

    const riverResourceExclusionMask = new Uint8Array(size);
    riverResourceExclusionMask[0] = 1;
    riverResourceExclusionMask[1] = 1;
    const excluded = buildResourceDemands({
      width,
      height,
      plannedRows: fixture.plannedRows,
      habitat: fixture.habitat as never,
      legalitySurface: fixture.legalitySurface,
      requiredForAgeByResourceType: new Map(),
      riverResourceExclusionMask,
    });

    expect(excluded.demands.length).toBe(1);
    const demand = excluded.demands[0]!;
    expect(demand.legalMask[0]).toBe(0);
    expect(demand.legalMask[1]).toBe(0);
    expect(demand.legalMask[2]).toBe(1);
    const summary = excluded.summaries[0]!;
    expect(summary.legalTileCount).toBe(baselineSummary.legalTileCount - 2);
    expect(summary.eligibleTileCount).toBe(baselineSummary.eligibleTileCount - 2);
    for (let i = 0; i < size; i++) {
      if (riverResourceExclusionMask[i] === 1) expect(demand.legalMask[i]).toBe(0);
    }
  });

  it("excludes a type entirely when rivers cover all its legal tiles", () => {
    const fixture = buildFixture();
    const result = buildResourceDemands({
      width,
      height,
      plannedRows: fixture.plannedRows,
      habitat: fixture.habitat as never,
      legalitySurface: fixture.legalitySurface,
      requiredForAgeByResourceType: new Map(),
      riverResourceExclusionMask: new Uint8Array(size).fill(1),
    });
    expect(result.demands.length).toBe(0);
    expect(result.excluded).toEqual([
      expect.objectContaining({ reason: { kind: "no-admitted-legal-tiles" } }),
    ]);
  });

  it("rejects an exclusion mask whose length does not match the grid", () => {
    const fixture = buildFixture();
    expect(() =>
      buildResourceDemands({
        width,
        height,
        plannedRows: fixture.plannedRows,
        habitat: fixture.habitat as never,
        legalitySurface: fixture.legalitySurface,
        requiredForAgeByResourceType: new Map(),
        riverResourceExclusionMask: new Uint8Array(size + 1),
      })
    ).toThrow(/riverResourceExclusionMask/);
  });

  it("preserves exact engine true and false decisions for an official regional minimum", () => {
    const minimumPerHemisphere = admitPositiveResourceRegionMinimum(8);
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

  it("keeps a zero official minimum not applicable for every engine observation", () => {
    for (const observedRequiredForAge of [true, false, null] as const) {
      expect(
        resolveResourceRegionMinimumRequirement({
          resourceType: "RESOURCE_FISH",
          age: INITIAL_MAP_RESOURCE_AUTHORING_AGE,
          minimumPerHemisphere: 0,
          observedRequiredForAge,
        })
      ).toEqual({ kind: "not-applicable", reason: "no-official-minimum" });
    }
  });

  it("refuses non-integer and negative regional minimums before authority resolution", () => {
    for (const minimumPerHemisphere of [-1, 0.5]) {
      expect(() =>
        resolveResourceRegionMinimumRequirement({
          resourceType: "RESOURCE_GOLD",
          age: INITIAL_MAP_RESOURCE_AUTHORING_AGE,
          minimumPerHemisphere,
          observedRequiredForAge: true,
        })
      ).toThrow(/positive integer/);
    }
  });

  it("uses Gold and Silver staple authority when the engine observation is unavailable", () => {
    const minimumPerHemisphere = admitPositiveResourceRegionMinimum(8);
    for (const resourceType of ["RESOURCE_GOLD", "RESOURCE_SILVER"] as const) {
      expect(
        resolveResourceRegionMinimumRequirement({
          resourceType,
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
    }
  });

  it("keeps an unavailable conditional regional minimum unresolved", () => {
    const minimumPerHemisphere = admitPositiveResourceRegionMinimum(8);
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

  it("fails closed when a positive-minimum planned resource has no engine observation", () => {
    const fixture = buildFixture("RESOURCE_GOLD");
    expect(() =>
      buildResourceDemands({
        width,
        height,
        plannedRows: fixture.plannedRows,
        habitat: fixture.habitat as never,
        legalitySurface: fixture.legalitySurface,
        requiredForAgeByResourceType: new Map(),
      })
    ).toThrow(
      /Missing required-for-age observation for RESOURCE_GOLD with official regional minimum 8/
    );
  });
});
