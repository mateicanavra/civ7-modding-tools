import { describe, expect, it, spyOn } from "bun:test";
import {
  type OfficialResourceType,
  requireResourceRuntimeId,
  resolveResourceRuntimeIds,
} from "@civ7/map-policy";
import { fnv1a32StringHex } from "@swooper/mapgen-core/lib/hash";
import {
  BOUNDED_JSON_LOG_MAX_LINE_LENGTH,
  decodeBoundedJsonLogSeries,
  encodeBoundedJsonLogLines,
} from "@swooper/mapgen-core/lib/log";
import { measureStandardResourcePlacement } from "../../../../src/recipes/standard/metrics/families/placement/resource-placement.js";
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

type NaturalWonderPlacementCompatibility = Parameters<
  typeof emitStandardNaturalWonderPlacementExactLog
>[0];
type NaturalWonderPlan = Parameters<typeof emitStandardNaturalWonderPlanExactLog>[0];
type NaturalWonderPlanInput = Parameters<typeof emitStandardNaturalWonderPlanInputExactLog>[0];
type PlacementParity = Parameters<typeof emitStandardPlacementParityExactLog>[0];
type ResourceCatalog = Parameters<typeof emitStandardResourcePlacementExactLog>[0];
type ResourcePlacementEvidence = Parameters<typeof emitStandardResourcePlacementExactLog>[1];
type ResourcePlacementRow = Parameters<typeof measureStandardResourcePlacement>[0][number];
type ResourcePlacementPhase = ResourcePlacementRow["phase"];

const EMPTY_HASH32 = fnv1a32StringHex("");
const GOLD_RESOURCE = requireResourceRuntimeId("RESOURCE_GOLD");
const JADE_RESOURCE = requireResourceRuntimeId("RESOURCE_JADE");

const EMPTY_NATURAL_WONDER_PLAN = {
  ...TEST_MAP_SIZE.dimensions,
  wondersCount: 0,
  targetCount: 0,
  plannedCount: 0,
  placements: [],
} satisfies NaturalWonderPlan;

const EMPTY_NATURAL_WONDER_PLACEMENT = {
  requestedCount: 0,
  retainedOutcomes: [],
} satisfies NaturalWonderPlacementCompatibility;

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

type ResourcePlacementFixtureRow = Readonly<{
  resourceType: OfficialResourceType;
  status: "placed" | "rejected";
  plotIndex?: number;
  phase?: ResourcePlacementPhase;
}>;

function resourcePlacementEvidence(
  rows: readonly ResourcePlacementFixtureRow[]
): ResourcePlacementEvidence {
  const { width } = TEST_MAP_SIZE.dimensions;
  return measureStandardResourcePlacement(
    rows.map((row, index): ResourcePlacementRow => {
      const plotIndex = row.plotIndex ?? index;
      const y = Math.floor(plotIndex / width);
      const x = plotIndex - y * width;
      const phase = row.phase ?? "rotation";
      const resourceType = requireResourceRuntimeId(row.resourceType).resourceTypeId;
      return Object.freeze(
        row.status === "placed"
          ? {
              status: "placed",
              plotIndex,
              x,
              y,
              resourceType,
              phase,
            }
          : {
              status: "rejected",
              plotIndex,
              x,
              y,
              resourceType,
              phase,
              reason: "cannot-have-resource",
            }
      );
    })
  );
}

