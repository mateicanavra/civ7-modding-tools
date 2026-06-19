import { describe, expect, it } from "bun:test";

import { CIV7_BROWSER_TABLES_V0 } from "@civ7/map-policy";

import placementDomain from "../../src/domain/placement/ops.js";
import { WONDER_GROUPS } from "../../src/domain/placement/ops/plan-natural-wonders/strategies/default.js";
import {
  EARTHLIKE_RESOURCE_EXPECTATIONS,
  resolveResourceRuntimeIds,
} from "../../src/domain/resources/index.js";
import { RESOURCE_HABITAT_SIGNALS } from "../../src/domain/resources/policy/habitat-eligibility.js";
import {
  getInitialMapResourcePolicyForType,
  resolveActiveResourceAge,
} from "../../src/domain/resources/policy/initial-map-authoring.js";
import type { ResourceLegalitySurface } from "../../src/domain/resources/policy/resource-legality.js";
import {
  buildResourceDemands,
  buildRiverResourceExclusionMask,
} from "../../src/recipes/standard/stages/placement/steps/plan-resources/planning.js";
import { runOpValidated } from "../support/compiler-helpers.js";

const { planNaturalWonders, planResources, planStarts, planWonders } = placementDomain.ops;

describe("placement plan operations", () => {
  it("wonder-group registry: membership and suitability formulas match the pinned definitions", () => {
    // Membership is the single source of truth (the feature->group map is derived).
    const membership = Object.fromEntries(
      Object.entries(WONDER_GROUPS).map(([group, def]) => [group, [...def.features].sort((a, b) => a - b)])
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
    // All 20 wonders, each in exactly one group (no missing/duplicate membership).
    const allFeatures = Object.values(WONDER_GROUPS).flatMap((def) => def.features);
    expect(allFeatures.length).toBe(20);
    expect(new Set(allFeatures).size).toBe(20);

    // Characterization: pin each group's formula for a fixed signal vector — guards
    // the load-bearing weights through the registry refactor (all results <= 1, so
    // clamp01 is identity here).
    const s = {
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
      deepN: 0,
      moist: 0.45,
    };
    const suit = (g: keyof typeof WONDER_GROUPS) => WONDER_GROUPS[g].suitability(s);
    expect(suit("A")).toBeCloseTo(0.55 * 0.5 + 0.35 * 0.4 + 0.1 * 0.7, 9);
    expect(suit("B")).toBeCloseTo(0.5 * 1 + 0.3 * 0.5 + 0.2 * 0.7, 9);
    expect(suit("C")).toBeCloseTo(0.55 * 1 + 0.3 * 0.7 + 0.15 * (1 - 0.6), 9);
    expect(suit("D")).toBeCloseTo(0.7 * 0 + 0.3 * (1 - 0.6), 9);
    expect(suit("E")).toBeCloseTo(0.45 * 0.9 + 0.3 * 0.1 + 0.25 * 0.5, 9);
    expect(suit("F")).toBeCloseTo(0.5 * 0.4 + 0.4 * 0.5 + 0.1 * (1 - 0.3), 9);
    expect(suit("G")).toBeCloseTo(0.45 * 0.2 + 0.3 * 0.45 + 0.25 * (1 - 0.5), 9);
    expect(suit("H")).toBeCloseTo(0.5 * 0.6 + 0.3 * 0.4 + 0.2 * 0.5, 9);
    expect(suit("I")).toBeCloseTo(0.55 * 0.3 + 0.3 * 0.45 + 0.15 * 0.8, 9);
  });

  it("materializes plan-starts tier bias from property defaults", () => {
    expect(planStarts.defaultConfig.config.tierBias).toEqual({
      primary: 0.08,
      islandCluster: 0.02,
      marginal: -0.08,
    });
  });

  it("plans wonders from map-size defaults without bonus inflation", () => {
    const result = runOpValidated(
      planWonders,
      { mapInfo: { NumNaturalWonders: 2 } },
      {
        strategy: "default",
        config: {},
      }
    );
    expect(result.wondersCount).toBe(2);
  });

  it("rejects legacy wondersPlusOne config", () => {
    expect(() =>
      runOpValidated(
        planWonders,
        { mapInfo: { NumNaturalWonders: 2 } },
        {
          strategy: "default",
          config: { wondersPlusOne: true },
        }
      )
    ).toThrow();
  });

  it("plans zero wonders when map-size default is absent", () => {
    const result = runOpValidated(
      planWonders,
      { mapInfo: {} },
      {
        strategy: "default",
        config: {},
      }
    );
    expect(result.wondersCount).toBe(0);
  });

  it("plans deterministic natural wonder placements from physical fields", () => {
    const width = 4;
    const height = 3;
    const size = width * height;
    const result = runOpValidated(
      planNaturalWonders,
      {
        width,
        height,
        wondersCount: 2,
        landMask: new Uint8Array(size).fill(1),
        elevation: Int16Array.from([5, 20, 30, 40, 10, 100, 70, 20, 0, 10, 15, 60]),
        aridityIndex: new Float32Array(size).fill(0.3),
        riverClass: new Uint8Array(size),
        lakeMask: new Uint8Array(size),
        coastTerrainType: 2,
        mountainTerrainType: 3,
        iceFeatureType: 4,
        terrainType: new Uint8Array(size).fill(1),
        biomeType: new Uint8Array(size).fill(1),
        featureType: new Int16Array(size).fill(-1),
        noFeatureType: -1,
        naturalWonderBlockedMask: new Uint8Array(size),
        featureCatalog: [
          {
            featureType: 1001,
            direction: 0,
            footprintOffsetsByParity: { even: [{ dx: 0, dy: 0 }], odd: [{ dx: 0, dy: 0 }] },
          },
          {
            featureType: 1002,
            direction: 1,
            footprintOffsetsByParity: { even: [{ dx: 0, dy: 0 }], odd: [{ dx: 0, dy: 0 }] },
          },
        ],
      },
      {
        strategy: "default",
        config: { minSpacingTiles: 1 },
      }
    );

    expect(result.targetCount).toBe(2);
    expect(result.plannedCount).toBe(2);
    expect(result.placements.length).toBe(2);
    expect(result.placements[0]?.featureType).toBe(1001);
    expect(result.placements[1]?.featureType).toBe(1002);
  });

  it("drops explicit empty natural-wonder footprints from placement candidates", () => {
    const width = 4;
    const height = 3;
    const size = width * height;
    const result = runOpValidated(
      planNaturalWonders,
      {
        width,
        height,
        wondersCount: 2,
        landMask: new Uint8Array(size).fill(1),
        elevation: Int16Array.from([5, 20, 30, 40, 10, 100, 70, 20, 0, 10, 15, 60]),
        aridityIndex: new Float32Array(size).fill(0.3),
        riverClass: new Uint8Array(size),
        lakeMask: new Uint8Array(size),
        coastTerrainType: 2,
        mountainTerrainType: 3,
        iceFeatureType: 4,
        terrainType: new Uint8Array(size).fill(1),
        biomeType: new Uint8Array(size).fill(1),
        featureType: new Int16Array(size).fill(-1),
        noFeatureType: -1,
        naturalWonderBlockedMask: new Uint8Array(size),
        featureCatalog: [
          { featureType: 1001, direction: 0, footprintOffsetsByParity: { even: [], odd: [] } },
          {
            featureType: 1002,
            direction: 1,
            footprintOffsetsByParity: { even: [{ dx: 0, dy: 0 }], odd: [{ dx: 0, dy: 0 }] },
          },
        ],
      },
      {
        strategy: "default",
        config: { minSpacingTiles: 1 },
      }
    );

    expect(result.targetCount).toBe(1);
    expect(result.plannedCount).toBe(1);
    expect(result.placements).toEqual([expect.objectContaining({ featureType: 1002 })]);
  });

  it("produces identical natural-wonder placements on repeated runs (deterministic, no RNG)", () => {
    const width = 6;
    const height = 6;
    const size = width * height;
    const f32 = (fn: (i: number) => number) =>
      Float32Array.from(Array.from({ length: size }, (_, i) => fn(i)));
    const anchorOnly = {
      even: [{ dx: 0, dy: 0 }],
      odd: [{ dx: 0, dy: 0 }],
    };
    const input = {
      width,
      height,
      wondersCount: 3,
      landMask: new Uint8Array(size).fill(1),
      elevation: Int16Array.from(Array.from({ length: size }, (_, i) => (i * 137) % 400)),
      aridityIndex: f32((i) => ((i * 7) % 100) / 100),
      riverClass: new Uint8Array(size),
      lakeMask: new Uint8Array(size),
      coastTerrainType: 2,
      mountainTerrainType: 3,
      iceFeatureType: 4,
      terrainType: new Uint8Array(size).fill(1),
      biomeType: new Uint8Array(size).fill(1),
      featureType: new Int16Array(size).fill(-1),
      noFeatureType: -1,
      naturalWonderBlockedMask: new Uint8Array(size),
      vegetationDensity: f32((i) => ((i * 11) % 100) / 100),
      effectiveMoisture: f32((i) => ((i * 13) % 100) / 100),
      surfaceTemperature: f32((i) => (i * 17) % 30),
      fertility: f32((i) => ((i * 19) % 100) / 100),
      discharge: f32((i) => (i * 23) % 50),
      slopeClass: new Uint8Array(size),
      // Distinct requirement groups (Redwood=I, Kilimanjaro=A, Uluru=H) so the
      // per-wonder suitability — and hence the cross-wonder ranking — differs.
      featureCatalog: [
        { featureType: 30, direction: 0, footprintOffsetsByParity: anchorOnly },
        { featureType: 35, direction: 0, footprintOffsetsByParity: anchorOnly },
        { featureType: 39, direction: 0, footprintOffsetsByParity: anchorOnly },
      ],
    };
    const cfg = { strategy: "default" as const, config: { minSpacingTiles: 1 } };
    const first = runOpValidated(planNaturalWonders, input, cfg);
    const second = runOpValidated(planNaturalWonders, input, cfg);
    expect(first.placements.length).toBeGreaterThan(0);
    expect(second.placements).toEqual(first.placements);
    for (const placement of first.placements) {
      expect(placement.priority).toBeGreaterThanOrEqual(0);
      expect(placement.priority).toBeLessThanOrEqual(1);
    }
  });

  it("emits next-best fallback anchors for materialize retry", () => {
    const width = 4;
    const height = 3;
    const size = width * height;
    const result = runOpValidated(
      planNaturalWonders,
      {
        width,
        height,
        wondersCount: 1,
        landMask: new Uint8Array(size).fill(1),
        elevation: Int16Array.from([5, 20, 30, 40, 10, 100, 70, 20, 0, 10, 15, 60]),
        aridityIndex: new Float32Array(size).fill(0.3),
        riverClass: new Uint8Array(size),
        lakeMask: new Uint8Array(size),
        coastTerrainType: 2,
        mountainTerrainType: 3,
        iceFeatureType: 4,
        terrainType: new Uint8Array(size).fill(1),
        biomeType: new Uint8Array(size).fill(1),
        featureType: new Int16Array(size).fill(-1),
        noFeatureType: -1,
        naturalWonderBlockedMask: new Uint8Array(size),
        featureCatalog: [
          {
            featureType: 35, // Kilimanjaro (group A); anchor-only here
            direction: 0,
            footprintOffsetsByParity: { even: [{ dx: 0, dy: 0 }], odd: [{ dx: 0, dy: 0 }] },
          },
        ],
      },
      { strategy: "default", config: { minSpacingTiles: 0 } }
    );

    expect(result.placements.length).toBe(1);
    const placement = result.placements[0]!;
    const fallbacks = placement.fallbackPlotIndices ?? [];
    // Fallbacks exist, are capped, distinct, exclude the primary, and are valid.
    expect(fallbacks.length).toBeGreaterThan(0);
    expect(fallbacks.length).toBeLessThanOrEqual(6);
    expect(new Set(fallbacks).size).toBe(fallbacks.length);
    expect(fallbacks).not.toContain(placement.plotIndex);
    for (const idx of fallbacks) {
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(size);
    }
  });

  it("excludes overlapping footprints from fallback anchors (multi-tile + used plots)", () => {
    const width = 6;
    const height = 6;
    const size = width * height;
    // TWO-tile footprint so fallbacks must avoid MULTI-tile overlaps, not just
    // the single anchor plot. Two wonders in distinct groups so both place and
    // the second wonder's fallbacks must also avoid the first wonder's footprint.
    const twoTile = { even: [{ dx: 0, dy: 0 }, { dx: 1, dy: 0 }], odd: [{ dx: 0, dy: 0 }, { dx: 1, dy: 0 }] };
    const result = runOpValidated(
      planNaturalWonders,
      {
        width,
        height,
        wondersCount: 2,
        landMask: new Uint8Array(size).fill(1),
        elevation: Int16Array.from(Array.from({ length: size }, (_, i) => (i * 53) % 300)),
        aridityIndex: new Float32Array(size).fill(0.3),
        riverClass: new Uint8Array(size),
        lakeMask: new Uint8Array(size),
        coastTerrainType: 2,
        mountainTerrainType: 3,
        iceFeatureType: 4,
        terrainType: new Uint8Array(size).fill(1),
        biomeType: new Uint8Array(size).fill(1),
        featureType: new Int16Array(size).fill(-1),
        noFeatureType: -1,
        naturalWonderBlockedMask: new Uint8Array(size),
        featureCatalog: [
          { featureType: 35, direction: 0, footprintOffsetsByParity: twoTile }, // group A
          { featureType: 30, direction: 0, footprintOffsetsByParity: twoTile }, // group I
        ],
      },
      { strategy: "default", config: { minSpacingTiles: 0 } }
    );

    expect(result.placements.length).toBe(2);
    // Reconstruct the parity-resolved footprint for an anchor (TWO is parity-
    // symmetric here, so even/odd agree).
    const footprintOf = (plotIndex: number): number[] => {
      const y = (plotIndex / width) | 0;
      const x = plotIndex - y * width;
      return [
        { dx: 0, dy: 0 },
        { dx: 1, dy: 0 },
      ].map((o) => {
        const fy = y + o.dy;
        const fx = ((x + o.dx) % width + width) % width;
        return fy * width + fx;
      });
    };
    // Fallbacks for placement i must avoid its OWN footprint and the footprints
    // of every EARLIER placement (the usedPlots state when it was selected).
    for (let i = 0; i < result.placements.length; i++) {
      const placement = result.placements[i]!;
      const fallbacks = placement.fallbackPlotIndices ?? [];
      expect(fallbacks.length).toBeGreaterThan(0);
      expect(fallbacks.length).toBeLessThanOrEqual(6);
      const forbidden = new Set<number>(footprintOf(placement.plotIndex));
      for (let j = 0; j < i; j++) {
        for (const cell of footprintOf(result.placements[j]!.plotIndex)) forbidden.add(cell);
      }
      for (const fallbackAnchor of fallbacks) {
        for (const cell of footprintOf(fallbackAnchor)) {
          expect(forbidden.has(cell)).toBe(false);
        }
      }
    }
  });

  it("diminishing-returns decay flips the second pick to a fresh group (variety)", () => {
    const width = 4;
    const height = 3;
    const size = width * height;
    const anchorOnly = { even: [{ dx: 0, dy: 0 }], odd: [{ dx: 0, dy: 0 }] };
    // Uniform map tuned so two arid wonders (group H) each score ~0.8 and one
    // forest wonder (group I) scores ~0.48. WITHOUT the per-group decay the two
    // highest scores are both group H -> {31,39}. WITH decay the 2nd H drops to
    // 0.8*0.5=0.4 < 0.48, so the forest wonder wins the 2nd slot -> {30,31}.
    const result = runOpValidated(
      planNaturalWonders,
      {
        width,
        height,
        wondersCount: 2,
        landMask: new Uint8Array(size).fill(1),
        elevation: new Int16Array(size).fill(100),
        aridityIndex: new Float32Array(size).fill(1), // group H: 0.5*1 + 0.3*elevN(1) = 0.8
        riverClass: new Uint8Array(size),
        lakeMask: new Uint8Array(size),
        vegetationDensity: new Float32Array(size).fill(0.6), // group I: 0.55*0.6 = 0.33
        effectiveMoisture: new Float32Array(size).fill(0.5), //          + 0.3*0.5 = 0.15
        surfaceTemperature: new Float32Array(size).fill(35), // temperate term -> 0
        coastTerrainType: 2,
        mountainTerrainType: 3,
        iceFeatureType: 4,
        terrainType: new Uint8Array(size).fill(1),
        biomeType: new Uint8Array(size).fill(1),
        featureType: new Int16Array(size).fill(-1),
        noFeatureType: -1,
        naturalWonderBlockedMask: new Uint8Array(size),
        featureCatalog: [
          { featureType: 31, direction: 0, footprintOffsetsByParity: anchorOnly }, // Grand Canyon (H)
          { featureType: 39, direction: 0, footprintOffsetsByParity: anchorOnly }, // Uluru (H)
          { featureType: 30, direction: 0, footprintOffsetsByParity: anchorOnly }, // Redwood (I)
        ],
      },
      { strategy: "default", config: { minSpacingTiles: 0 } }
    );

    expect(result.plannedCount).toBe(2);
    const placed = result.placements.map((p) => p.featureType).sort((a, b) => a - b);
    // Cross-group MIX: one arid (31) + one forest (30); the 2nd arid (39) is NOT
    // selected because the decay made it lose to the fresh forest group.
    expect(placed).toEqual([30, 31]);
  });

  // The generic plan-resources op was deleted in placement-realignment S3;
  // resource planning is covered by the domain/resources op-contract tests
  // (derive-habitat-fields, select-resource-sites) and the recipe smoke tests.

  it("merges per-hemisphere player-count overrides", () => {
    const baseStarts = {
      playersLandmass1: 1,
      playersLandmass2: 1,
    };

    const result = runOpValidated(
      planStarts,
      { baseStarts },
      {
        strategy: "default",
        config: {
          overrides: {
            playersLandmass1: 3,
          },
        },
      }
    );

    expect(result.playersLandmass1).toBe(3);
    expect(result.playersLandmass2).toBe(1);
    expect(result.seats.length).toBe(4);
    // Sector machinery was removed in placement-realignment S4; the op output
    // carries the spacing contract instead.
    expect(result.spacingFloorTiles).toBeGreaterThanOrEqual(0);
  });
});

/**
 * Rivers product requirement re-expressed in the domain/resources pipeline:
 * river tiles (planned or engine-projected, navigable water included) are
 * removed from every demand's legalMask before legal/eligible counts, so the
 * exclusion flows through site selection, the support pass, and stamping.
 */
describe("resource demand planning river exclusion", () => {
  const width = 4;
  const height = 3;
  const size = width * height;

  function findExcludableType() {
    const age = resolveActiveResourceAge();
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
    // Make every tile policy-legal for the chosen type by stamping its first
    // official Resource_ValidPlacements (biome, terrain, feature) triple.
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

  it("unions planned and engine-projected river masks, ignoring mismatched lengths", () => {
    const plannedMajorRiverMask = new Uint8Array(size);
    plannedMajorRiverMask[1] = 1;
    const engineNavigableRiverMask = new Uint8Array(size);
    engineNavigableRiverMask[5] = 1;
    const wrongLength = new Uint8Array(size + 1).fill(1);

    const mask = buildRiverResourceExclusionMask({
      width,
      height,
      projectedNavigableRivers: { plannedMajorRiverMask, riverMask: wrongLength },
      engineProjectionRivers: { engineNavigableRiverMask },
    });

    expect(mask.length).toBe(size);
    expect(mask[1]).toBe(1);
    expect(mask[5]).toBe(1);
    expect([...mask].reduce((sum, value) => sum + value, 0)).toBe(2);
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
