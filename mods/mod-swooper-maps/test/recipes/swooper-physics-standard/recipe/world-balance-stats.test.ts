import { describe, expect, it } from "bun:test";

import {
  evaluateStandardMetricCases,
  STANDARD_METRIC_CASES,
  type StandardMetricRunEvaluation,
} from "../../../../src/recipes/standard/metrics/index.js";

describe("Standard map product metrics", () => {
  it("keeps every declared map product inside its shared metric targets", () => {
    const evaluation = evaluateWithoutRuntimeTelemetry();
    const expectedScenarioIds = new Set(
      STANDARD_METRIC_CASES.flatMap((metricCase) =>
        metricCase.kind === "sample"
          ? [metricCase.scenario.id]
          : metricCase.scenarios.map((scenario) => scenario.id)
      )
    );

    expect(evaluation.scenarioCount).toBe(expectedScenarioIds.size);
    expect(failedExpectations(evaluation)).toEqual([]);
    expect(evaluation.status).toBe("pass");
  }, 180_000);
});

function evaluateWithoutRuntimeTelemetry(): StandardMetricRunEvaluation {
  const originalLog = console.log;
  console.log = () => undefined;
  try {
    return evaluateStandardMetricCases(STANDARD_METRIC_CASES);
  } finally {
    console.log = originalLog;
  }
}

function failedExpectations(evaluation: StandardMetricRunEvaluation): readonly string[] {
  const failures: string[] = [];
  for (const metricCase of evaluation.cases) {
    const scenarios = metricCase.kind === "sample" ? [metricCase.scenario] : metricCase.scenarios;
    for (const scenario of scenarios) {
      for (const target of scenario.targets) {
        for (const expectation of target.expectations) {
          if (expectation.status === "fail") {
            failures.push(
              `${metricCase.caseId}/${scenario.scenarioId}/${target.targetId}/${expectation.id}`
            );
          }
        }
      }
    }
    if (metricCase.kind === "cohort") {
      for (const target of metricCase.cohortTargets) {
        for (const expectation of target.expectations) {
          if (expectation.status === "fail") {
            failures.push(`${metricCase.caseId}/${target.targetId}/${expectation.id}`);
          }
        }
      }
    }
  }
  return failures;
}
