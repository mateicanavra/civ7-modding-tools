import { Flags } from "@oclif/core";
import { HabitatCommand } from "../base/HabitatCommand.js";
import {
  checkCommandContext,
  createCheckReport,
  renderCheckReport,
  verifyCheckSummaryProjection,
} from "../lib/check-report.js";
import {
  createVerifyReceipt,
  readVerifyTargetPlan,
  resolveVerifyBase,
  runAffectedVerification,
  stringifyVerifyReceipt,
} from "../lib/verify-receipt.js";

export default class Verify extends HabitatCommand {
  static override summary = "Run Habitat check plus affected verification targets";
  static override description =
    "Runs Habitat checks first, then Nx affected build/check/test/boundaries/biome:ci/grit:check/generated:check for the selected base.";
  static override examples = [
    "<%= config.bin %> <%= command.id %>",
    "<%= config.bin %> <%= command.id %> --base HEAD~1",
  ];

  static override flags = {
    base: Flags.string({
      description: "Git base ref for affected targets and baseline integrity.",
    }),
    json: Flags.boolean({
      description: "Emit a structured verify receipt instead of human output.",
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Verify);
    const startedAt = new Date().toISOString();
    const startedMs = Date.now();
    const baseDecision = resolveVerifyBase(flags.base);
    if (baseDecision.kind === "refused") {
      this.error(baseDecision.message, { exit: 1 });
    }
    const base = baseDecision.base;
    const report = await createCheckReport({ base, command: checkCommandContext(this.rawArgv()) });
    const checkProjection = verifyCheckSummaryProjection(report);
    const targetPlan = await readVerifyTargetPlan();
    let affectedResult: ReturnType<typeof runAffectedVerification> | undefined;
    let exitCode = 0;
    if (!checkProjection.allowsAffectedExecution) exitCode = 1;
    else if (targetPlan.kind === "verify-target-plan-refused") exitCode = 1;
    else affectedResult = runAffectedVerification(base, targetPlan);
    if (affectedResult) exitCode = affectedResult.exitCode;

    if (flags.json) {
      const receipt = createVerifyReceipt({
        requestedBase: flags.base,
        resolvedBase: base,
        commandArgs: this.rawArgv(),
        startedAt,
        durationMs: Date.now() - startedMs,
        exitCode,
        checkReport: report,
        verifyTargetPlan: targetPlan,
        affectedResult,
      });
      this.log(stringifyVerifyReceipt(receipt));
      if (exitCode !== 0) this.exitWith(exitCode);
      return;
    }

    this.log(renderCheckReport(report));
    if (!checkProjection.allowsAffectedExecution) this.exit(1);
    if (targetPlan.kind === "verify-target-plan-refused") {
      const message =
        targetPlan.refusal.kind === "graph-refusal"
          ? targetPlan.refusal.message
          : "Workspace graph refused verify target planning.";
      this.error(message, { exit: 1 });
    }

    this.log(`\nhabitat verify: running repo Nx affected (base=${base}) ...`);
    const result = affectedResult ?? runAffectedVerification(base, targetPlan);
    process.stdout.write(result.stdout);
    process.stderr.write(result.stderr);
    this.exitWith(result.exitCode);
  }
}
