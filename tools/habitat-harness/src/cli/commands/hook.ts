import { HabitatCommand } from "@internal/habitat-harness/cli/base/HabitatCommand";
import { habitatServiceRouter } from "@internal/habitat-harness/service/router";
import { Args, Flags } from "@oclif/core";
import { createRouterClient } from "@orpc/server";

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
    const client = createRouterClient(habitatServiceRouter, { context: {} });
    const result = await client.hook.run({ name: args.name, base: flags.base });
    process.stdout.write(result.stdout);
    process.stderr.write(result.stderr);
    this.exitWith(result.exitCode);
  }
}
