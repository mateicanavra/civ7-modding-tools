import { HabitatCommand } from "@habitat/cli/cli/base/HabitatCommand";
import { Args, Flags } from "@oclif/core";

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
    const result = await this.runHookAction(args.name, flags.base);
    process.stdout.write(result.stdout);
    process.stderr.write(result.stderr);
    this.exitWith(result.exitCode);
  }

  private async runHookAction(name: string | undefined, base: string | undefined) {
    if (name === "pre-commit") {
      const client = await this.habitatServiceClient();
      return client.hook.preCommit({}, this.habitatServiceCallerOptions());
    }
    if (name === "pre-push") {
      const client = await this.habitatServiceClient();
      return client.hook.prePush({ base }, this.habitatServiceCallerOptions());
    }
    return unknownHookResult(name);
  }
}

function unknownHookResult(name: string | undefined) {
  return {
    exitCode: 2,
    stdout: "",
    stderr: `Unknown Habitat hook '${name ?? "(missing)"}'. Expected pre-commit or pre-push.\n`,
  };
}
