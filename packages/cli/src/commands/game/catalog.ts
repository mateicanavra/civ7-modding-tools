import { Command, Flags } from "@oclif/core";
import {
  createStaticCiv7CapabilityCatalog,
  generateCiv7CapabilityCatalog,
} from "@civ7/direct-control";

export default class GameCatalog extends Command {
  static id = "game catalog";
  static summary = "Generate the Civ7 direct-control capability catalog";
  static description =
    "Prints the provenance-aware direct-control capability catalog from static wrappers and, by default, the live runtime.";

  static examples = [
    "<%= config.bin %> game catalog --json",
    "<%= config.bin %> game catalog --static --json",
  ];

  static flags = {
    host: Flags.string({
      description: "Civ7 tuner socket host",
    }),
    port: Flags.integer({
      description: "Civ7 tuner socket port",
    }),
    static: Flags.boolean({
      description: "Emit only the static package-owned catalog",
      default: false,
    }),
    "timeout-ms": Flags.integer({
      description: "Socket timeout",
      default: 45_000,
    }),
    json: Flags.boolean({
      description: "Emit machine-readable JSON",
      default: false,
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(GameCatalog);
    const catalog = flags.static
      ? createStaticCiv7CapabilityCatalog()
      : await generateCiv7CapabilityCatalog({
          host: flags.host,
          port: flags.port,
          timeoutMs: flags["timeout-ms"],
        });

    if (flags.json) {
      this.log(JSON.stringify({ ok: true, catalog }));
      return;
    }

    for (const entry of catalog.entries) {
      this.log(`${entry.id}\t${entry.kind}\t${entry.role}\t${entry.risk}`);
    }
  }
}
