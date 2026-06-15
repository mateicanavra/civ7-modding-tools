import { Command, Flags } from "@oclif/core";
import { readCiv7World } from "../../../utils/game-map-shared";

// Thin delegation over the same world.current service call as the
// `game map` topic index (`game map --summary`); D2 in
// docs/projects/cli-command-taxonomy/workstream-record.md.

export default class GameMapSummary extends Command {
  static id = "game map summary";
  static summary = "Read the Civ7 current world summary";
  static description =
    "Reads the service-owned current world summary through control-oRPC. " +
    "Focused subcommand form of `game map --summary`.";

  static examples = [
    "<%= config.bin %> game map summary",
    "<%= config.bin %> game map summary --json",
  ];

  static flags = {
    host: Flags.string({
      description: "Civ7 tuner socket host",
    }),
    port: Flags.integer({
      description: "Civ7 tuner socket port",
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
    const { flags } = await this.parse(GameMapSummary);
    const result = await readCiv7World(
      { mode: "summary" },
      {
        host: flags.host,
        port: flags.port,
        timeoutMs: flags["timeout-ms"],
      }
    );

    if (flags.json) {
      this.log(JSON.stringify({ ok: true, result }));
      return;
    }

    this.log(JSON.stringify(result, null, 2));
  }
}
