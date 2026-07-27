import { describe, expect, it } from "bun:test";
import { Value } from "typebox/value";

import {
  measureStandardNaturalWonderPlacement,
  type StandardNaturalWonderPlacementMeasurements,
  StandardNaturalWonderPlacementMeasurementsSchema,
} from "../../../../../../src/recipes/standard/metrics/families/placement/natural-wonder-placement.js";

type NaturalWonderPlacementOutcome = StandardNaturalWonderPlacementMeasurements["outcomes"][number];

const PLACED_OUTCOME = {
  status: "placed",
  plotIndex: 10,
  x: 10,
  y: 0,
  featureType: 30,
  direction: 2,
  elevation: 240,
} as const satisfies NaturalWonderPlacementOutcome;

const REJECTED_OUTCOME = {
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
} as const satisfies NaturalWonderPlacementOutcome;

describe("Standard natural-wonder placement measurement", () => {
  it("derives terminal counts, shortfall, rejection detail, and stable coordinate identities", () => {
    const measurements = measureStandardNaturalWonderPlacement({
      requestedCount: 3,
      outcomes: [PLACED_OUTCOME, REJECTED_OUTCOME],
    });

    expect(measurements).toMatchObject({
      version: 1,
      summary: {
        requestedCount: 3,
        plannedCount: 2,
        placedCount: 1,
        rejectedCount: 1,
        shortfallCount: 1,
        coordinateEvidence: {
          version: 1,
          placed: { count: 1, hash32: "dca34884" },
          rejected: { count: 1, hash32: "29b4c7a6" },
        },
      },
      outcomes: [PLACED_OUTCOME, REJECTED_OUTCOME],
    });
    expect(measurements.summary.rejectionExamples).toEqual([
      "feature=31 plot=20 direction=-1 elevation=180 reason=readback-mismatch " +
        "observedPlot=21 observedFeature=-1 footprint=20:31,21:-1 " +
        "readback=partial-expected-footprint",
    ]);
  });

  it("keeps coordinate identity independent of invocation row order", () => {
    const forward = measureStandardNaturalWonderPlacement({
      requestedCount: 2,
      outcomes: [PLACED_OUTCOME, REJECTED_OUTCOME],
    });
    const reversed = measureStandardNaturalWonderPlacement({
      requestedCount: 2,
      outcomes: [REJECTED_OUTCOME, PLACED_OUTCOME],
    });

    expect(reversed.summary.coordinateEvidence).toEqual(forward.summary.coordinateEvidence);
  });

  it("canonicalizes same-channel coordinate rows with tied identity prefixes", () => {
    const alternateRejection = {
      ...REJECTED_OUTCOME,
      observedPlotIndex: 22,
      expectedFootprintReadback: [
        { plotIndex: 20, observedFeatureType: 31 },
        { plotIndex: 22, observedFeatureType: -1 },
      ],
    } as const satisfies NaturalWonderPlacementOutcome;
    const forward = measureStandardNaturalWonderPlacement({
      requestedCount: 2,
      outcomes: [REJECTED_OUTCOME, alternateRejection],
    });
    const reversed = measureStandardNaturalWonderPlacement({
      requestedCount: 2,
      outcomes: [alternateRejection, REJECTED_OUTCOME],
    });

    expect(reversed.summary.coordinateEvidence.rejected).toEqual(
      forward.summary.coordinateEvidence.rejected
    );
  });

  it("rejects impossible reason-specific evidence at schema admission", () => {
    const valid = measureStandardNaturalWonderPlacement({
      requestedCount: 1,
      outcomes: [REJECTED_OUTCOME],
    });
    const withOutcome = (outcome: unknown): unknown => ({
      ...valid,
      outcomes: [outcome],
    });
    const requiredReadbackFields = [
      "elevation",
      "observedFeatureType",
      "observedPlotIndex",
      "expectedFootprintReadback",
      "expectedFootprintReadbackStatus",
    ] as const;

    for (const field of requiredReadbackFields) {
      const missingField = { ...REJECTED_OUTCOME } as Record<string, unknown>;
      delete missingField[field];
      expect(
        Value.Check(StandardNaturalWonderPlacementMeasurementsSchema, withOutcome(missingField))
      ).toBeFalse();
    }
    expect(
      Value.Check(
        StandardNaturalWonderPlacementMeasurementsSchema,
        withOutcome({ ...REJECTED_OUTCOME, expectedFootprintReadback: [] })
      )
    ).toBeFalse();
    expect(
      Value.Check(
        StandardNaturalWonderPlacementMeasurementsSchema,
        withOutcome({
          ...REJECTED_OUTCOME,
          reason: "set-feature-false",
        })
      )
    ).toBeFalse();
    expect(
      Value.Check(
        StandardNaturalWonderPlacementMeasurementsSchema,
        withOutcome({
          status: "rejected",
          plotIndex: 20,
          x: 20,
          y: 0,
          featureType: 31,
          direction: -1,
          reason: "can-have-feature-param-false",
          observedFeatureType: -1,
        })
      )
    ).toBeFalse();
    expect(
      Value.Check(
        StandardNaturalWonderPlacementMeasurementsSchema,
        withOutcome({
          status: "rejected",
          plotIndex: 20,
          x: 20,
          y: 0,
          featureType: 31,
          direction: -1,
          reason: "can-have-feature-param-false",
          observedFeatureType: -1,
          observedPlotIndex: 21,
        })
      )
    ).toBeTrue();
    expect(
      Value.Check(
        StandardNaturalWonderPlacementMeasurementsSchema,
        withOutcome({
          status: "rejected",
          plotIndex: 20,
          x: 20,
          y: 0,
          featureType: 31,
          direction: -1,
          elevation: 180,
          reason: "unsupported-footprint",
        })
      )
    ).toBeTrue();
    expect(
      Value.Check(
        StandardNaturalWonderPlacementMeasurementsSchema,
        withOutcome({
          status: "rejected",
          plotIndex: 20,
          x: 20,
          y: 0,
          featureType: 31,
          direction: -1,
          reason: "can-have-feature-param-false",
        })
      )
    ).toBeTrue();
  });

  it("closes over a deeply frozen copy of adapter readback evidence", () => {
    const mutableReadback = [
      { plotIndex: 20, observedFeatureType: 31 },
      { plotIndex: 21, observedFeatureType: -1 },
    ];
    const measurements = measureStandardNaturalWonderPlacement({
      requestedCount: 1,
      outcomes: [{ ...REJECTED_OUTCOME, expectedFootprintReadback: mutableReadback }],
    });
    mutableReadback[0]!.observedFeatureType = 999;

    const rejected = measurements.outcomes[0];
    if (rejected?.status !== "rejected" || rejected.reason !== "readback-mismatch") {
      throw new Error("Natural-wonder measurement fixture requires one readback mismatch.");
    }
    expect(rejected.expectedFootprintReadback[0]?.observedFeatureType).toBe(31);
    expect(Object.isFrozen(measurements)).toBe(true);
    expect(Object.isFrozen(measurements.summary)).toBe(true);
    expect(Object.isFrozen(measurements.outcomes)).toBe(true);
    expect(Object.isFrozen(rejected.expectedFootprintReadback)).toBe(true);
    expect(Object.isFrozen(rejected.expectedFootprintReadback[0])).toBe(true);
  });
});
