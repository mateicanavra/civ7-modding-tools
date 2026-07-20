import { HabitatCommand } from "@habitat/cli/cli/base/HabitatCommand";
import { Flags } from "@oclif/core";

export default class Fix extends HabitatCommand {
  static override summary = "Preview admitted Habitat rule fixes without writing";
  static override description =
    "Use --dry-run to inspect transformations admitted by registered rule authority. Without --dry-run, this command refuses because live mutation is not implemented.";
  static override examples = [
    "<%= config.bin %> <%= command.id %> --dry-run",
    "<%= config.bin %> <%= command.id %> --dry-run --rule example-rule --rule another-rule",
  ];

  static override flags = {
    "dry-run": Flags.boolean({ description: "Preview admitted transformations without writing." }),
    rule: Flags.string({
      description: "Preview one registered rule; repeat to select multiple rules.",
      multiple: true,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Fix);
    if (!flags["dry-run"]) {
      process.stderr.write(
        "habitat fix refused: unsupported-live-mutation\nLive mutation is not implemented. Use --dry-run to inspect admitted transformations.\n"
      );
      this.exitWith(1);
      return;
    }
    const client = await this.habitatServiceClient();
    const result = await client.fix.previewPatterns(
      flags.rule && flags.rule.length > 0 ? { rules: flags.rule } : {}
    );
    process.stdout.write(result.stdout);
    process.stderr.write(result.stderr);
    this.exitWith(result.exitCode);
  }
}
