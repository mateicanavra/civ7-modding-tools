import { Flags } from "@oclif/core";
import { HabitatCommand } from "../base/HabitatCommand.js";
import {
  createCheckReport,
  renderCheckReport,
  resolveVerifyBase,
  runAffectedVerification,
} from "../lib/command-engine.js";

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
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Verify);
    const base = resolveVerifyBase(flags.base);
    const report = createCheckReport({ base, commandArgs: this.rawArgv() });
    this.log(renderCheckReport(report));
    if (!report.ok) this.exit(1);

    this.log(`\nhabitat verify: running repo Nx affected (base=${base}) ...`);
    const result = runAffectedVerification(base);
    process.stdout.write(result.stdout);
    process.stderr.write(result.stderr);
    this.exitWith(result.exitCode);
  }
}
