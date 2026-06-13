import { Args } from "@oclif/core";
import { HabitatCommand } from "../base/HabitatCommand.js";
import { hookMessage } from "../lib/command-engine.js";

export default class Hook extends HabitatCommand {
  static override summary = "Run a Habitat git-hook entrypoint";
  static override description =
    "Stable hook surface for H7. Hook wiring is intentionally deferred until habitat-git-hooks.";
  static override examples = ["<%= config.bin %> <%= command.id %> pre-commit"];

  static override args = {
    name: Args.string({ required: false, description: "Hook name, such as pre-commit." }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(Hook);
    this.log(hookMessage(args.name));
  }
}
