import { HabitatCommand } from "@internal/habitat-harness/cli/base/HabitatCommand";
import { stringifyClassifyResult } from "@internal/habitat-harness/service/model/workspace/dto/classify.schema";
import { habitatServiceRouter } from "@internal/habitat-harness/service/router";
import { Args } from "@oclif/core";
import { createRouterClient } from "@orpc/server";

export default class Classify extends HabitatCommand {
  static override summary = "Classify a repo path or diff into Habitat orientation";
  static override description =
    "Reports owner state, rule routing facts, graph-backed target guidance, and recovery instructions.";
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
    const client = createRouterClient(habitatServiceRouter, { context: {} });
    this.log(stringifyClassifyResult(await client.classify.run({ target: args.path })));
  }
}
