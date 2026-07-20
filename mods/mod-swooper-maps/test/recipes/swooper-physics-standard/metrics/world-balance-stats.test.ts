import { describe, expect, it } from "bun:test";
import { requireResourceRuntimeId } from "@civ7/map-policy";
import { evaluateMetricTargets } from "@swooper/mapgen-metrics";
import type { NonEmptyTuple } from "type-fest";
import {
  captureStandardMapScenario,
  type StandardMapCapture,
} from "../../../../src/recipes/standard/metrics/capture.js";
import { measureStandardResources } from "../../../../src/recipes/standard/metrics/families/resources.js";
import {
  evaluateStandardMetricStudies,
  STANDARD_METRIC_STUDIES,
  type StandardMetricRunEvaluation,
} from "../../../../src/recipes/standard/metrics/index.js";
import { measureStandardMapCapture } from "../../../../src/recipes/standard/metrics/sample.js";
import { EARTHLIKE_GEOGRAPHY_TARGET } from "../../../../src/recipes/standard/metrics/targets/geography.js";
import { STANDARD_INTEGRITY_TARGET } from "../../../../src/recipes/standard/metrics/targets/integrity.js";
import { EARTHLIKE_PLACEMENT_TARGET } from "../../../../src/recipes/standard/metrics/targets/placement.js";
import { EARTHLIKE_RESOURCE_DISTRIBUTION_TARGET } from "../../../../src/recipes/standard/metrics/targets/resources.js";

type StandardMetricStudy = (typeof STANDARD_METRIC_STUDIES)[number];

const earthlikePlacementStudy = requireMetricStudy("earthlike/placement");
if (earthlikePlacementStudy.kind !== "cohort") {
  throw new Error("Earthlike placement metrics require a cohort study.");
}
const otherMetricStudies = requireNonEmptyStudies(
  STANDARD_METRIC_STUDIES.filter((metricStudy) => metricStudy !== earthlikePlacementStudy)
);

