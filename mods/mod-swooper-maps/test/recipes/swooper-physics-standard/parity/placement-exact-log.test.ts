import { describe, expect, it, spyOn } from "bun:test";
import { fnv1a32StringHex } from "@swooper/mapgen-core/lib/hash";
import {
  emitStandardNaturalWonderPlacementExactLog,
  emitStandardNaturalWonderPlanExactLog,
  emitStandardNaturalWonderPlanInputExactLog,
  emitStandardPlacementParityExactLog,
  emitStandardResourcePlacementExactLog,
  projectStandardNaturalWonderPlanEvidence,
  projectStandardResourcePlacementExactLog,
} from "../../../../src/recipes/standard/parity/placement-exact-log.js";
import { TEST_MAP_SIZE } from "../../../setup.js";

type NaturalWonderPlacement = Parameters<typeof emitStandardNaturalWonderPlacementExactLog>[0];
type NaturalWonderPlan = Parameters<typeof emitStandardNaturalWonderPlanExactLog>[0];
type NaturalWonderPlanInput = Parameters<typeof emitStandardNaturalWonderPlanInputExactLog>[0];
type PlacementParity = Parameters<typeof emitStandardPlacementParityExactLog>[0];
type ResourceCatalog = Parameters<typeof emitStandardResourcePlacementExactLog>[0];
type ResourcePlacementEvidence = Parameters<typeof emitStandardResourcePlacementExactLog>[1];

const CIV7_LOG_TRUNCATION_BUDGET = 900;
const RESOURCE_PLACEMENT_LOG_PREFIX = "[SWOOPER_MOD] RESOURCE_PLACEMENT_V1 ";
const EMPTY_HASH32 = fnv1a32StringHex("");

const EMPTY_NATURAL_WONDER_PLAN = {
  ...TEST_MAP_SIZE.dimensions,
  wondersCount: 0,
  targetCount: 0,
  plannedCount: 0,
  placements: [],
} satisfies NaturalWonderPlan;

const EMPTY_NATURAL_WONDER_PLACEMENT = {
  plannedCount: 0,
  targetCount: 0,
  placedCount: 0,
  terrainAdjustedCount: 0,
  skippedOutOfBoundsCount: 0,
  rejectedCount: 0,
  shortfallCount: 0,
  rejectionExamples: [],
  coordinateEvidence: {
    version: 1,
    placed: { count: 0, hash32: EMPTY_HASH32 },
    rejected: { count: 0, hash32: EMPTY_HASH32 },
  },
  coordinateRows: [],
  observedNaturalWonderPlotIndices: [],
} satisfies NaturalWonderPlacement;

const EMPTY_NATURAL_WONDER_PLAN_INPUT = {
  version: 2,
  plannerInput: {
    version: 1,
    dimensions: TEST_MAP_SIZE.dimensions,
    wondersCount: 0,
    engineConstants: {
      coastTerrainType: 1,
      mountainTerrainType: 2,
      iceFeatureType: 3,
      noFeatureType: -1,
    },
    featureCatalog: {
      count: 0,
      featureTypes: [],
      canonicalHash32: fnv1a32StringHex("[]"),
    },
    strategy: {
      id: "suitability-diversity",
      configCanonicalJson: "{}",
      configHash32: fnv1a32StringHex("{}"),
    },
    surfaceDigests: {
      version: 1,
      plotCount: TEST_MAP_SIZE.dimensions.width * TEST_MAP_SIZE.dimensions.height,
      landMaskHash32: EMPTY_HASH32,
      elevationHash32: EMPTY_HASH32,
      aridityIndexHash32: EMPTY_HASH32,
      riverClassHash32: EMPTY_HASH32,
      lakeMaskHash32: EMPTY_HASH32,
      vegetationDensityHash32: EMPTY_HASH32,
      effectiveMoistureHash32: EMPTY_HASH32,
      surfaceTemperatureHash32: EMPTY_HASH32,
      fertilityHash32: EMPTY_HASH32,
      dischargeHash32: EMPTY_HASH32,
      slopeClassHash32: EMPTY_HASH32,
      terrainTypeHash32: EMPTY_HASH32,
      biomeTypeHash32: EMPTY_HASH32,
      featureTypeHash32: EMPTY_HASH32,
      naturalWonderBlockedMaskHash32: EMPTY_HASH32,
    },
  },
  plannedCount: 0,
  rows: [],
} satisfies NaturalWonderPlanInput;

const EMPTY_PLACEMENT_PARITY = {
  version: 1,
  waterDriftCount: 0,
  acceptedLakeTileCount: 0,
  finalLakeWaterDriftCount: 0,
  finalLakeClassificationDriftCount: 0,
} satisfies PlacementParity;

