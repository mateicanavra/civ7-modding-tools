import { getCiv7SettlementRecommendations } from "@civ7/direct-control";
import { Command, Flags } from "@oclif/core";
import { buildDirectControlOptions } from "../../../utils/game-play-shared";

export default class GamePlaySettlementRecommendations extends Command {
  static id = "game play settlement-recommendations";
  static summary = "Read official settlement recommendation hints";
  static description =
    "Returns a read-only view of the local player AI settlement recommendations from the official settlement lens API.";

  static examples = [
    "<%= config.bin %> game play settlement-recommendations --json",
    "<%= config.bin %> game play settlement-recommendations --x 15 --y 23 --count 5 --json",
  ];

  static flags = {
    host: Flags.string({
      description: "Civ7 tuner socket host",
    }),
    port: Flags.integer({
      description: "Civ7 tuner socket port",
    }),
    "player-id": Flags.integer({
      description: "Player id to inspect. Defaults to GameContext.localPlayerID.",
    }),
    x: Flags.integer({
      description: "Optional Settler or formation origin x coordinate",
      dependsOn: ["y"],
    }),
    y: Flags.integer({
      description: "Optional Settler or formation origin y coordinate",
      dependsOn: ["x"],
    }),
    count: Flags.integer({
      description: "Maximum recommendation count per origin",
      default: 5,
    }),
    "include-settlers": Flags.boolean({
      description: "When no x/y is provided, include live Settler origins",
      default: true,
      allowNo: true,
    }),
    "include-cities": Flags.boolean({
      description: "When no x/y is provided, include live city origins",
      default: true,
      allowNo: true,
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
    const { flags } = await this.parse(GamePlaySettlementRecommendations);
    const locations =
      flags.x === undefined || flags.y === undefined ? undefined : [{ x: flags.x, y: flags.y }];
    const view = await getCiv7SettlementRecommendations(
      {
        playerId: flags["player-id"],
        locations,
        count: flags.count,
        includeSettlers: flags["include-settlers"],
        includeCities: flags["include-cities"],
      },
      buildDirectControlOptions(flags)
    );

    if (flags.json) {
      this.log(JSON.stringify({ ok: true, view }));
      return;
    }

    this.log(`Player: ${view.playerId}; count: ${view.count}`);
    for (const recommendation of view.recommendations) {
      this.log(
        `Origin: ${recommendation.origin.kind} ${formatValue(recommendation.origin.location)}`
      );
      this.log(`Suggestions: ${formatProbe(recommendation.suggestions)}`);
    }
    for (const note of view.notes) this.log(`Note: ${note}`);
  }
}

function formatProbe<T>(probe: { ok: true; value: T } | { ok: false; error: string }): string {
  if (!probe.ok) return `<error: ${probe.error}>`;
  return formatValue(probe.value);
}

function formatValue(value: unknown): string {
  return typeof value === "object" ? JSON.stringify(value) : String(value);
}