describe("Standard map product metrics", () => {
  it("keeps the full Earthlike placement cohort inside its placement and resource targets", () => {
    const evaluation = evaluateWithoutRuntimeTelemetry([earthlikePlacementStudy]);
    expect(failedExpectations(evaluation)).toEqual([]);
    expect(evaluation.status).toBe("pass");
  }, 180_000);

  it("keeps every other declared map product inside its shared metric targets", () => {
    const evaluation = evaluateWithoutRuntimeTelemetry(otherMetricStudies);
    const expectedScenarioIds = new Set(
      otherMetricStudies.flatMap((metricStudy) =>
        metricStudy.kind === "sample"
          ? [metricStudy.scenario.id]
          : metricStudy.scenarios.map((scenario) => scenario.id)
      )
    );

    expect(evaluation.scenarioCount).toBe(expectedScenarioIds.size);
    expect(failedExpectations(evaluation)).toEqual([]);
    expect(evaluation.status).toBe("pass");
  }, 180_000);

  it("repeats one named Civ7 preset as an identical completed metric sample", () => {
    const scenario = earthlikePlacementStudy.scenarios[0];
    const first = captureWithoutRuntimeTelemetry(() =>
      measureStandardMapCapture(captureStandardMapScenario(scenario))
    );
    const second = captureWithoutRuntimeTelemetry(() =>
      measureStandardMapCapture(captureStandardMapScenario(scenario))
    );

    const resources = first.metrics.resources;
    expect(resources.candidateCount).toBe(
      resources.demandTypeCount +
        resources.scenarioIneligibleCandidateCount +
        resources.excludedCandidateCount
    );
    expect(resources.admittedTypeRanges).toHaveLength(resources.demandTypeCount);
    expect(
      resources.candidates.find(({ resourceType }) => resourceType === "RESOURCE_DATES")
    ).toMatchObject({
      disposition: "scenario-ineligible",
      exclusionReason: { kind: "no-admitted-legal-tiles" },
      plannedCount: 0,
      placedCount: 0,
    });
    expect(resources.intentOutcomeTypeAlignment).toEqual({
      count: resources.plannedCount,
      population: resources.plannedCount,
    });
    expect(resources.placedObservationTypeAlignment).toEqual({
      count: resources.placedCount,
      population: resources.placedCount,
    });
    expect(resources.placedHeadlessPolicyLegality).toEqual({
      count: resources.placedCount,
      population: resources.placedCount,
    });
    expect(
      resources.placedInHabitatByPhase.rotation.population +
        resources.placedInHabitatByPhase["range-floor"].population +
        resources.placedInHabitatByPhase["region-minimum"].population +
        resources.placedInHabitatByPhase.support.population
    ).toBe(resources.placedCount);
    expect(second).toEqual(first);

    const withoutOuterShelf = {
      ...first,
      metrics: {
        ...first.metrics,
        geography: {
          ...first.metrics.geography,
          shelfBeyondShoreline: {
            ...first.metrics.geography.shelfBeyondShoreline,
            count: 0,
          },
        },
      },
    };
    const [geography] = evaluateMetricTargets(withoutOuterShelf, [EARTHLIKE_GEOGRAPHY_TARGET]);
    expect(geography?.expectations.find(({ id }) => id === "shelf-beyond-shoreline")).toMatchObject(
      { status: "fail", observed: 0 }
    );

    const withOpenRiverNetwork = {
      ...first,
      metrics: {
        ...first.metrics,
        hydrology: {
          ...first.metrics.hydrology,
          networkSummary: {
            ...first.metrics.hydrology.networkSummary,
            unresolvedMouthTileCount: 1,
          },
        },
      },
    };
    const [integrity] = evaluateMetricTargets(withOpenRiverNetwork, [STANDARD_INTEGRITY_TARGET]);
    expect(integrity?.expectations.find(({ id }) => id === "river-network-closure")).toMatchObject({
      status: "fail",
      observed: false,
    });
  }, 30_000);

  it("measures absent seating as missing evidence and lets product targets fail closed", () => {
    const capture = captureWithoutRuntimeTelemetry(() =>
      captureStandardMapScenario(earthlikePlacementStudy.scenarios[0])
    );
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

  it("fails Earthlike density equity closed with only one qualifying landmass", () => {
    const sample = captureWithoutRuntimeTelemetry(() =>
      measureStandardMapCapture(captureStandardMapScenario(earthlikePlacementStudy.scenarios[0]))
    );
    const qualifying = sample.metrics.resources.landmassDensityRows.find(
      ({ landShare }) => landShare >= 0.1
    );
    if (!qualifying) throw new Error("Metric fixture has no qualifying resource landmass.");
    const singleton = {
      ...sample,
      metrics: {
        ...sample.metrics,
        resources: { ...sample.metrics.resources, landmassDensityRows: [qualifying] },
      },
    };

    const [evaluation] = evaluateMetricTargets(
      [singleton],
      [EARTHLIKE_RESOURCE_DISTRIBUTION_TARGET]
    );
    expect(
      evaluation?.expectations.find(({ id }) => id === "comparable-landmass-sample-evidence")
    ).toMatchObject({ status: "fail", observed: 0 });
    expect(
      evaluation?.expectations.find(({ id }) => id === "qualifying-landmass-density-spread")
    ).toMatchObject({ status: "fail", observed: Number.MAX_SAFE_INTEGER });
  }, 30_000);

  it("classifies start landmasses only through the captured landmass catalog", () => {
    const capture = captureWithoutRuntimeTelemetry(() =>
      captureStandardMapScenario(earthlikePlacementStudy.scenarios[0])
    );
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
    const capture = captureWithoutRuntimeTelemetry(() =>
      captureStandardMapScenario(earthlikePlacementStudy.scenarios[0])
    );
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
    const capture = captureWithoutRuntimeTelemetry(() =>
      captureStandardMapScenario(earthlikePlacementStudy.scenarios[0])
    );
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

  it("measures unclassified modeled land and lets integrity reject the observation", () => {
    const capture = captureWithoutRuntimeTelemetry(() =>
      captureStandardMapScenario(earthlikePlacementStudy.scenarios[0])
    );
    const modeledLandIndex = capture.model.landMask.findIndex((value) => value === 1);
    if (modeledLandIndex < 0) throw new Error("Metric fixture has no modeled land.");
    const biomeIndex = capture.model.biomeIndex.slice();
    biomeIndex[modeledLandIndex] = 255;
    const sample = measureStandardMapCapture({
      ...capture,
      model: { ...capture.model, biomeIndex },
    });

    expect(sample.metrics.ecology.unclassifiedModeledLand.count).toBe(1);
    const [integrity] = evaluateMetricTargets(sample, [STANDARD_INTEGRITY_TARGET]);
    expect(
      integrity?.expectations.find(({ id }) => id === "modeled-land-biome-classification")
    ).toMatchObject({ status: "fail", observed: 1 });
  }, 30_000);

  it("measures excluded candidate placement from resolved runtime observation", () => {
    const capture = captureWithoutRuntimeTelemetry(() =>
      captureStandardMapScenario(earthlikePlacementStudy.scenarios[0])
    );
    const emptyPlot = capture.observation.resource.findIndex(
      (resourceType) => resourceType === capture.observation.noResource
    );
    if (emptyPlot < 0) throw new Error("Metric fixture has no empty resource plot.");
    const resource = capture.observation.resource.slice();
    resource[emptyPlot] = requireResourceRuntimeId("RESOURCE_DATES").resourceTypeId;
    const metrics = measureStandardResources({
      ...capture,
      observation: { ...capture.observation, resource },
    });

    expect(
      metrics.candidates.find(({ resourceType }) => resourceType === "RESOURCE_DATES")
    ).toMatchObject({
      disposition: "scenario-ineligible",
      placedCount: 1,
    });
  }, 30_000);

  it("recomputes hard-phase habitat membership and fails product authority on one violation", () => {
    const capture = captureWithoutRuntimeTelemetry(() =>
      captureStandardMapScenario(earthlikePlacementStudy.scenarios[0])
    );
    const baseline = measureStandardResources(capture);
    const placedOutcome = capture.resources.outcomes.find((outcome) => {
      if (outcome.status !== "placed") return false;
      const intent = capture.resources.intents.find(
        (candidate) => candidate.plotIndex === outcome.plotIndex
      );
      const eligibility = capture.resources.eligibility.find(
        (candidate) => candidate.resourceType === intent?.resourceType
      );
      return (
        intent?.phase !== "region-minimum" && eligibility?.habitatMask[outcome.plotIndex] === 1
      );
    });
    if (!placedOutcome) throw new Error("Metric fixture has no placed in-habitat resource.");
    const intent = capture.resources.intents.find(
      (candidate) => candidate.plotIndex === placedOutcome.plotIndex
    );
    const authoritativeRow = capture.resources.eligibility.find(
      (candidate) => candidate.resourceType === intent?.resourceType
    );
    if (!authoritativeRow) throw new Error("Metric fixture has no resource eligibility row.");
    const habitatMask = authoritativeRow.habitatMask.slice();
    habitatMask[placedOutcome.plotIndex] = 0;
    const changedCapture: StandardMapCapture = {
      ...capture,
      resources: {
        ...capture.resources,
        eligibility: capture.resources.eligibility.map((row) =>
          row === authoritativeRow ? { ...row, habitatMask } : row
        ),
      },
    };
    const changedEligibility = measureStandardResources(changedCapture);
    if (!intent || intent.phase === "region-minimum") {
      throw new Error("Metric fixture selected no hard-phase resource intent.");
    }

    expect(changedEligibility.placedInHabitat).toEqual({
      count: baseline.placedInHabitat.count - 1,
      population: baseline.placedInHabitat.population,
    });
    expect(changedEligibility.placedInHabitatByPhase[intent.phase]).toEqual({
      count: baseline.placedInHabitatByPhase[intent.phase].count - 1,
      population: baseline.placedInHabitatByPhase[intent.phase].population,
    });
    const [integrity] = evaluateMetricTargets(measureStandardMapCapture(changedCapture), [
      STANDARD_INTEGRITY_TARGET,
    ]);
    expect(
      integrity?.expectations.find(({ id }) => id === "resource-hard-phase-habitat")
    ).toMatchObject({ status: "fail", observed: false });
  }, 30_000);

  it("requires complete one-row habitat evidence for every planned symbolic type", () => {
    const capture = captureWithoutRuntimeTelemetry(() =>
      captureStandardMapScenario(earthlikePlacementStudy.scenarios[0])
    );
    const [row] = capture.resources.eligibility;
    if (!row) throw new Error("Metric fixture has no resource eligibility row.");

    expect(() =>
      measureStandardResources({
        ...capture,
        resources: {
          ...capture.resources,
          eligibility: capture.resources.eligibility.filter((candidate) => candidate !== row),
        },
      })
    ).toThrow(`Resource habitat evidence is missing planned type ${row.resourceType}.`);
    expect(() =>
      measureStandardResources({
        ...capture,
        resources: {
          ...capture.resources,
          eligibility: [...capture.resources.eligibility, row],
        },
      })
    ).toThrow(`Resource habitat evidence contains duplicate rows for ${row.resourceType}.`);
    expect(() =>
      measureStandardResources({
        ...capture,
        resources: {
          ...capture.resources,
          eligibility: [
            ...capture.resources.eligibility,
            { resourceType: "RESOURCE_NOT_PLANNED", habitatMask: row.habitatMask },
          ],
        },
      })
    ).toThrow("Resource habitat evidence contains extra row RESOURCE_NOT_PLANNED.");
  }, 30_000);

  it("fails closed on duplicate, missing, extra, or type-mismatched placement outcomes", () => {
    const capture = captureWithoutRuntimeTelemetry(() =>
      captureStandardMapScenario(earthlikePlacementStudy.scenarios[0])
    );
    const [outcome] = capture.resources.outcomes;
    const [otherType] = capture.resources.perType.filter(
      (row) => requireResourceRuntimeId(row.resourceType).resourceTypeId !== outcome?.resourceType
    );
    if (!outcome || !otherType) throw new Error("Metric fixture lacks resource outcome variety.");
    const extraPlot = capture.model.landMask.findIndex(
      (_, plotIndex) => !capture.resources.intents.some((intent) => intent.plotIndex === plotIndex)
    );
    if (extraPlot < 0) throw new Error("Metric fixture has no unplanned plot.");

    expect(() =>
      measureStandardResources({
        ...capture,
        resources: {
          ...capture.resources,
          outcomes: [...capture.resources.outcomes, outcome],
        },
      })
    ).toThrow(`Resource placement contains duplicate outcomes for plot ${outcome.plotIndex}.`);
    expect(() =>
      measureStandardResources({
        ...capture,
        resources: {
          ...capture.resources,
          outcomes: capture.resources.outcomes.filter((candidate) => candidate !== outcome),
        },
      })
    ).toThrow(`Resource placement is missing an outcome for planned plot ${outcome.plotIndex}.`);
    expect(() =>
      measureStandardResources({
        ...capture,
        resources: {
          ...capture.resources,
          outcomes: [...capture.resources.outcomes, { ...outcome, plotIndex: extraPlot }],
        },
      })
    ).toThrow(`Resource placement contains an extra outcome for plot ${extraPlot}.`);
    expect(() =>
      measureStandardResources({
        ...capture,
        resources: {
          ...capture.resources,
          outcomes: capture.resources.outcomes.map((candidate) =>
            candidate === outcome
              ? {
                  ...candidate,
                  resourceType: requireResourceRuntimeId(otherType.resourceType).resourceTypeId,
                }
              : candidate
          ),
        },
      })
    ).toThrow("does not match planned");
  }, 30_000);

  it("fails integrity when completed-map region-minimum evidence is absent", () => {
    const sample = captureWithoutRuntimeTelemetry(() =>
      measureStandardMapCapture(captureStandardMapScenario(earthlikePlacementStudy.scenarios[0]))
    );
    const withoutRegionMinimums = {
      ...sample,
      metrics: {
        ...sample.metrics,
        resources: { ...sample.metrics.resources, regionMinimums: [] },
      },
    };
    const [evaluation] = evaluateMetricTargets(withoutRegionMinimums, [STANDARD_INTEGRITY_TARGET]);

    expect(
      evaluation?.expectations.find(({ id }) => id === "resource-region-minimum-evidence")
    ).toMatchObject({ status: "fail", observed: false });
  }, 30_000);

  it("fails the final regional minimum when a typed adapter rejection creates a deficit", () => {
    const capture = captureWithoutRuntimeTelemetry(() =>
      captureStandardMapScenario(earthlikePlacementStudy.scenarios[0])
    );
    const baseline = measureStandardMapCapture(capture);
    const region = baseline.metrics.resources.regionMinimums.find(
      (row) => row.required > 0 && row.plannedShortfall === 0 && row.placedCount >= row.required
    );
    if (!region) throw new Error("Metric fixture has no satisfied regional minimum.");
    const resourceTypeId = requireResourceRuntimeId(region.resourceType).resourceTypeId;
    const placedInRegion = capture.resources.outcomes.filter((outcome) => {
      const intent = capture.resources.intents.find(
        (candidate) => candidate.plotIndex === outcome.plotIndex
      );
      return (
        outcome.status === "placed" &&
        outcome.resourceType === resourceTypeId &&
        intent?.resourceType === region.resourceType &&
        intent.regionSlot === region.regionSlot
      );
    });
    const rejectCount = placedInRegion.length - region.required + 1;
    if (rejectCount <= 0) throw new Error("Metric fixture cannot create a regional deficit.");
    const rejectedPlots = new Set(
      placedInRegion.slice(0, rejectCount).map((outcome) => outcome.plotIndex)
    );
    const outcomes: StandardMapCapture["resources"]["outcomes"] = capture.resources.outcomes.map(
      (outcome) =>
        rejectedPlots.has(outcome.plotIndex)
          ? {
              ...outcome,
              status: "rejected" as const,
              observedResourceType: undefined,
              reason: "cannot-have-resource" as const,
            }
          : outcome
    );
    const resource = capture.observation.resource.slice();
    for (const plotIndex of rejectedPlots) resource[plotIndex] = capture.observation.noResource;
    const byReason = new Map(
      capture.resources.summary.byReason.map((row) => [row.reason, row.count] as const)
    );
    byReason.set("cannot-have-resource", (byReason.get("cannot-have-resource") ?? 0) + rejectCount);
    const summary: StandardMapCapture["resources"]["summary"] = {
      ...capture.resources.summary,
      placedCount: capture.resources.summary.placedCount - rejectCount,
      rejectedCount: capture.resources.summary.rejectedCount + rejectCount,
      byResource: capture.resources.summary.byResource.map((row) =>
        row.resourceType === resourceTypeId
          ? {
              ...row,
              placedCount: row.placedCount - rejectCount,
              rejectedCount: row.rejectedCount + rejectCount,
              reasons: [
                ...row.reasons.filter((reason) => reason.reason !== "cannot-have-resource"),
                {
                  reason: "cannot-have-resource" as const,
                  count:
                    (row.reasons.find((reason) => reason.reason === "cannot-have-resource")
                      ?.count ?? 0) + rejectCount,
                },
              ],
            }
          : row
      ),
      byReason: [...byReason].map(([reason, count]) => ({ reason, count })),
    };
    const withFinalDeficit = measureStandardMapCapture({
      ...capture,
      resources: { ...capture.resources, outcomes, summary },
      observation: { ...capture.observation, resource },
    });
    const [evaluation] = evaluateMetricTargets(withFinalDeficit, [STANDARD_INTEGRITY_TARGET]);

    expect(
      evaluation?.expectations.find(({ id }) => id === "resource-region-minimum-evidence")
    ).toMatchObject({ status: "pass", observed: true });
    expect(
      evaluation?.expectations.find(({ id }) => id === "resource-final-region-minimums")
    ).toMatchObject({ status: "fail", observed: false });
  }, 30_000);

  it("fails integrity when an admitted resource demand lacks terminal closure", () => {
    const sample = captureWithoutRuntimeTelemetry(() =>
      measureStandardMapCapture(captureStandardMapScenario(earthlikePlacementStudy.scenarios[0]))
    );
    const admitted = sample.metrics.resources.candidates.find(
      (candidate) => candidate.disposition === "admitted"
    );
    if (!admitted || admitted.disposition !== "admitted") {
      throw new Error("Metric fixture has no admitted resource demand.");
    }
    const withoutClosure = {
      ...sample,
      metrics: {
        ...sample.metrics,
        resources: {
          ...sample.metrics.resources,
          candidates: sample.metrics.resources.candidates.map((candidate) =>
            candidate === admitted
              ? { ...admitted, targetIntentCount: 1, plannedCount: 0, shortfalls: [] }
              : candidate
          ),
        },
      },
    };
    const [evaluation] = evaluateMetricTargets(withoutClosure, [STANDARD_INTEGRITY_TARGET]);

    expect(
      evaluation?.expectations.find(({ id }) => id === "resource-demand-disposition")
    ).toMatchObject({ status: "fail", observed: false });
  }, 30_000);
});

function evaluateWithoutRuntimeTelemetry(
  studies: NonEmptyTuple<StandardMetricStudy>
): StandardMetricRunEvaluation {
  return captureWithoutRuntimeTelemetry(() => evaluateStandardMetricStudies(studies));
}

function captureWithoutRuntimeTelemetry<T>(capture: () => T): T {
  const originalLog = console.log;
  console.log = () => undefined;
  try {
    return capture();
  } finally {
    console.log = originalLog;
  }
}

function requireMetricStudy(studyId: string): StandardMetricStudy {
  const metricStudy = STANDARD_METRIC_STUDIES.find((candidate) => candidate.id === studyId);
  if (!metricStudy) throw new Error(`Missing Standard metric study ${studyId}.`);
  return metricStudy;
}

function requireNonEmptyStudies(
  studies: readonly StandardMetricStudy[]
): NonEmptyTuple<StandardMetricStudy> {
  const [first, ...rest] = studies;
  if (!first) throw new Error("Standard product metrics require at least one remaining study.");
  return [first, ...rest];
}

function failedExpectations(evaluation: StandardMetricRunEvaluation): readonly string[] {
  const failures: string[] = [];
  for (const metricStudy of evaluation.studies) {
    const scenarios =
      metricStudy.kind === "sample" ? [metricStudy.scenario] : metricStudy.scenarios;
    for (const scenario of scenarios) {
      for (const target of scenario.targets) {
        for (const expectation of target.expectations) {
          if (expectation.status === "fail") {
            failures.push(
              `${metricStudy.studyId}/${scenario.scenarioId}/${target.targetId}/${expectation.id}`
            );
          }
        }
      }
    }
    if (metricStudy.kind === "cohort") {
      for (const target of metricStudy.cohortTargets) {
        for (const expectation of target.expectations) {
          if (expectation.status === "fail") {
            failures.push(`${metricStudy.studyId}/${target.targetId}/${expectation.id}`);
          }
        }
      }
    }
  }
  return failures;
}
