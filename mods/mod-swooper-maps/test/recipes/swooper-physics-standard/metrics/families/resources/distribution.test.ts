import { describe, expect, it } from "bun:test";
import { requireResourceRuntimeId } from "@civ7/map-policy";
import { evaluateMetricTargets } from "@swooper/mapgen-metrics";
import type { StandardMapCapture } from "../../../../../../src/recipes/standard/metrics/capture.js";
import { measureStandardResources } from "../../../../../../src/recipes/standard/metrics/families/resources.js";
import { measureStandardMapCapture } from "../../../../../../src/recipes/standard/metrics/sample.js";
import { STANDARD_INTEGRITY_TARGET } from "../../../../../../src/recipes/standard/metrics/targets/integrity.js";
import { EARTHLIKE_RESOURCE_DISTRIBUTION_TARGET } from "../../../../../../src/recipes/standard/metrics/targets/resources.js";
import {
  captureEarthlikeScenario,
  measureEarthlikeSample,
} from "../../fixtures/standard-product.js";

describe("Standard resource metrics", () => {
  it("captures admitted demand and terminal placement as one closed resource population", () => {
    const resources = measureEarthlikeSample().metrics.resources;

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
  }, 30_000);

  it("fails Earthlike density equity closed with only one qualifying landmass", () => {
    const sample = measureEarthlikeSample();
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

  it("measures excluded candidate placement from resolved runtime observation", () => {
    const capture = captureEarthlikeScenario();
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
    const capture = captureEarthlikeScenario();
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
    const capture = captureEarthlikeScenario();
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
    const capture = captureEarthlikeScenario();
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
    const sample = measureEarthlikeSample();
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
    const capture = captureEarthlikeScenario();
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
    const sample = measureEarthlikeSample();
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