function evidence(
  byResource: ResourcePlacementEvidence["summary"]["byResource"],
  counts: Readonly<{
    planned: number;
    placed: number;
    rejected: number;
  }>
): ResourcePlacementEvidence {
  return {
    summary: {
      plannedCount: counts.planned,
      placedCount: counts.placed,
      rejectedCount: counts.rejected,
      mismatchCount: 0,
      coordinateEvidence: {
        version: 1,
        placed: { count: counts.placed, hash32: "12345678" },
        rejected: { count: counts.rejected, hash32: "abcdef12" },
        mismatch: { count: 0, hash32: "811c9dc5" },
      },
      byResource,
      byReason:
        counts.rejected === 0 ? [] : [{ reason: "cannot-have-resource", count: counts.rejected }],
    },
    reconciliation: {
      plannedCount: counts.planned,
      placedCount: counts.placed,
      rejectedCount: counts.rejected,
      shortfalls:
        counts.rejected === 0
          ? []
          : [
              {
                resourceType: 44,
                reason: "cannot-have-resource",
                count: counts.rejected,
              },
            ],
      byPhase: {
        rotation: counts.placed,
        rangeFloor: 0,
        regionMinimum: 0,
        support: 0,
      },
      supportAdjustedPlacedCount: 0,
    },
    outcomes:
      counts.rejected === 0
        ? []
        : [
            {
              status: "rejected",
              plotIndex: 67,
              x: 12,
              y: 3,
              resourceType: 44,
              reason: "cannot-have-resource",
            },
          ],
  };
}

describe("resource placement exact-log projection", () => {
  it("projects the compact RESOURCE_PLACEMENT_V1 evidence envelope", () => {
    const projection = projectStandardResourcePlacementExactLog(
      [
        { index: 13, resourceType: "RESOURCE_GOLD", resourceClassType: null, name: null },
        { index: 44, resourceType: "RESOURCE_RUBIES", resourceClassType: null, name: null },
      ],
      evidence(
        [
          {
            resourceType: 13,
            plannedCount: 2,
            placedCount: 2,
            rejectedCount: 0,
            mismatchCount: 0,
            reasons: [],
          },
          {
            resourceType: 44,
            plannedCount: 2,
            placedCount: 1,
            rejectedCount: 1,
            mismatchCount: 0,
            reasons: [{ reason: "cannot-have-resource", count: 1 }],
          },
        ],
        { planned: 4, placed: 3, rejected: 1 }
      )
    );

    expect(projection).toMatchObject({
      version: 1,
      plannedCount: 4,
      placedCount: 3,
      rejectedCount: 1,
      mismatchCount: 0,
      uniquePlannedTypes: 2,
      uniquePlacedTypes: 2,
      minPlacedCountByType: 1,
      maxPlacedCountByType: 2,
      runtimeCatalogCount: 2,
      coordinateEvidence: {
        version: 1,
        placedCount: 3,
        placedHash32: "12345678",
        rejectedCount: 1,
        rejectedHash32: "abcdef12",
      },
      rejectedResourceTypes: [44],
      rejectionExampleCount: 1,
      rejectionRows: [
        {
          status: "rejected",
          resourceType: 44,
          resource: "RESOURCE_RUBIES",
          plotIndex: 67,
          x: 12,
          y: 3,
          reason: "cannot-have-resource",
        },
      ],
      reconciliation: {
        plannedCount: 4,
        placedCount: 3,
        rejectedCount: 1,
        byPhase: { rotation: 3, rangeFloor: 0, regionMinimum: 0, support: 0 },
        shortfalls: [{ resourceType: 44, reason: "cannot-have-resource", count: 1 }],
      },
      byReason: [{ reason: "cannot-have-resource", count: 1 }],
    });
    expect(JSON.stringify(projection).length).toBeLessThan(CIV7_LOG_TRUNCATION_BUDGET);
  });

  it("keeps a full runtime catalog below Civ7's log truncation budget", () => {
    const byResource = Array.from({ length: 55 }, (_, resourceType) => ({
      resourceType,
      plannedCount: resourceType === 5 || resourceType === 15 ? 0 : 3,
      placedCount: resourceType === 5 || resourceType === 15 ? 0 : 3,
      rejectedCount: 0,
      mismatchCount: 0,
      reasons: [],
    }));
    const projection = projectStandardResourcePlacementExactLog(
      Array.from({ length: 55 }, (_, index) => ({
        index,
        resourceType: `RESOURCE_${index}`,
        resourceClassType: "RESOURCECLASS_BONUS",
        name: `Resource ${index}`,
      })),
      evidence(byResource, { planned: 159, placed: 159, rejected: 0 })
    );
    const line = `${RESOURCE_PLACEMENT_LOG_PREFIX}${JSON.stringify(projection)}`;

    expect(projection).toMatchObject({
      version: 1,
      plannedCount: 159,
      placedCount: 159,
      rejectedCount: 0,
      runtimeCatalogCount: 55,
      rejectedResourceTypes: [],
      reconciliation: {
        plannedCount: 159,
        placedCount: 159,
        rejectedCount: 0,
        byPhase: { rotation: 159, rangeFloor: 0, regionMinimum: 0, support: 0 },
      },
    });
    expect(line.length).toBeLessThan(CIV7_LOG_TRUNCATION_BUDGET);
  });
});

