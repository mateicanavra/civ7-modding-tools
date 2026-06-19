import { Flags } from "@oclif/core";
import { HabitatCommand } from "../base/HabitatCommand.js";
import {
  createCheckReport,
  describeRuleSelectionFailure,
  expandBaselines,
  renderCheckReport,
} from "../lib/check-report.js";

export default class Check extends HabitatCommand {
  static override summary = "Run Habitat structural checks";
  static override description =
    "Runs the Habitat rule pack with shrink-only baseline integrity and normalized diagnostics.";
  static override examples = [
    "<%= config.bin %> <%= command.id %>",
    "<%= config.bin %> <%= command.id %> --json",
    "<%= config.bin %> <%= command.id %> --rule biome-ci --json",
  ];

  static override flags = {
    json: Flags.boolean({ description: "Emit normalized CheckReport JSON." }),
    output: Flags.string({ description: "Write the normalized CheckReport JSON to a file." }),
    owner: Flags.string({ description: "Run only rules owned by this workspace project." }),
    rule: Flags.string({ description: "Run only one Habitat rule by id." }),
    tool: Flags.string({ description: "Run only rules owned by this enforcement tool." }),
    staged: Flags.boolean({ description: "Check staged file-layer protected zones." }),
    "expand-baseline": Flags.boolean({
      description: "Authoring-only: write current uncovered errors into selected rule baselines.",
    }),
    base: Flags.string({
      description: "Git base ref for shrink-only baseline integrity comparison.",
      default: "main",
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Check);
    const selection = { owner: flags.owner, rule: flags.rule, tool: flags.tool };
    if (flags["expand-baseline"]) {
      const expansion = await expandBaselines(selection, { base: flags.base });
      if (!expansion.ok) this.error(describeRuleSelectionFailure(expansion), { exit: 1 });
      for (const message of expansion.messages) this.log(message);
      return;
    }

    const report = await createCheckReport({
      ...selection,
      base: flags.base,
      commandArgs: this.rawArgv(),
      staged: flags.staged,
    });
    this.log(renderCheckReport(report, { json: flags.json, output: flags.output }));
    this.exitWith(report.ok ? 0 : 1);
  }
}
