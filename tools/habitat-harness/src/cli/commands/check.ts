import { writeFileSync } from "node:fs";
import path from "node:path";
import { HabitatCommand } from "@internal/habitat-harness/cli/base/HabitatCommand";
import {
  renderCheckReport,
  stringifyCheckReport,
} from "@internal/habitat-harness/service/model/check/index";
import { Flags } from "@oclif/core";

export default class Check extends HabitatCommand {
  static override summary = "Run Habitat structural checks";
  static override description = "Runs the Habitat rule pack and emits normalized diagnostics.";
  static override examples = [
    "<%= config.bin %> <%= command.id %>",
    "<%= config.bin %> <%= command.id %> --json",
    "<%= config.bin %> <%= command.id %> --rule format-ci --json",
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
    "baseline-integrity": Flags.boolean({
      description: "Also check shrink-only baseline integrity against the selected base ref.",
    }),
    base: Flags.string({
      description: "Git base ref for baseline authoring or explicit baseline integrity comparison.",
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Check);
    const selection = { owner: flags.owner, rule: flags.rule, tool: flags.tool };
    const base = flags.base ?? "main";
    const context = await this.habitatServiceContext();
    const client = this.habitatServiceClientForContext(context);
    if (flags["expand-baseline"]) {
      const expansion = await client.check.expandBaseline({
        selectors: selection,
        base,
      });
      if (expansion.kind === "refused") this.error(expansion.message, { exit: 1 });
      for (const message of expansion.messages) this.log(message);
      return;
    }

    const baselineIntegrity = flags["baseline-integrity"] || Boolean(flags.base);
    const report = await client.check.report({
      selectors: selection,
      ...(baselineIntegrity ? { base } : {}),
      baselineIntegrity,
      staged: flags.staged,
    });
    const rendered = renderCheckReport(report, { json: flags.json });
    if (flags.output) {
      writeFileSync(
        path.resolve(context.deps.platform.repoRoot, flags.output),
        `${stringifyCheckReport(report)}\n`
      );
    }
    this.log(rendered);
    this.exitWith(report.ok ? 0 : 1);
  }
}
