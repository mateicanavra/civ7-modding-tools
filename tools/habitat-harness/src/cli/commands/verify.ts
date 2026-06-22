import { HabitatCommand } from "@internal/habitat-harness/cli/base/HabitatCommand";
import {
  renderCheckReport,
  verifyCheckSummary,
} from "@internal/habitat-harness/service/model/check/policy/structural/index";
import { stringifyVerifyReceipt } from "@internal/habitat-harness/service/model/verify/index";
import { habitatServiceRouter } from "@internal/habitat-harness/service/router";
import { Flags } from "@oclif/core";
import { createRouterClient } from "@orpc/server";

export default class Verify extends HabitatCommand {
  static override summary = "Run Habitat check plus affected verification targets";
  static override description =
    "Runs Habitat checks first, then Nx affected build/check/test for the selected base. JSON mode emits a bounded receipt without running the affected target lane.";
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
    const service = createRouterClient(habitatServiceRouter, { context: {} });
    const result = await service.verify.run({
      base: flags.base,
      affectedExecution: flags.json ? "plan-only" : "run",
    });
    if (result.kind === "base-refused") this.error(result.message, { exit: 1 });
    const checkSummary = verifyCheckSummary(result.checkReport);
    const exitCode = result.receipt.command.exitCode;

    if (flags.json) {
      this.log(stringifyVerifyReceipt(result.receipt));
      if (exitCode !== 0) this.exitWith(exitCode);
      return;
    }

    this.log(renderCheckReport(result.checkReport));
    if (!checkSummary.allowsAffectedExecution) this.exit(1);
    if (result.targetPlan.kind === "verify-target-plan-refused") {
      const message =
        result.targetPlan.refusal.kind === "graph-refusal"
          ? result.targetPlan.refusal.message
          : "Workspace graph refused verify target planning.";
      this.error(message, { exit: 1 });
    }

    this.log(`\nhabitat verify: running repo Nx affected (base=${result.base}) ...`);
    if (!result.affectedResult) {
      this.error("Habitat verify service did not return affected verification output.", {
        exit: 1,
      });
    }
    const affectedResult = result.affectedResult;
    process.stdout.write(affectedResult.stdout);
    process.stderr.write(affectedResult.stderr);
    this.exitWith(affectedResult.exitCode);
  }
}
