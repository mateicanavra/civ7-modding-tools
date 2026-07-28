import type { NonEmptyTuple } from "type-fest";
import {
  captureStandardMapScenario,
  type StandardMapCapture,
} from "../../../../../src/recipes/standard/metrics/capture.js";
import {
  STANDARD_METRIC_STUDIES,
  type StandardMetricRunEvaluation,
} from "../../../../../src/recipes/standard/metrics/index.js";
import {
  measureStandardMapCapture,
  type StandardMapProductSample,
} from "../../../../../src/recipes/standard/metrics/sample.js";
import type { StandardMetricStudy } from "../../../../../src/recipes/standard/metrics/studies/index.js";

const earthlikePlacementStudy = requireMetricStudy("earthlike/placement");
if (earthlikePlacementStudy.kind !== "cohort") {
  throw new Error("Earthlike placement metrics require a cohort study.");
}

/** Shipped Earthlike cohort whose placement and resource distribution are evaluated together. */
export const EARTHLIKE_PLACEMENT_STUDY = earthlikePlacementStudy;

/** Every declared Standard metric study other than the dedicated Earthlike placement cohort. */
export const OTHER_METRIC_STUDIES = requireNonEmptyStudies(
  STANDARD_METRIC_STUDIES.filter((metricStudy) => metricStudy !== EARTHLIKE_PLACEMENT_STUDY)
);

let representativeEarthlikeCapture: StandardMapCapture | undefined;
let representativeEarthlikeSample: StandardMapProductSample | undefined;

/** Captures a fresh representative Earthlike placement scenario for determinism checks. */
export function captureFreshEarthlikeScenario(): StandardMapCapture {
  return captureStandardMapScenario(EARTHLIKE_PLACEMENT_STUDY.scenarios[0]);
}

/** Returns an isolated copy of the shared representative Earthlike capture. */
export function captureEarthlikeScenario(): StandardMapCapture {
  representativeEarthlikeCapture ??= captureFreshEarthlikeScenario();
  return structuredClone(representativeEarthlikeCapture);
}

/** Returns an isolated copy of the shared representative Earthlike product sample. */
export function measureEarthlikeSample(): StandardMapProductSample {
  representativeEarthlikeCapture ??= captureFreshEarthlikeScenario();
  representativeEarthlikeSample ??= measureStandardMapCapture(representativeEarthlikeCapture);
  return structuredClone(representativeEarthlikeSample);
}

/** Collects stable study/scenario/target expectation paths for every failed metric check. */
export function failedExpectations(evaluation: StandardMetricRunEvaluation): readonly string[] {
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
