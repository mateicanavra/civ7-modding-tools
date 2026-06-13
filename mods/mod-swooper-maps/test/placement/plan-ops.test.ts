import { describe, expect, it } from "bun:test";

import { CIV7_BROWSER_TABLES_V0 } from "@civ7/map-policy";

import placementDomain from "../../src/domain/placement/ops.js";
import {
  EARTHLIKE_RESOURCE_EXPECTATIONS,
  RESOURCE_HABITAT_SIGNALS,
  getInitialMapResourcePolicyForType,
  resolveActiveResourceAge,
  resolveResourceRuntimeIds,
  type ResourceLegalitySurface,
} from "../../src/domain/resources/index.js";
import {
  buildResourceDemands,
  buildRiverResourceExclusionMask,
} from "../../src/recipes/standard/stages/placement/steps/plan-resources/planning.js";
import { runOpValidated } from "../support/compiler-helpers.js";

const { planDiscoveries, planNaturalWonders, planResources, planStarts, planWonders } =
  placementDomain.ops;

describe("placement plan operations", () => {
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
          { featureType: 1001, direction: 0, footprintOffsets: [{ dx: 0, dy: 0 }] },
          { featureType: 1002, direction: 1, footprintOffsets: [{ dx: 0, dy: 0 }] },
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
          { featureType: 1001, direction: 0, footprintOffsets: [] },
          { featureType: 1002, direction: 1, footprintOffsets: [{ dx: 0, dy: 0 }] },
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

  it("plans deterministic discovery placements from physical fields", () => {
    const width = 5;
    const height = 4;
    const size = width * height;
    const result = runOpValidated(
      planDiscoveries,
      {
        width,
        height,
        landMask: new Uint8Array(size).fill(1),
        elevation: Int16Array.from(Array.from({ length: size }, (_, i) => (i % width) * 10)),
        aridityIndex: new Float32Array(size).fill(0.4),
        riverClass: new Uint8Array(size),
        lakeMask: new Uint8Array(size),
        candidateDiscoveries: [
          { discoveryVisualType: 11, discoveryActivationType: 22 },
          { discoveryVisualType: 13, discoveryActivationType: 24 },
        ],
      },
      {
        strategy: "default",
        config: { densityPer100Tiles: 10, minSpacingTiles: 1 },
      }
    );

    expect(result.plannedCount).toBeGreaterThan(0);
    expect(result.placements.length).toBe(result.plannedCount);
    expect(result.candidateDiscoveries).toEqual([
      { discoveryVisualType: 11, discoveryActivationType: 22 },
      { discoveryVisualType: 13, discoveryActivationType: 24 },
    ]);
    for (const placement of result.placements) {
      expect(placement.preferredDiscoveryOffset).toBeGreaterThanOrEqual(0);
      expect(
        result.candidateDiscoveries.some(
          (candidate) =>
            candidate.discoveryVisualType === placement.preferredDiscoveryVisualType &&
            candidate.discoveryActivationType === placement.preferredDiscoveryActivationType
        )
      ).toBe(true);
    }
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