describe("natural-wonder plan exact-log projection", () => {
  it("projects stable coordinates and digest identity from a non-empty Civ7-sized plan", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const plotIndex = 65;
    const y = Math.trunc(plotIndex / width);
    const x = plotIndex - y * width;
    const expectedHash32 = fnv1a32StringHex(`p:${plotIndex}:${x}:${y}:30:2:240:750000`);
    const projection = projectStandardNaturalWonderPlanEvidence({
      width,
      height,
      wondersCount: 1,
      targetCount: 1,
      plannedCount: 1,
      placements: [
        {
          plotIndex,
          featureType: 30,
          direction: 2,
          elevation: 240,
          priority: 0.75,
        },
      ],
    });

    expect(projection).toEqual({
      version: 1,
      plannedCount: 1,
      coordinateDigest: {
        count: 1,
        hash32: expectedHash32,
      },
      rows: [
        {
          plotIndex,
          x,
          y,
          featureType: 30,
          direction: 2,
          elevation: 240,
          priorityPpm: 750_000,
        },
      ],
    });
  });
});

describe("placement exact-log producer protocol", () => {
  it("emits all five stable marker families and omits the empty rejected-coordinate channel", () => {
    const runtimeCatalog = [
      {
        index: 13,
        resourceType: "RESOURCE_GOLD",
        resourceClassType: null,
        name: null,
      },
    ] satisfies ResourceCatalog;
    const resourceEvidence = evidence(
      [
        {
          resourceType: 13,
          plannedCount: 1,
          placedCount: 1,
          rejectedCount: 0,
          mismatchCount: 0,
          reasons: [],
        },
      ],
      { planned: 1, placed: 1, rejected: 0 }
    );
    const resourcePayload = projectStandardResourcePlacementExactLog(
      runtimeCatalog,
      resourceEvidence
    );
    const log = spyOn(console, "log").mockImplementation(() => {});

    try {
      emitStandardResourcePlacementExactLog(runtimeCatalog, resourceEvidence);
      emitStandardNaturalWonderPlanExactLog(EMPTY_NATURAL_WONDER_PLAN);
      emitStandardNaturalWonderPlanInputExactLog(EMPTY_NATURAL_WONDER_PLAN_INPUT);
      emitStandardNaturalWonderPlacementExactLog(EMPTY_NATURAL_WONDER_PLACEMENT);
      emitStandardPlacementParityExactLog(EMPTY_PLACEMENT_PARITY);

      expect(log.mock.calls).toEqual([
        [`[SWOOPER_MOD] RESOURCE_PLACEMENT_V1 ${JSON.stringify(resourcePayload)}`],
        [
          `[SWOOPER_MOD] NATURAL_WONDER_PLAN_V1 ${JSON.stringify({
            version: 1,
            wondersCount: 0,
            targetCount: 0,
            plannedCount: 0,
            planRows: [],
            coordinateEvidence: {
              version: 1,
              plannedCount: 0,
              plannedHash32: EMPTY_HASH32,
            },
          })}`,
        ],
        [
          `[SWOOPER_MOD] NATURAL_WONDER_PLAN_INPUT_V2 ${JSON.stringify(
            EMPTY_NATURAL_WONDER_PLAN_INPUT
          )}`,
        ],
        [
          `[SWOOPER_MOD] NATURAL_WONDER_PLACEMENT_V1 ${JSON.stringify({
            version: 1,
            plannedCount: 0,
            targetCount: 0,
            placedCount: 0,
            terrainAdjustedCount: 0,
            skippedOutOfBoundsCount: 0,
            rejectedCount: 0,
            shortfallCount: 0,
            rejectionExampleCount: 0,
            rejectionExamples: [],
            rejectedRows: [],
            coordinateEvidence: {
              version: 1,
              placedCount: 0,
              placedHash32: EMPTY_HASH32,
            },
          })}`,
        ],
        [`[SWOOPER_MOD] PLACEMENT_PARITY_V1 ${JSON.stringify(EMPTY_PLACEMENT_PARITY)}`],
      ]);
      expect(String(log.mock.calls[3]?.[0])).not.toContain('"rejectedHash32"');
    } finally {
      log.mockRestore();
    }
  });

  it("keeps resource exact logging silent without official Civ7 catalog identities", () => {
    const log = spyOn(console, "log").mockImplementation(() => {});
    try {
      emitStandardResourcePlacementExactLog(
        [],
        evidence([], { planned: 0, placed: 0, rejected: 0 })
      );
      expect(log).not.toHaveBeenCalled();
    } finally {
      log.mockRestore();
    }
  });
});
