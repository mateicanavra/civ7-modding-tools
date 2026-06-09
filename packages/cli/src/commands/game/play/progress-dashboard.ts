import { Command, Flags } from '@oclif/core';
import {
  createCiv7ControlOrpcServerClient,
  type Civ7ProgressionDashboardResult,
} from '@civ7/control-orpc';
import { liveCiv7ControlOrpcDirectControlFacade } from '@civ7/control-orpc/runtime';
import { buildDirectControlOptions } from '../../../utils/game-play-shared';

type Probe<T = unknown> = { ok: true; value: T } | { ok: false; error: string };

export default class GamePlayProgressDashboard extends Command {
  static id = 'game play progress-dashboard';
  static summary = 'Read local victory, legacy, age, and reward progress';
  static description =
    'Returns a read-only progress dashboard using official runtime legacy path, milestone, victory, triumph, and age-progress APIs exposed to App UI.';

  static examples = [
    '<%= config.bin %> game play progress-dashboard --json',
    '<%= config.bin %> game play progress-dashboard --compact --json',
    '<%= config.bin %> game play progress-dashboard --player-id 0 --json',
  ];

  static flags = {
    host: Flags.string({
      description: 'Civ7 tuner socket host',
    }),
    port: Flags.integer({
      description: 'Civ7 tuner socket port',
    }),
    'player-id': Flags.integer({
      description: 'Player id to inspect. Defaults to GameContext.localPlayerID.',
    }),
    'timeout-ms': Flags.integer({
      description: 'Socket timeout',
      default: 45_000,
    }),
    compact: Flags.boolean({
      description: 'In JSON mode, emit a summary-first progress envelope instead of the full dashboard payload',
      default: false,
    }),
    json: Flags.boolean({
      description: 'Emit machine-readable JSON',
      default: false,
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(GamePlayProgressDashboard);
    const view = await createCiv7ControlOrpcServerClient({
      directControl: liveCiv7ControlOrpcDirectControlFacade,
      endpointDefaults: buildDirectControlOptions(flags),
    }).progression.dashboard.current({
      playerId: flags['player-id'],
    });

    if (flags.json) {
      this.log(JSON.stringify(flags.compact ? buildCompactView(view) : { ok: true, view }));
      return;
    }

    this.log(view.summary.headline);
    for (const path of view.legacyPaths) {
      this.log(`- ${path.classType}: ${path.score}/${path.finalRequiredPathPoints ?? '?'} ${path.legacyPathType}`);
      if (path.nextMilestone) this.log(`  next: ${path.nextMilestone}`);
    }
  }
}

function buildCompactView(view: Civ7ProgressionDashboardResult): {
  ok: true;
  contractVersion: 'play-agent-v0';
  command: 'game play progress-dashboard';
  summary: string;
  turn: Probe;
  turnDate: Probe;
  age: Civ7ProgressionDashboardResult['age'];
  player: Civ7ProgressionDashboardResult['player'];
  legacyPaths: Civ7ProgressionDashboardResult['legacyPaths'];
  victories: Civ7ProgressionDashboardResult['victories'];
  triumphs: Civ7ProgressionDashboardResult['triumphs'];
  next: string | null;
  nextSteps: Civ7ProgressionDashboardResult['nextSteps'];
  warnings: string[];
  omitted: Array<{ path: string; reason: string }>;
  hiddenInfoPolicy: Civ7ProgressionDashboardResult['hiddenInfoPolicy'];
  proof: Civ7ProgressionDashboardResult['proof'];
} {
  return {
    ok: true,
    contractVersion: 'play-agent-v0',
    command: 'game play progress-dashboard',
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
    next: cliCommandForNextStep(view.nextSteps[0]?.kind ?? null),
    nextSteps: view.nextSteps,
    warnings: view.warnings,
    omitted: view.omitted,
    hiddenInfoPolicy: view.hiddenInfoPolicy,
    proof: view.proof,
  };
}

function cliCommandForNextStep(
  kind: Civ7ProgressionDashboardResult['nextSteps'][number]['kind'] | null,
): string | null {
  if (kind === 'read-attention-priorities') {
    return 'game play priorities --compact --json';
  }
  return null;
}
