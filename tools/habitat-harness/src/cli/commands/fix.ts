import { HabitatCommand } from "@internal/habitat-harness/cli/base/HabitatCommand";
import { createHabitatServiceClient } from "@internal/habitat-harness/service/router";
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
    const client = createHabitatServiceClient();
    const result = await client.fix.run({
      kind: flags["dry-run"] ? "dry-run-intent" : "live-write-intent",
    });
    process.stdout.write(result.stdout);
    process.stderr.write(result.stderr);
    this.exitWith(result.exitCode);
  }
}
