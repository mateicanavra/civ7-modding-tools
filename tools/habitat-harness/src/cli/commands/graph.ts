import { HabitatCommand } from "@internal/habitat-harness/cli/base/HabitatCommand";
import { Flags } from "@oclif/core";

export default class Graph extends HabitatCommand {
  static override summary = "Emit the current Nx project graph";
  static override description =
    "Runs the repo Nx graph command and prints the machine-readable graph JSON.";
  static override examples = ["<%= config.bin %> <%= command.id %> --json"];

  static override flags = {
    json: Flags.boolean({ description: "Emit compact JSON." }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Graph);
    const client = await this.habitatServiceClient();
    const result = await client.graph.workspaceGraph({});
    if (result.kind === "command-failed") {
      process.stdout.write(result.stdout);
      process.stderr.write(result.stderr);
      this.exitWith(result.exitCode);
      return;
    }
    process.stdout.write(`${JSON.stringify(result.graph, null, flags.json ? 0 : 2)}\n`);
  }
}
