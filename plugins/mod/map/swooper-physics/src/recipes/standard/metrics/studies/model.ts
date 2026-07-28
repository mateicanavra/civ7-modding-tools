import type { MetricTarget, MetricTargetEvaluation } from "@swooper/mapgen-metrics";
import type { NonEmptyTuple } from "type-fest";

import type { StandardMapMetricCohort, StandardMapProductSample } from "../sample.js";
import type { StandardPresetMetricScenario } from "../scenario.js";

/** One product benchmark evaluated against a single real-preset Standard map. */
export type StandardMetricSampleStudy = Readonly<{
  kind: "sample";
  id: string;
  scenario: StandardPresetMetricScenario;
  targets: NonEmptyTuple<MetricTarget<StandardMapProductSample>>;
}>;

/**
 * One cohort benchmark over real-preset Standard maps.
 * Sample targets close each constituent map before cohort targets compare the population.
 */
export type StandardMetricCohortStudy = Readonly<{
  kind: "cohort";
  id: string;
  scenarios: NonEmptyTuple<StandardPresetMetricScenario>;
  sampleTargets: NonEmptyTuple<MetricTarget<StandardMapProductSample>>;
  cohortTargets: NonEmptyTuple<MetricTarget<StandardMapMetricCohort>>;
}>;

/** Closed recipe-study shapes admitted by the Standard metrics runner. */
export type StandardMetricStudy = StandardMetricSampleStudy | StandardMetricCohortStudy;

/** Evaluation of one target set against a captured scenario. */
export type StandardMetricScenarioEvaluation = Readonly<{
  scenarioId: string;
  provenance: StandardMapProductSample["provenance"];
  status: "pass" | "fail";
  targets: readonly MetricTargetEvaluation[];
}>;

/** Closed evaluation of one single-map product study. */
export type StandardMetricSampleStudyEvaluation = Readonly<{
  kind: "sample";
  studyId: string;
  status: "pass" | "fail";
  scenario: StandardMetricScenarioEvaluation;
}>;

/** Closed evaluation of a cohort and every sample-level target it owns. */
export type StandardMetricCohortStudyEvaluation = Readonly<{
  kind: "cohort";
  studyId: string;
  status: "pass" | "fail";
  scenarios: readonly StandardMetricScenarioEvaluation[];
  cohortTargets: readonly MetricTargetEvaluation[];
}>;

/** Complete result of evaluating one declared Standard metric study. */
export type StandardMetricStudyEvaluation =
  | StandardMetricSampleStudyEvaluation
  | StandardMetricCohortStudyEvaluation;

/** Atomic result of one Standard product-metrics run over the closed study bank. */
export type StandardMetricRunEvaluation = Readonly<{
  status: "pass" | "fail";
  scenarioCount: number;
  studies: readonly StandardMetricStudyEvaluation[];
}>;