describe("resource placement exact-log projection", () => {
  it("projects the compact RESOURCE_PLACEMENT_V1 evidence envelope", () => {
    const measurements = resourcePlacementEvidence([
      { resourceType: "RESOURCE_GOLD", status: "placed", plotIndex: 10 },
      { resourceType: "RESOURCE_GOLD", status: "placed", plotIndex: 11 },
      { resourceType: "RESOURCE_JADE", status: "placed", plotIndex: 12 },
      { resourceType: "RESOURCE_JADE", status: "rejected", plotIndex: 67 },
    ]);
    const projection = projectStandardResourcePlacementExactLog(
      [
        {
          index: GOLD_RESOURCE.resourceTypeId,
          resourceType: GOLD_RESOURCE.resourceType,
          resourceClassType: null,
          name: null,
        },
        {
          index: JADE_RESOURCE.resourceTypeId,
          resourceType: JADE_RESOURCE.resourceType,
          resourceClassType: null,
          name: null,
        },
      ],
      measurements
    );
    const rejectedOutcome = measurements.outcomes.find((outcome) => outcome.status === "rejected");
    if (!rejectedOutcome) throw new Error("Resource exact-log fixture requires one rejection.");

    const expected = {
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
        placedHash32: measurements.summary.coordinateEvidence.placed.hash32,
        rejectedCount: 1,
        rejectedHash32: measurements.summary.coordinateEvidence.rejected.hash32,
      },
      rejectedResourceTypes: [JADE_RESOURCE.resourceTypeId],
      rejectionExampleCount: 1,
      rejectionRows: [
        {
          status: "rejected",
          resourceType: JADE_RESOURCE.resourceTypeId,
          resource: "RESOURCE_JADE",
          plotIndex: 67,
          x: rejectedOutcome.x,
          y: rejectedOutcome.y,
          reason: "cannot-have-resource",
        },
      ],
      reconciliation: {
        plannedCount: 4,
        placedCount: 3,
        rejectedCount: 1,
        byPhase: { rotation: 3, rangeFloor: 0, regionMinimum: 0, support: 0 },
        shortfalls: [
          {
            resourceType: JADE_RESOURCE.resourceTypeId,
            reason: "cannot-have-resource",
            count: 1,
          },
        ],
      },
      byReason: [{ reason: "cannot-have-resource", count: 1 }],
    };
    expect(projection).toEqual(expected);
    expect(JSON.stringify(projection)).toBe(JSON.stringify(expected));
    const lines = encodeBoundedJsonLogLines({
      prefix: "[SWOOPER_MOD]",
      marker: "RESOURCE_PLACEMENT_V1",
      payload: projection,
    });
    expect(lines.every((line) => line.length <= BOUNDED_JSON_LOG_MAX_LINE_LENGTH)).toBe(true);
    expect(decodeBoundedJsonLogSeries(lines, "RESOURCE_PLACEMENT_V1")[0]?.payload).toEqual(
      expected
    );
  });

  it("transports a full runtime catalog below Civ7's physical line ceiling", () => {
    const officialResources = Array.from(resolveResourceRuntimeIds().byId.values());
    const measurements = resourcePlacementEvidence(
      officialResources.flatMap(({ resourceType }) =>
        Array.from({ length: 3 }, () => ({ resourceType, status: "placed" as const }))
      )
    );
    const projection = projectStandardResourcePlacementExactLog(
      officialResources.map(({ resourceTypeId: index, resourceType }) => ({
        index,
        resourceType,
        resourceClassType: "RESOURCECLASS_BONUS",
        name: resourceType,
      })),
      measurements
    );
    expect(projection).toMatchObject({
      version: 1,
      plannedCount: measurements.summary.plannedCount,
      placedCount: measurements.summary.placedCount,
      rejectedCount: 0,
      runtimeCatalogCount: officialResources.length,
      rejectedResourceTypes: [],
      reconciliation: {
        plannedCount: measurements.summary.plannedCount,
        placedCount: measurements.summary.placedCount,
        rejectedCount: 0,
        byPhase: {
          rotation: measurements.summary.placedCount,
          rangeFloor: 0,
          regionMinimum: 0,
          support: 0,
        },
      },
    });
    const lines = encodeBoundedJsonLogLines({
      prefix: "[SWOOPER_MOD]",
      marker: "RESOURCE_PLACEMENT_V1",
      payload: projection,
    });
    const engineObservedLines = lines.map((line) => line.slice(0, 1_022));
    expect(lines.every((line) => line.length <= BOUNDED_JSON_LOG_MAX_LINE_LENGTH)).toBe(true);
    expect(engineObservedLines).toEqual([...lines]);
    expect(
      decodeBoundedJsonLogSeries(engineObservedLines, "RESOURCE_PLACEMENT_V1")[0]?.payload
    ).toEqual(projection);
  });
});

