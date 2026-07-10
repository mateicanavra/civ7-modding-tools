import { HabitatCommand } from "@habitat/cli/cli/base/HabitatCommand";
import { Flags } from "@oclif/core";

export default class Fix extends HabitatCommand {
  static override summary = "Inspect admitted Habitat fix diagnostics without writing";
  static override description =
    "Use --dry-run to run admitted Grit diagnostics without writing. Without --dry-run, this command refuses because live mutation is not implemented.";
  static override examples = ["<%= config.bin %> <%= command.id %> --dry-run"];

  static override flags = {
    "dry-run": Flags.boolean({ description: "Run admitted Grit diagnostics without writing." }),
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
