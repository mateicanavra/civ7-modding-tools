import { Flags } from "@oclif/core";
import { HabitatCommand } from "../base/HabitatCommand.js";
import { runFix } from "../lib/fix.js";

export default class Fix extends HabitatCommand {
  static override summary = "Apply Habitat-owned safe fixes";
  static override description =
    "Runs D9-governed transformation transactions. With --dry-run, plans without writing.";
  static override examples = [
    "<%= config.bin %> <%= command.id %> --dry-run",
    "<%= config.bin %> <%= command.id %>",
  ];

  static override flags = {
    "dry-run": Flags.boolean({ description: "Plan the transformation transaction without writing." }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Fix);
    const result = await runFix({
      kind: flags["dry-run"] ? "dry-run-intent" : "live-write-intent",
    });
    process.stdout.write(result.stdout);
    process.stderr.write(result.stderr);
    this.exitWith(result.exitCode);
  }
}
