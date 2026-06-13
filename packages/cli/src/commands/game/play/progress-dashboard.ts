import { Command, Flags } from "@oclif/core";
import { createCiv7ControlOrpcServerClient } from "@civ7/control-orpc";
import { liveCiv7ControlOrpcDirectControlFacade } from "@civ7/control-orpc/runtime";
import { buildDirectControlOptions } from "../../../utils/game-play-shared";

type Probe<T = unknown> = { ok: true; value: T } | { ok: false; error: string };
type ProgressDashboardServiceResult = Awaited<
  ReturnType<
    ReturnType<typeof createCiv7ControlOrpcServerClient>["progression"]["dashboard"]["current"]
  >
>;

export default class GamePlayProgressDashboard extends Command {
  static id = "game play progress-dashboard";
  static summary = "Read local victory, legacy, age, and reward progress";
  static description =
    "Returns a read-only progress dashboard using official runtime legacy path, milestone, victory, triumph, and age-progress APIs exposed to App UI.";

  static examples = [
    "<%= config.bin %> game play progress-dashboard --json",
    "<%= config.bin %> game play progress-dashboard --compact --json",
    "<%= config.bin %> game play progress-dashboard --player-id 0 --json",
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
    "timeout-ms": Flags.integer({
      description: "Socket timeout",
      default: 45_000,
    }),
    compact: Flags.boolean({
      description:
        "In JSON mode, emit a summary-first progress envelope instead of the full dashboard payload",
      default: false,
    }),
    json: Flags.boolean({
      description: "Emit machine-readable JSON",
      default: false,
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(GamePlayProgressDashboard);
    const view = await createCiv7ControlOrpcServerClient({
      directControl: liveCiv7ControlOrpcDirectControlFacade,
      endpointDefaults: buildDirectControlOptions(flags),
    }).progression.dashboard.current({
      playerId: flags["player-id"],
    });

    if (flags.json) {
      this.log(JSON.stringify(flags.compact ? buildCompactView(view) : { ok: true, view }));
      return;
    }

    this.log(view.summary.headline);
    for (const path of view.legacyPaths) {
      this.log(
        `- ${path.classType}: ${path.score}/${path.finalRequiredPathPoints ?? "?"} ${path.legacyPathType}`
      );
      if (path.nextMilestone) this.log(`  next: ${path.nextMilestone}`);
    }
  }
}

function buildCompactView(view: ProgressDashboardServiceResult): {
  ok: true;
  contractVersion: "play-agent-v0";
  surface: "progress-dashboard";
  summary: string;
  turn: Probe;
  turnDate: Probe;
  age: ProgressDashboardServiceResult["age"];
  player: ProgressDashboardServiceResult["player"];
  legacyPaths: ProgressDashboardServiceResult["legacyPaths"];
  victories: ProgressDashboardServiceResult["victories"];
  triumphs: ProgressDashboardServiceResult["triumphs"];
  nextAction: ProgressDashboardServiceResult["nextSteps"][number] | null;
  nextSteps: ProgressDashboardServiceResult["nextSteps"];
  warnings: string[];
  omitted: Array<{ path: string; reason: string }>;
  hiddenInfoPolicy: ProgressDashboardServiceResult["hiddenInfoPolicy"];
  proof: ProgressDashboardServiceResult["proof"];
} {
  return {
    ok: true,
    contractVersion: "play-agent-v0",
    surface: "progress-dashboard",
    summary: view.summary.headline,
    turn: view.turn,
    turnDate: view.turnDate,
    age: view.age,
    player: view.player,
    legacyPaths: view.legacyPaths,
    victories: view.victories,
    triumphs: {
      count: view.triumphs.count,
      source: view.triumphs.source,
      rows: view.triumphs.rows,
    },
    nextAction: view.nextSteps[0] ?? null,
    nextSteps: view.nextSteps,
    warnings: view.warnings,
    omitted: view.omitted,
    hiddenInfoPolicy: view.hiddenInfoPolicy,
    proof: view.proof,
  };
}
