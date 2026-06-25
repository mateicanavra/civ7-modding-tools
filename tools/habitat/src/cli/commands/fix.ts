import { HabitatCommand } from "@habitat/cli/cli/base/HabitatCommand";
import { Flags } from "@oclif/core";

export default class Fix extends HabitatCommand {
  static override summary = "Apply Habitat-owned safe fixes";
  static override description =
    "Runs Habitat pattern applys. With --dry-run, plans without writing.";
  static override examples = [
    "<%= config.bin %> <%= command.id %> --dry-run",
    "<%= config.bin %> <%= command.id %>",
  ];

  static override flags = {
    "dry-run": Flags.boolean({ description: "Plan the pattern apply without writing." }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Fix);
    const client = await this.habitatServiceClient();
    const result = flags["dry-run"]
      ? await client.fix.planPatterns({})
      : await client.fix.applyPatterns({});
    process.stdout.write(result.stdout);
    process.stderr.write(result.stderr);
    this.exitWith(result.exitCode);
  }
}
