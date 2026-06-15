import { Args, Command, Flags } from "@oclif/core";
import {
  parseWorldBounds,
  parseWorldPlotFields,
  readCiv7World,
} from "../../../utils/game-map-shared";

// Thin delegation over the same world.grid service call as the
// `game map` topic index (`game map --bounds x,y,w,h`); D2 in
// docs/projects/cli-command-taxonomy/workstream-record.md.

export default class GameMapGrid extends Command {
  static id = "game map grid";
  static summary = "Read a bounded Civ7 plot grid";
  static description =
    "Reads a service-owned bounded grid view through control-oRPC. " +
    "Focused subcommand form of `game map --bounds x,y,width,height`.";

  static examples = [
    "<%= config.bin %> game map grid 0,0,16,16 --fields terrain,biome --json",
    "<%= config.bin %> game map grid 0,0,8,8 --player-id 0 --max-plots 32 --json",
  ];

  static args = {
    bounds: Args.string({
      description: "Grid bounds as x,y,width,height",
      required: true,
    }),
  } as const;

  static flags = {
    host: Flags.string({
      description: "Civ7 tuner socket host",
    }),
    port: Flags.integer({
      description: "Civ7 tuner socket port",
    }),
    fields: Flags.string({
      description: "Comma-separated plot fields",
    }),
    "player-id": Flags.integer({
      description: "Player id for visibility-scoped reads",
    }),
    "include-hidden": Flags.boolean({
      description: "Include hidden plot facts for developer diagnostics",
      default: false,
    }),
    "max-plots": Flags.integer({
      description: "Maximum plots for grid reads",
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
    const { args, flags } = await this.parse(GameMapGrid);
    const result = await readCiv7World(
      {
        mode: "grid",
        bounds: parseWorldBounds(args.bounds),
        fields: parseWorldPlotFields(flags.fields),
        playerId: flags["player-id"],
        includeHidden: flags["include-hidden"],
        maxPlots: flags["max-plots"],
      },
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
