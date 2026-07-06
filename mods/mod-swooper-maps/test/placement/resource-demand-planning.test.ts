import { describe, expect, it } from "bun:test";

import {
  CIV7_BROWSER_TABLES_V0,
  type ResourceLegalitySurface,
  resolveResourceRuntimeIds,
} from "@civ7/map-policy";
import {
  EARTHLIKE_RESOURCE_EXPECTATIONS,
} from "@mapgen/domain/resources/model/data/earthlike-expectations/index.js";
import { RESOURCE_HABITAT_SIGNALS } from "@mapgen/domain/resources/model/policy/habitat-eligibility.js";
import {
  getInitialMapResourcePolicyForType,
  INITIAL_MAP_RESOURCE_AUTHORING_AGE,
} from "@mapgen/domain/resources/model/policy/initial-map-authoring.js";
import {
  buildResourceDemands,
  buildRiverResourceExclusionMask,
} from "../../src/recipes/standard/stages/placement/steps/plan-resources/planning.js";

/**
 * Rivers product requirement re-expressed in the resources demand pipeline:
 * river tiles (planned or engine-projected, navigable water included) are
 * removed from every demand's legalMask before legal/eligible counts, so the
 * exclusion flows through site selection, the support pass, and stamping.
 */
describe("resource demand planning river exclusion", () => {
  const width = 4;
  const height = 3;
  const size = width * height;

  function findExcludableType() {
    const age = INITIAL_MAP_RESOURCE_AUTHORING_AGE;
    const resolution = resolveResourceRuntimeIds();
    const validRows = CIV7_BROWSER_TABLES_V0.resourceValidPlacementRows as Record<
      string,
      readonly (readonly [number, number, number])[] | undefined
    >;
    for (const expectation of EARTHLIKE_RESOURCE_EXPECTATIONS) {
      const resourceType = expectation.resourceType;
      const signal = RESOURCE_HABITAT_SIGNALS.get(resourceType);
      if (!signal || signal.family === "aquatic") continue;
      if (getInitialMapResourcePolicyForType(resourceType, age)?.status !== "eligible") continue;
      const resolved = resolution.byType.get(resourceType);
      if (!resolved) continue;
      const rows = validRows[String(resolved.resourceTypeId)];
      if (!rows?.length) continue;
      return { resourceType, signal, placementRow: rows[0]! };
    }
    throw new Error("No age-eligible land resource type with policy placement rows found.");
  }

  function buildFixture() {
    const { resourceType, signal, placementRow } = findExcludableType();
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
      riverResourceExclusionMask: new Uint8Array(size).fill(1),
    });
    expect(result.demands.length).toBe(0);
    expect(result.excluded).toEqual([expect.objectContaining({ reason: "no-policy-legal-tiles" })]);
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
        riverResourceExclusionMask: new Uint8Array(size + 1),
      })
    ).toThrow(/riverResourceExclusionMask/);
  });
});
