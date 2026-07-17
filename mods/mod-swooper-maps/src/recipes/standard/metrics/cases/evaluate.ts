import {
  evaluateMetricTargets,
  type MetricTarget,
  type MetricTargetEvaluation,
} from "@swooper/mapgen-metrics";
import type { NonEmptyTuple } from "type-fest";

import { captureStandardMapScenario } from "../capture.js";
import { measureStandardMapCapture, type StandardMapProductSample } from "../sample.js";
import type { StandardPresetMetricScenario } from "../scenario.js";
import type {
  StandardMetricCase,
  StandardMetricCaseEvaluation,
  StandardMetricCohortCase,
  StandardMetricCohortCaseEvaluation,
  StandardMetricRunEvaluation,
  StandardMetricSampleCase,
  StandardMetricSampleCaseEvaluation,
  StandardMetricScenarioEvaluation,
} from "./model.js";
import { standardMetricScenarioSignature } from "./scenarios.js";

/**
 * Captures each unique scenario exactly once and evaluates the declared cases atomically.
 * All scenario identities are reconciled before generation, and any capture failure aborts the run.
 */
export function evaluateStandardMetricCases(
  cases: NonEmptyTuple<StandardMetricCase>
): StandardMetricRunEvaluation {
  assertUniqueCaseIds(cases);
  const scenarios = reconcileScenarios(cases);
  const samples = captureScenarios(scenarios);
  const evaluations = Object.freeze(cases.map((metricCase) => evaluateCase(metricCase, samples)));
  return Object.freeze({
    status: evaluations.every((evaluation) => evaluation.status === "pass") ? "pass" : "fail",
    scenarioCount: samples.size,
    cases: evaluations,
  });
}

function reconcileScenarios(
  cases: readonly StandardMetricCase[]
): readonly StandardPresetMetricScenario[] {
  const byId = new Map<
    string,
    Readonly<{ signature: string; scenario: StandardPresetMetricScenario }>
  >();
  for (const metricCase of cases) {
    const scenarios = metricCase.kind === "sample" ? [metricCase.scenario] : metricCase.scenarios;
    for (const scenario of scenarios) {
      if (scenario.kind !== "civ7-preset") {
        throw new Error(`Product metric case ${metricCase.id} cannot use custom map dimensions.`);
      }
      const signature = standardMetricScenarioSignature(scenario);
      const existing = byId.get(scenario.id);
      if (existing && existing.signature !== signature) {
        throw new Error(`Standard metric scenario ID ${scenario.id} has conflicting definitions.`);
      }
      if (!existing) byId.set(scenario.id, Object.freeze({ signature, scenario }));
    }
  }
  return Object.freeze(Array.from(byId.values(), ({ scenario }) => scenario));
}

function captureScenarios(
  scenarios: readonly StandardPresetMetricScenario[]
): ReadonlyMap<string, StandardMapProductSample> {
  const samples = new Map<string, StandardMapProductSample>();
  for (const scenario of scenarios) {
    samples.set(scenario.id, measureStandardMapCapture(captureStandardMapScenario(scenario)));
  }
  return samples;
}

function evaluateCase(
  metricCase: StandardMetricCase,
  samples: ReadonlyMap<string, StandardMapProductSample>
): StandardMetricCaseEvaluation {
  return metricCase.kind === "sample"
    ? evaluateSampleCase(metricCase, samples)
    : evaluateCohortCase(metricCase, samples);
}

function evaluateSampleCase(
  metricCase: StandardMetricSampleCase,
  samples: ReadonlyMap<string, StandardMapProductSample>
): StandardMetricSampleCaseEvaluation {
  const scenario = evaluateScenario(metricCase.scenario, metricCase.targets, samples);
  return Object.freeze({
    kind: "sample",
    caseId: metricCase.id,
    status: scenario.status,
    scenario,
  });
}

function evaluateCohortCase(
  metricCase: StandardMetricCohortCase,
  samples: ReadonlyMap<string, StandardMapProductSample>
): StandardMetricCohortCaseEvaluation {
  const cohort = metricCase.scenarios.map((scenario) => requireSample(samples, scenario.id)) as [
    StandardMapProductSample,
    ...StandardMapProductSample[],
  ];
  const scenarioEvaluations = Object.freeze(
    metricCase.scenarios.map((scenario) =>
      evaluateScenario(scenario, metricCase.sampleTargets, samples)
    )
  );
  const cohortTargets = evaluateMetricTargets(cohort, metricCase.cohortTargets);
  const status =
    scenarioEvaluations.every((evaluation) => evaluation.status === "pass") &&
    cohortTargets.every((evaluation) => evaluation.status === "pass")
      ? "pass"
      : "fail";
  return Object.freeze({
    kind: "cohort",
    caseId: metricCase.id,
    status,
    scenarios: scenarioEvaluations,
    cohortTargets,
  });
}

function evaluateScenario(
  scenario: StandardPresetMetricScenario,
  targets: NonEmptyTuple<MetricTarget<StandardMapProductSample>>,
  samples: ReadonlyMap<string, StandardMapProductSample>
): StandardMetricScenarioEvaluation {
  const sample = requireSample(samples, scenario.id);
  return scenarioEvaluation(sample, evaluateMetricTargets(sample, targets));
}

function scenarioEvaluation(
  sample: StandardMapProductSample,
  targets: readonly MetricTargetEvaluation[]
): StandardMetricScenarioEvaluation {
  return Object.freeze({
    scenarioId: sample.provenance.scenarioId,
    provenance: sample.provenance,
    status: targets.every((evaluation) => evaluation.status === "pass") ? "pass" : "fail",
    targets,
  });
}

function requireSample(
  samples: ReadonlyMap<string, StandardMapProductSample>,
  scenarioId: string
): StandardMapProductSample {
  const sample = samples.get(scenarioId);
  if (!sample) throw new Error(`Missing captured Standard metric scenario ${scenarioId}.`);
  return sample;
}

function assertUniqueCaseIds(cases: readonly StandardMetricCase[]): void {
  const seen = new Set<string>();
  for (const metricCase of cases) {
    if (metricCase.id.trim().length === 0 || metricCase.id !== metricCase.id.trim()) {
      throw new Error("Standard metric cases require trimmed, nonempty IDs.");
    }
    if (seen.has(metricCase.id)) {
      throw new Error(`Duplicate Standard metric case ID ${metricCase.id}.`);
    }
    seen.add(metricCase.id);
  }
}
