#!/usr/bin/env bun

import {
  evaluateStandardMetricStudies,
  STANDARD_METRIC_STUDIES,
} from "../../src/recipes/standard/metrics/index.js";

const evaluation = evaluateWithoutStdoutTelemetry();
const targetEvaluations = evaluation.studies.flatMap((metricStudy) =>
  metricStudy.kind === "sample"
    ? metricStudy.scenario.targets
    : [
        ...metricStudy.cohortTargets,
        ...metricStudy.scenarios.flatMap((scenario) => scenario.targets),
      ]
);
const failedTargets = targetEvaluations.filter((target) => target.status === "fail").length;

process.stdout.write(`${JSON.stringify(evaluation)}\n`);
process.stderr.write(
  `Standard metrics ${evaluation.status}: ${evaluation.scenarioCount} scenarios, ` +
    `${targetEvaluations.length - failedTargets}/${targetEvaluations.length} targets passed.\n`
);
if (evaluation.status === "fail") process.exitCode = 1;

function evaluateWithoutStdoutTelemetry() {
  const originalLog = console.log;
  console.log = (...args: unknown[]) => console.error(...args);
  try {
    return evaluateStandardMetricStudies(STANDARD_METRIC_STUDIES);
  } finally {
    console.log = originalLog;
  }
}
