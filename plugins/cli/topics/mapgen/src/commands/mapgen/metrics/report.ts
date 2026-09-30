import { Command } from "@oclif/core";
import {
  evaluateStandardMetricStudies,
  STANDARD_METRIC_STUDIES,
} from "@swooper/swooper-physics/standard/metrics";

export default class MapgenMetricsReport extends Command {
  static summary = "Evaluate the complete Swooper Standard metric study bank";

  public async run(): Promise<void> {
    const originalLog = console.log;
    console.log = (...args: unknown[]) => console.error(...args);
    let evaluation: ReturnType<typeof evaluateStandardMetricStudies>;
    try {
      evaluation = evaluateStandardMetricStudies(STANDARD_METRIC_STUDIES);
    } finally {
      console.log = originalLog;
    }
    const targets = evaluation.studies.flatMap((study) =>
      study.kind === "sample"
        ? study.scenario.targets
        : [...study.cohortTargets, ...study.scenarios.flatMap((scenario) => scenario.targets)]
    );
    const failedTargets = targets.filter((target) => target.status === "fail").length;

    // Flush the complete JSON before oclif can terminate on failed metrics.
    await new Promise<void>((resolve, reject) => {
      process.stdout.write(`${JSON.stringify(evaluation)}\n`, (error) => {
        if (error && !("code" in error && error.code === "EPIPE")) reject(error);
        else resolve();
      });
    });
    this.logToStderr(
      `Standard metrics ${evaluation.status}: ${evaluation.scenarioCount} scenarios, ` +
        `${targets.length - failedTargets}/${targets.length} targets passed.`
    );
    if (evaluation.status === "fail") this.exit(1);
  }
}
