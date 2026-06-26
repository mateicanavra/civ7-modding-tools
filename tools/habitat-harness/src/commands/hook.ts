import { Args, Flags } from "@oclif/core";
import { HabitatCommand } from "../base/HabitatCommand.js";
import { runHook } from "../lib/hooks.js";

export default class Hook extends HabitatCommand {
  static override summary = "Run a Habitat git-hook entrypoint";
  static override description =
    "Stable Habitat entrypoint for Husky-delegated pre-commit and pre-push checks.";
  static override examples = ["<%= config.bin %> <%= command.id %> pre-commit"];

  static override args = {
    name: Args.string({ required: false, description: "Hook name, such as pre-commit." }),
  };

  static override flags = {
    base: Flags.string({
      description: "Override the pre-push affected base.",
    }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Hook);
    const result = runHook(args.name, { base: flags.base });
    process.stdout.write(result.stdout);
    process.stderr.write(result.stderr);
    this.exitWith(result.exitCode);
  }
}
