import { Command, Flags } from "@oclif/core";
import {
  evaluateStandardMetricStudies,
  type StandardMetricStudyScope,
  selectStandardMetricStudies,
} from "@swooper/swooper-physics/standard/metrics";

export default class MapgenMetricsReport extends Command {
  static summary = "Evaluate core Earthlike metric studies or opt in to configuration stress";

  static flags = {
    scope: Flags.option({
      description: "Qualification scope; all includes biased configuration-stress studies",
      options: ["earthlike-core", "all"] as const satisfies readonly StandardMetricStudyScope[],
      default: "earthlike-core",
    })(),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(MapgenMetricsReport);
    const studies = selectStandardMetricStudies(flags.scope);
    const originalLog = console.log;
    console.log = (...args: unknown[]) => console.error(...args);
    let evaluation: ReturnType<typeof evaluateStandardMetricStudies>;
    try {
      evaluation = evaluateStandardMetricStudies(studies);
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
