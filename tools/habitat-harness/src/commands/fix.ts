import { Flags } from "@oclif/core";
import { HabitatCommand } from "../base/HabitatCommand.js";
import { runFix } from "../lib/command-engine.js";

export default class Fix extends HabitatCommand {
  static override summary = "Apply Habitat-owned safe fixes";
  static override description =
    "Runs Biome as the hygiene owner. With --dry-run, reports drift without writing.";
  static override examples = [
    "<%= config.bin %> <%= command.id %> --dry-run",
    "<%= config.bin %> <%= command.id %>",
  ];

  static override flags = {
    "dry-run": Flags.boolean({ description: "Report hygiene drift without writing changes." }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Fix);
    const result = runFix({ dryRun: flags["dry-run"] });
    process.stdout.write(result.stdout);
    process.stderr.write(result.stderr);
    this.exitWith(result.exitCode);
  }
}
