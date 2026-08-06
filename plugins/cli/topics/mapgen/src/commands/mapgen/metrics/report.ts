import { Command } from "@oclif/core";
import {
  evaluateStandardMetricStudies,
  STANDARD_METRIC_STUDIES,
} from "@swooper/swooper-physics/standard/metrics";

export default class MapgenMetricsReport extends Command {
  static summary = "Evaluate the complete Swooper Standard metric study bank";

  public async run(): Promise<void> {
    const evaluation = evaluateStandardMetricStudies(STANDARD_METRIC_STUDIES);
    const targets = evaluation.studies.flatMap((study) =>
      study.kind === "sample"
        ? study.scenario.targets
        : [...study.cohortTargets, ...study.scenarios.flatMap((scenario) => scenario.targets)]
    );
    const failedTargets = targets.filter((target) => target.status === "fail").length;

    this.log(JSON.stringify(evaluation));
    this.logToStderr(
      `Standard metrics ${evaluation.status}: ${evaluation.scenarioCount} scenarios, ` +
        `${targets.length - failedTargets}/${targets.length} targets passed.`
    );
    if (evaluation.status === "fail") this.exit(1);
  }
}
