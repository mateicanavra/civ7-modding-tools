import type { MetricTarget, MetricTargetEvaluation } from "@swooper/mapgen-metrics";
import type { NonEmptyTuple } from "type-fest";

import type { StandardMapMetricCohort, StandardMapProductSample } from "../sample.js";
import type { StandardPresetMetricScenario } from "../scenario.js";

/** One product target evaluated against a single real-preset Standard map. */
export type StandardMetricSampleCase = Readonly<{
  kind: "sample";
  id: string;
  scenario: StandardPresetMetricScenario;
  targets: NonEmptyTuple<MetricTarget<StandardMapProductSample>>;
}>;

/**
 * One cohort benchmark over real-preset Standard maps.
 * Sample targets close each constituent map before cohort targets compare the population.
 */
export type StandardMetricCohortCase = Readonly<{
  kind: "cohort";
  id: string;
  scenarios: NonEmptyTuple<StandardPresetMetricScenario>;
  sampleTargets: NonEmptyTuple<MetricTarget<StandardMapProductSample>>;
  cohortTargets: NonEmptyTuple<MetricTarget<StandardMapMetricCohort>>;
}>;

/** Closed product-case shapes admitted by the Standard metrics runner. */
export type StandardMetricCase = StandardMetricSampleCase | StandardMetricCohortCase;

/** Evaluation of one target set against a captured scenario. */
export type StandardMetricScenarioEvaluation = Readonly<{
  scenarioId: string;
  provenance: StandardMapProductSample["provenance"];
  status: "pass" | "fail";
  targets: readonly MetricTargetEvaluation[];
}>;

/** Closed evaluation of one single-map product case. */
export type StandardMetricSampleCaseEvaluation = Readonly<{
  kind: "sample";
  caseId: string;
  status: "pass" | "fail";
  scenario: StandardMetricScenarioEvaluation;
}>;

/** Closed evaluation of a cohort and every sample-level target it owns. */
export type StandardMetricCohortCaseEvaluation = Readonly<{
  kind: "cohort";
  caseId: string;
  status: "pass" | "fail";
  scenarios: readonly StandardMetricScenarioEvaluation[];
  cohortTargets: readonly MetricTargetEvaluation[];
}>;

/** Complete result of evaluating one declared Standard metrics case. */
export type StandardMetricCaseEvaluation =
  | StandardMetricSampleCaseEvaluation
  | StandardMetricCohortCaseEvaluation;

/** Atomic result of one Standard product-metrics run over a closed case catalog. */
export type StandardMetricRunEvaluation = Readonly<{
  status: "pass" | "fail";
  scenarioCount: number;
  cases: readonly StandardMetricCaseEvaluation[];
}>;
