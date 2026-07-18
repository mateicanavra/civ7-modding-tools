import {
  evaluateMetricTargets,
  type MetricTarget,
  type MetricTargetEvaluation,
} from "@swooper/mapgen-metrics";
import type { NonEmptyTuple } from "type-fest";

import { captureStandardMapScenario } from "../capture.js";
import { measureStandardMapCapture, type StandardMapProductSample } from "../sample.js";
import { defineStandardMapMetricScenario, type StandardPresetMetricScenario } from "../scenario.js";
import type {
  StandardMetricCohortStudy,
  StandardMetricCohortStudyEvaluation,
  StandardMetricRunEvaluation,
  StandardMetricSampleStudy,
  StandardMetricSampleStudyEvaluation,
  StandardMetricScenarioEvaluation,
  StandardMetricStudy,
  StandardMetricStudyEvaluation,
} from "./model.js";
import { standardMetricScenarioSignature } from "./scenarios.js";

/**
 * Captures each unique scenario exactly once and evaluates the declared studies atomically.
 * All scenario identities are reconciled before generation, and any capture failure aborts the run.
 */
export function evaluateStandardMetricStudies(
  studies: NonEmptyTuple<StandardMetricStudy>
): StandardMetricRunEvaluation {
  assertUniqueStudyIds(studies);
  const scenarios = reconcileScenarios(studies);
  const samples = captureScenarios(scenarios);
  const evaluations = Object.freeze(
    studies.map((metricStudy) => evaluateStudy(metricStudy, samples))
  );
  return Object.freeze({
    status: evaluations.every((evaluation) => evaluation.status === "pass") ? "pass" : "fail",
    scenarioCount: samples.size,
    studies: evaluations,
  });
}

function reconcileScenarios(
  studies: readonly StandardMetricStudy[]
): readonly StandardPresetMetricScenario[] {
  const byId = new Map<
    string,
    Readonly<{ signature: string; scenario: StandardPresetMetricScenario }>
  >();
  for (const metricStudy of studies) {
    const scenarios =
      metricStudy.kind === "sample" ? [metricStudy.scenario] : metricStudy.scenarios;
    for (const scenario of scenarios) {
      if (scenario.kind !== "civ7-preset") {
        throw new Error(`Product metric study ${metricStudy.id} cannot use custom map dimensions.`);
      }
      const admittedScenario = defineStandardMapMetricScenario(scenario);
      if (admittedScenario.kind !== "civ7-preset") {
        throw new Error(`Product metric study ${metricStudy.id} requires a Civ7 preset.`);
      }
      const signature = standardMetricScenarioSignature(admittedScenario);
      const existing = byId.get(admittedScenario.id);
      if (existing && existing.signature !== signature) {
        throw new Error(
          `Standard metric scenario ID ${admittedScenario.id} has conflicting definitions.`
        );
      }
      if (!existing) {
        byId.set(admittedScenario.id, Object.freeze({ signature, scenario: admittedScenario }));
      }
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

function evaluateStudy(
  metricStudy: StandardMetricStudy,
  samples: ReadonlyMap<string, StandardMapProductSample>
): StandardMetricStudyEvaluation {
  return metricStudy.kind === "sample"
    ? evaluateSampleStudy(metricStudy, samples)
    : evaluateCohortStudy(metricStudy, samples);
}

function evaluateSampleStudy(
  metricStudy: StandardMetricSampleStudy,
  samples: ReadonlyMap<string, StandardMapProductSample>
): StandardMetricSampleStudyEvaluation {
  const scenario = evaluateScenario(metricStudy.scenario, metricStudy.targets, samples);
  return Object.freeze({
    kind: "sample",
    studyId: metricStudy.id,
    status: scenario.status,
    scenario,
  });
}

function evaluateCohortStudy(
  metricStudy: StandardMetricCohortStudy,
  samples: ReadonlyMap<string, StandardMapProductSample>
): StandardMetricCohortStudyEvaluation {
  const cohort = metricStudy.scenarios.map((scenario) => requireSample(samples, scenario.id)) as [
    StandardMapProductSample,
    ...StandardMapProductSample[],
  ];
  const scenarioEvaluations = Object.freeze(
    metricStudy.scenarios.map((scenario) =>
      evaluateScenario(scenario, metricStudy.sampleTargets, samples)
    )
  );
  const cohortTargets = evaluateMetricTargets(cohort, metricStudy.cohortTargets);
  const status =
    scenarioEvaluations.every((evaluation) => evaluation.status === "pass") &&
    cohortTargets.every((evaluation) => evaluation.status === "pass")
      ? "pass"
      : "fail";
  return Object.freeze({
    kind: "cohort",
    studyId: metricStudy.id,
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

function assertUniqueStudyIds(studies: readonly StandardMetricStudy[]): void {
  const seen = new Set<string>();
  for (const metricStudy of studies) {
    if (metricStudy.id.trim().length === 0 || metricStudy.id !== metricStudy.id.trim()) {
      throw new Error("Standard metric studies require trimmed, nonempty IDs.");
    }
    if (seen.has(metricStudy.id)) {
      throw new Error(`Duplicate Standard metric study ID ${metricStudy.id}.`);
    }
    seen.add(metricStudy.id);
  }
}
