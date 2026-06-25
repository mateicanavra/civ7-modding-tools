import { writeFileSync } from "node:fs";
import path from "node:path";
import { HabitatCommand } from "@habitat/cli/cli/base/HabitatCommand";
import {
  checkCommandContext,
  renderCheckReport,
  stringifyCheckReport,
} from "@habitat/cli/service/model/check/index";
import { Flags } from "@oclif/core";

export default class Check extends HabitatCommand {
  static override summary = "Run Habitat structural checks";
  static override description = "Runs the Habitat rule pack and emits normalized diagnostics.";
  static override examples = [
    "<%= config.bin %> <%= command.id %>",
    "<%= config.bin %> <%= command.id %> --json",
    "<%= config.bin %> <%= command.id %> --rule format-ci --json",
    "<%= config.bin %> <%= command.id %> --rule op-calls-op --rule standard-stage-topology",
  ];

  static override flags = {
    json: Flags.boolean({ description: "Emit normalized CheckReport JSON." }),
    output: Flags.string({ description: "Write the normalized CheckReport JSON to a file." }),
    owner: Flags.string({ description: "Run only rules owned by this workspace project." }),
    rule: Flags.string({
      description: "Run only the requested Habitat rule id. Repeat to run a curated rule group.",
      multiple: true,
    }),
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
    const requestedRules = Array.isArray(flags.rule) ? flags.rule : flags.rule ? [flags.rule] : [];
    const selection = {
      owner: flags.owner,
      ...(requestedRules.length === 1 ? { rule: requestedRules[0] } : {}),
      ...(requestedRules.length > 1 ? { rules: requestedRules } : {}),
      tool: flags.tool,
    };
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
      command: checkCommandContext(this.rawArgv()),
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
