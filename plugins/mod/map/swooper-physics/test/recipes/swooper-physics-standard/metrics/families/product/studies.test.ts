import { describe, expect, it } from "bun:test";
import { evaluateStandardMetricStudies } from "../../../../../../src/recipes/standard/metrics/index.js";
import {
  EARTHLIKE_PLACEMENT_STUDY,
  failedExpectations,
  OTHER_METRIC_STUDIES,
} from "../../fixtures/standard-product.js";

describe("Standard map product studies", () => {
  it("keeps the full Earthlike placement cohort inside its placement and resource targets", () => {
    const evaluation = evaluateStandardMetricStudies([EARTHLIKE_PLACEMENT_STUDY]);
    expect(failedExpectations(evaluation)).toEqual([]);
    expect(evaluation.status).toBe("pass");
  }, 180_000);

  it("keeps every other declared map product inside its shared metric targets", () => {
    const evaluation = evaluateStandardMetricStudies(OTHER_METRIC_STUDIES);
    const expectedScenarioIds = new Set(
      OTHER_METRIC_STUDIES.flatMap((metricStudy) =>
        metricStudy.kind === "sample"
          ? [metricStudy.scenario.id]
          : metricStudy.scenarios.map((scenario) => scenario.id)
      )
    );

    expect(evaluation.scenarioCount).toBe(expectedScenarioIds.size);
    expect(failedExpectations(evaluation)).toEqual([]);
    expect(evaluation.status).toBe("pass");
  }, 180_000);
});