describe("natural-wonder placement exact-log projection", () => {
  it("preserves the non-empty row/digest wire and maps requested demand to targetCount", () => {
    const compatibility = {
      requestedCount: 3,
      retainedOutcomes: [
        {
          status: "placed",
          plotIndex: 10,
          x: 10,
          y: 0,
          featureType: 30,
          direction: 2,
          elevation: 240,
        },
        {
          status: "rejected",
          plotIndex: 20,
          x: 20,
          y: 0,
          featureType: 31,
          direction: -1,
          elevation: 180,
          reason: "readback-mismatch",
          observedFeatureType: -1,
          observedPlotIndex: 21,
          expectedFootprintReadback: [
            { plotIndex: 20, observedFeatureType: 31 },
            { plotIndex: 21, observedFeatureType: -1 },
          ],
          expectedFootprintReadbackStatus: "partial-expected-footprint",
        },
      ],
    } satisfies NaturalWonderPlacementCompatibility;
    const expected = {
      version: 1,
      plannedCount: 2,
      targetCount: 3,
      placedCount: 1,
      terrainAdjustedCount: 0,
      skippedOutOfBoundsCount: 0,
      rejectedCount: 1,
      shortfallCount: 1,
      rejectionExampleCount: 1,
      rejectionExamples: [
        "feature=31 plot=20 direction=-1 elevation=180 reason=readback-mismatch " +
          "observedPlot=21 observedFeature=-1 footprint=20:31,21:-1 " +
          "readback=partial-expected-footprint",
      ],
      rejectedRows: [
        ["r", 20, 20, 0, 31, -1, 180, "readback-mismatch", -1, 21, "partial-expected-footprint"],
      ],
      coordinateEvidence: {
        version: 1,
        placedCount: 1,
        placedHash32: "dca34884",
        rejectedCount: 1,
        rejectedHash32: "29b4c7a6",
      },
    };
    const log = spyOn(console, "log").mockImplementation(() => {});

    try {
      emitStandardNaturalWonderPlacementExactLog(compatibility);

      const lines = log.mock.calls.map((call) => String(call[0]));
      expect(lines.every((line) => line.length <= BOUNDED_JSON_LOG_MAX_LINE_LENGTH)).toBe(true);
      expect(decodeBoundedJsonLogSeries(lines, "NATURAL_WONDER_PLACEMENT_V1")[0]?.payload).toEqual(
        expected
      );
    } finally {
      log.mockRestore();
    }
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
        index: GOLD_RESOURCE.resourceTypeId,
        resourceType: GOLD_RESOURCE.resourceType,
        resourceClassType: null,
        name: null,
      },
    ] satisfies ResourceCatalog;
    const resourceEvidence = resourcePlacementEvidence([
      { resourceType: "RESOURCE_GOLD", status: "placed" },
    ]);
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

      const expectedPlan = {
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
      };
      const expectedPlacement = {
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
      };
      const lines = log.mock.calls.map((call) => String(call[0]));
      const engineObservedLines = lines.map((line) => line.slice(0, 1_022));
      expect(lines.every((line) => line.length <= BOUNDED_JSON_LOG_MAX_LINE_LENGTH)).toBe(true);
      expect(engineObservedLines).toEqual(lines);
      expect(
        decodeBoundedJsonLogSeries(engineObservedLines, "RESOURCE_PLACEMENT_V1")[0]?.payload
      ).toEqual(resourcePayload);
      expect(
        decodeBoundedJsonLogSeries(engineObservedLines, "NATURAL_WONDER_PLAN_V1")[0]?.payload
      ).toEqual(expectedPlan);
      expect(
        decodeBoundedJsonLogSeries(engineObservedLines, "NATURAL_WONDER_PLAN_INPUT_V2")[0]?.payload
      ).toEqual(EMPTY_NATURAL_WONDER_PLAN_INPUT);
      expect(
        decodeBoundedJsonLogSeries(engineObservedLines, "NATURAL_WONDER_PLACEMENT_V1")[0]?.payload
      ).toEqual(expectedPlacement);
      expect(
        decodeBoundedJsonLogSeries(engineObservedLines, "PLACEMENT_PARITY_V1")[0]?.payload
      ).toEqual(EMPTY_PLACEMENT_PARITY);
      expect(JSON.stringify(expectedPlacement)).not.toContain('"rejectedHash32"');
    } finally {
      log.mockRestore();
    }
  });

  it("keeps resource exact logging silent without official Civ7 catalog identities", () => {
    const log = spyOn(console, "log").mockImplementation(() => {});
    try {
      emitStandardResourcePlacementExactLog([], resourcePlacementEvidence([]));
      expect(log).not.toHaveBeenCalled();
    } finally {
      log.mockRestore();
    }
  });
});
