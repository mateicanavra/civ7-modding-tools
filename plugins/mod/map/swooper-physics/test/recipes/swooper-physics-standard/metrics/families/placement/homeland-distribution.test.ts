import { describe, expect, it } from "bun:test";
import { evaluateMetricTargets } from "@swooper/mapgen-metrics";
import type { StandardMapCapture } from "../../../../../../src/recipes/standard/metrics/capture.js";
import { measureStandardMapCapture } from "../../../../../../src/recipes/standard/metrics/sample.js";
import { STANDARD_INTEGRITY_TARGET } from "../../../../../../src/recipes/standard/metrics/targets/integrity.js";
import { EARTHLIKE_PLACEMENT_TARGET } from "../../../../../../src/recipes/standard/metrics/targets/placement.js";
import { captureEarthlikeScenario } from "../../fixtures/standard-product.js";

describe("Standard placement metrics", () => {
  it("measures absent seating as missing evidence and lets product targets fail closed", () => {
    const capture = captureEarthlikeScenario();
    const withoutSeats: StandardMapCapture = {
      ...capture,
      placement: {
        ...capture.placement,
        seats: [],
        assigned: 0,
        unseatedCount: capture.placement.aliveMajorIds.length,
      },
    };
    const sample = measureStandardMapCapture(withoutSeats);

    expect(sample.metrics.placement.startFertility).toBeNull();
    expect(sample.metrics.placement.pairwiseStartSpacing).toBeNull();
    expect(sample.metrics.placement.homelandDistribution.globalSpread).toBeNull();

    const [integrity] = evaluateMetricTargets(sample, [STANDARD_INTEGRITY_TARGET]);
    expect(integrity?.expectations.find(({ id }) => id === "exact-player-seating")).toMatchObject({
      status: "fail",
      observed: false,
    });

    const [placement] = evaluateMetricTargets([sample], [EARTHLIKE_PLACEMENT_TARGET]);
    expect(placement?.status).toBe("fail");
  }, 30_000);

  it("classifies start landmasses only through the captured landmass catalog", () => {
    const capture = captureEarthlikeScenario();
    const baseline = measureStandardMapCapture(capture);
    const seat = capture.placement.seats.find(
      (candidate) =>
        candidate.plotIndex >= 0 &&
        capture.model.landmasses.some(
          ({ id }) => id === capture.model.landmassIdByTile[candidate.plotIndex]
        )
    );
    if (!seat) throw new Error("Metric fixture has no cataloged seated landmass.");
    const landmassIdByTile = capture.model.landmassIdByTile.slice();
    landmassIdByTile[seat.plotIndex] =
      Math.max(...capture.model.landmasses.map(({ id }) => id), 0) + 1_000;
    const sample = measureStandardMapCapture({
      ...capture,
      model: { ...capture.model, landmassIdByTile },
    });

    expect(sample.metrics.placement.homelandDistribution.unclassifiedLandmassStartCount).toBe(
      baseline.metrics.placement.homelandDistribution.unclassifiedLandmassStartCount + 1
    );
    const [integrity] = evaluateMetricTargets(sample, [STANDARD_INTEGRITY_TARGET]);
    expect(
      integrity?.expectations.find(({ id }) => id === "start-distribution-classification")
    ).toMatchObject({ status: "fail", observed: false });
  }, 30_000);

  it("measures fallback from immutable requested and terminal realized homeland evidence", () => {
    const capture = captureEarthlikeScenario();
    const relaxedSeats = new Set(
      capture.placement.fairnessReport.relaxations
        .filter(({ kind }) => kind === "region")
        .map(({ seatIndex }) => seatIndex)
    );
    const seat = capture.placement.seats.find(
      (candidate) =>
        candidate.plotIndex >= 0 &&
        !relaxedSeats.has(candidate.seatIndex) &&
        candidate.regionSlot === candidate.realizedRegionSlot &&
        capture.model.regionSlotByTile[candidate.plotIndex] === candidate.realizedRegionSlot
    );
    if (!seat || (seat.regionSlot !== 1 && seat.regionSlot !== 2)) {
      throw new Error("Metric fixture has no unrelaxed classified seat.");
    }
    const realizedRegionSlot = seat.regionSlot === 1 ? 2 : 1;
    const regionSlotByTile = capture.model.regionSlotByTile.slice();
    regionSlotByTile[seat.plotIndex] = realizedRegionSlot;
    const mismatchedCapture: StandardMapCapture = {
      ...capture,
      model: { ...capture.model, regionSlotByTile },
    };

    expect(() => measureStandardMapCapture(mismatchedCapture)).toThrow(
      `declares realized region ${seat.realizedRegionSlot}, but plot ${seat.plotIndex} is physically in region ${realizedRegionSlot}`
    );

    const baseline = measureStandardMapCapture(capture).metrics.placement;
    const withRelaxation = measureStandardMapCapture({
      ...mismatchedCapture,
      placement: {
        ...mismatchedCapture.placement,
        seats: mismatchedCapture.placement.seats.map((candidate) =>
          candidate === seat ? { ...candidate, realizedRegionSlot } : candidate
        ),
        fairnessReport: {
          ...mismatchedCapture.placement.fairnessReport,
          relaxations: [
            ...mismatchedCapture.placement.fairnessReport.relaxations,
            {
              seatIndex: seat.seatIndex,
              kind: "region" as const,
              from: seat.regionSlot,
              to: realizedRegionSlot,
            },
          ],
        },
      },
    }).metrics.placement;

    const baselineRequested = baseline.homelandDistribution.regions.find(
      ({ regionSlot }) => regionSlot === seat.regionSlot
    );
    const changedRequested = withRelaxation.homelandDistribution.regions.find(
      ({ regionSlot }) => regionSlot === seat.regionSlot
    );
    const baselineRealized = baseline.homelandDistribution.regions.find(
      ({ regionSlot }) => regionSlot === realizedRegionSlot
    );
    const changedRealized = withRelaxation.homelandDistribution.regions.find(
      ({ regionSlot }) => regionSlot === realizedRegionSlot
    );

    expect(withRelaxation.regionRelaxations.count).toBe(baseline.regionRelaxations.count + 1);
    expect(changedRequested?.requestedStartCount).toBe(baselineRequested?.requestedStartCount);
    expect(changedRequested?.realizedStartCount).toBe(
      (baselineRequested?.realizedStartCount ?? 0) - 1
    );
    expect(changedRealized?.realizedStartCount).toBe(
      (baselineRealized?.realizedStartCount ?? 0) + 1
    );
  }, 30_000);

  it("keeps the immutable request when fallback selection returns to the requested homeland", () => {
    const capture = captureEarthlikeScenario();
    const relaxedSeats = new Set(
      capture.placement.fairnessReport.relaxations
        .filter(({ kind }) => kind === "region")
        .map(({ seatIndex }) => seatIndex)
    );
    const seat = capture.placement.seats.find(
      (candidate) =>
        candidate.plotIndex >= 0 &&
        !relaxedSeats.has(candidate.seatIndex) &&
        candidate.regionSlot === candidate.realizedRegionSlot &&
        capture.model.regionSlotByTile[candidate.plotIndex] === candidate.realizedRegionSlot
    );
    if (!seat || (seat.regionSlot !== 1 && seat.regionSlot !== 2)) {
      throw new Error("Metric fixture has no unrelaxed classified seat.");
    }
    const otherRegionSlot = seat.regionSlot === 1 ? 2 : 1;
    const baseline = measureStandardMapCapture(capture).metrics.placement;
    const roundTrip = measureStandardMapCapture({
      ...capture,
      placement: {
        ...capture.placement,
        seats: capture.placement.seats.map((candidate) =>
          candidate === seat
            ? { ...candidate, rung: "open-pool" as const, status: "degraded" as const }
            : candidate
        ),
        fairnessReport: {
          ...capture.placement.fairnessReport,
          relaxations: [
            ...capture.placement.fairnessReport.relaxations,
            {
              seatIndex: seat.seatIndex,
              kind: "region" as const,
              from: seat.regionSlot,
              to: otherRegionSlot,
            },
            {
              seatIndex: seat.seatIndex,
              kind: "region" as const,
              from: otherRegionSlot,
              to: seat.regionSlot,
            },
          ],
        },
      },
    }).metrics.placement;

    expect(roundTrip.homelandDistribution.regions).toEqual(baseline.homelandDistribution.regions);
    expect(roundTrip.regionRelaxations.count).toBe(baseline.regionRelaxations.count + 1);
    expect(roundTrip.unacknowledgedDegradationCount).toBe(baseline.unacknowledgedDegradationCount);
  }, 30_000);
});
