import { readCiv7StartPositions } from "@civ7/direct-control";
import { Command, Flags } from "@oclif/core";

export default class GameMapStarts extends Command {
  static id = "game map starts";
  static summary = "Read founder-unit-derived start positions for alive major players";
  static description =
    "Reads per-player start positions through @civ7/direct-control in one tuner exec. " +
    "The engine exposes no start-plot getter on the player prototype, so the founder unit's " +
    "current location stands in for the start plot — valid only before units move (turn 1 in " +
    "practice). The current game turn is always reported so the readback can be judged.";

  static examples = [
    "<%= config.bin %> game map starts",
    "<%= config.bin %> game map starts --json",
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
    const { flags } = await this.parse(GameMapStarts);
    const result = await readCiv7StartPositions({
      host: flags.host,
      port: flags.port,
      timeoutMs: flags["timeout-ms"],
    });

    if (flags.json) {
      this.log(JSON.stringify({ ok: true, result }));
      return;
    }

    const turn = result.turn.ok ? result.turn.value : null;
    this.log(`method: ${result.method} (turn ${turn ?? "unknown"})`);
    if (!result.players.ok) {
      this.error(`start-position read failed: ${result.players.error}`);
    }
    this.log("player  human  plot      units");
    for (const player of result.players.value) {
      const plot = player.firstUnitPlot
        ? `${player.firstUnitPlot.x},${player.firstUnitPlot.y}`
        : "-";
      this.log(
        `${String(player.id).padEnd(6)}  ${(player.isHuman ? "yes" : "no").padEnd(5)}  ${plot.padEnd(8)}  ${player.unitCount}`
      );
    }
    if (turn === null || turn > 1) {
      this.log(
        "caveat: founder-unit-derived plots equal start plots only before units move; " +
          `turn is ${turn ?? "unknown"}, so treat plots as current unit positions, not proven starts.`
      );
    }
  }
}
