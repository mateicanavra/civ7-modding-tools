import { listSubtreeConfigs } from "@civ7/plugin-git";
import { Command, Flags } from "@oclif/core";

export default abstract class SubtreeListConfigBase extends Command {
  static enableJsonFlag = true;

  static flags = {
    verbose: Flags.boolean({
      description: "Show underlying git commands",
      default: false,
      char: "v",
    }),
  } as const;

  protected abstract domain: string;

  async run() {
    const ctor: any = this.constructor;
    const { flags } = await this.parse({
      flags: ctor.flags ?? (this as any).flags ?? SubtreeListConfigBase.flags,
    });
    const configs = await listSubtreeConfigs(this.domain, { verbose: flags.verbose });
    if (this.jsonEnabled()) {
      return configs;
    }
    if (configs.length === 0) {
      this.log("No stored config entries.");
      return;
    }
    for (const cfg of configs) {
      this.log(`${cfg.slug}: ${cfg.repoUrl ?? "(no repoUrl)"} branch=${cfg.branch ?? "(none)"}`);
    }
  }
}
