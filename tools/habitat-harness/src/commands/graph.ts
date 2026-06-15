import { Flags } from "@oclif/core";
import { HabitatCommand } from "../base/HabitatCommand.js";
import { runGraph } from "../lib/command-engine.js";

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
    const result = runGraph({ json: flags.json });
    process.stdout.write(result.stdout);
    process.stderr.write(result.stderr);
    this.exitWith(result.exitCode);
  }
}
