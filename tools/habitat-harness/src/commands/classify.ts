import { Args } from "@oclif/core";
import { HabitatCommand } from "../base/HabitatCommand.js";
import { classifyTarget } from "../lib/classify.js";

export default class Classify extends HabitatCommand {
  static override summary = "Classify a repo path into Habitat project ownership";
  static override description =
    "Reports the owning workspace project, tags, in-scope Habitat rules, and expected verification targets.";
  static override examples = ["<%= config.bin %> <%= command.id %> tools/habitat-harness/src"];

  static override args = {
    path: Args.string({
      required: true,
      description:
        "Repo-relative path, absolute path, literal diff, or .diff/.patch file to classify.",
    }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(Classify);
    this.log(JSON.stringify(await classifyTarget(args.path), null, 2));
  }
}
