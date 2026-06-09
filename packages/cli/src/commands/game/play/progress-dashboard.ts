import { Command, Flags } from '@oclif/core';
import { getCiv7ProgressDashboard } from '@civ7/direct-control';
import { buildDirectControlOptions } from '../../../utils/game-play-shared';

type Probe<T = unknown> = { ok: true; value: T } | { ok: false; error: string };
type ProgressDashboardView = Awaited<ReturnType<typeof getCiv7ProgressDashboard>>;

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
    const view = await getCiv7ProgressDashboard({
      playerId: flags['player-id'],
    }, buildDirectControlOptions(flags));

    if (flags.json) {
      this.log(JSON.stringify(flags.compact ? buildCompactView(view) : { ok: true, view }));
      return;
    }

    this.log(buildSummary(view));
    for (const path of compactLegacyPaths(view)) {
      this.log(`- ${path.classType}: ${path.score}/${path.finalRequiredPathPoints ?? '?'} ${path.legacyPathType}`);
      if (path.nextMilestone) this.log(`  next: ${path.nextMilestone}`);
    }
  }
}

function buildCompactView(view: ProgressDashboardView): {
  ok: true;
  contractVersion: 'play-agent-v0';
  command: 'game play progress-dashboard';
  summary: string;
  turn: Probe;
  turnDate: Probe;
  age: Record<string, unknown>;
  player: Record<string, unknown>;
  legacyPaths: ReturnType<typeof compactLegacyPaths>;
  victories: Record<string, unknown>;
  triumphs: Record<string, unknown>;
  next: string | null;
  warnings: string[];
  omitted: Array<{ path: string; reason: string }>;
  hiddenInfoPolicy: ProgressDashboardView['hiddenInfoPolicy'];
  proof: ProgressDashboardView['proof'];
} {
  const legacyPaths = compactLegacyPaths(view);
  const warnings = [
    probeValue(view.proof.victoryManagerGlobal) === 'undefined'
      ? 'VictoryManager is module-local in the official UI; this command uses exposed lower-level legacy and age-progress APIs.'
      : null,
    view.triumphs.count === 0
      ? 'Runtime GameInfo.Triumphs returned no rows; do not infer that all reward systems are absent.'
      : null,
  ].filter((warning): warning is string => Boolean(warning));

  return {
    ok: true,
    contractVersion: 'play-agent-v0',
    command: 'game play progress-dashboard',
    summary: buildSummary(view),
    turn: view.turn,
    turnDate: view.turnDate,
    age: {
      ageType: view.age.ageType,
      name: view.age.name,
      chronologyIndex: view.age.chronologyIndex,
      currentAgeProgressionPoints: view.age.currentAgeProgressionPoints,
      maxAgeProgressionPoints: view.age.maxAgeProgressionPoints,
      ageProgressPercent: ratioPercent(
        probeValue(view.age.currentAgeProgressionPoints),
        probeValue(view.age.maxAgeProgressionPoints),
      ),
      isFinalAge: view.age.isFinalAge,
      isAgeOver: view.age.isAgeOver,
    },
    player: {
      playerId: view.playerId,
      team: view.player.team,
      historicalLegacyPointCountForTeam: view.player.historicalLegacyPointCountForTeam,
    },
    legacyPaths,
    victories: {
      rowCount: view.victories.rows.length,
      classes: uniqueStrings(view.victories.rows.map((row) => stringField(row, 'victoryClassType'))),
    },
    triumphs: {
      count: view.triumphs.count,
      source: view.triumphs.source,
      rows: view.triumphs.rows.slice(0, 8),
    },
    next: 'game play priorities --compact --json',
    warnings,
    omitted: [
      { path: 'view.legacyPaths[].milestones', reason: 'use --json without --compact for all milestone probe details' },
      { path: 'view.victories.rows', reason: 'use --json without --compact for victory row details' },
      { path: 'view.triumphs.rows', reason: 'compact output includes only the first 8 triumph rows' },
    ],
    hiddenInfoPolicy: view.hiddenInfoPolicy,
    proof: view.proof,
  };
}

function compactLegacyPaths(view: ProgressDashboardView): Array<{
  legacyPathType: string | null;
  classType: string | null;
  name: string | null;
  score: number | null;
  finalRequiredPathPoints: number | null;
  progressPercent: number | null;
  nextMilestone: string | null;
  enabledForPlayer: boolean | null;
}> {
  return view.legacyPaths.map((path) => {
    const score = probeValue(path.score);
    const nextMilestone = path.nextMilestone && typeof path.nextMilestone === 'object'
      ? path.nextMilestone as Record<string, unknown>
      : null;
    return {
      legacyPathType: path.legacyPathType,
      classType: shortClass(path.legacyPathClassType),
      name: path.name,
      score: typeof score === 'number' ? score : null,
      finalRequiredPathPoints: path.finalRequiredPathPoints,
      progressPercent: ratioPercent(score, path.finalRequiredPathPoints),
      nextMilestone: typeof nextMilestone?.ageProgressionMilestoneType === 'string'
        ? `${nextMilestone.ageProgressionMilestoneType} at ${nextMilestone.requiredPathPoints ?? '?'}`
        : null,
      enabledForPlayer: path.enabledForPlayer,
    };
  });
}

function buildSummary(view: ProgressDashboardView): string {
  const ageType = view.age.ageType ?? 'unknown age';
  const pathSummary = compactLegacyPaths(view)
    .map((path) => `${path.classType ?? path.legacyPathType}: ${path.score ?? '?'}/${path.finalRequiredPathPoints ?? '?'}`)
    .join(', ');
  return `${ageType} progress: ${pathSummary || 'no current-age legacy paths surfaced'}`;
}

function probeValue<T>(probe: Probe<T> | null | undefined): T | null {
  return probe?.ok ? probe.value : null;
}

function ratioPercent(current: unknown, total: unknown): number | null {
  return typeof current === 'number' && typeof total === 'number' && total > 0
    ? Math.round((current / total) * 1000) / 10
    : null;
}

function shortClass(value: string | null): string | null {
  return value?.replace(/^LEGACY_PATH_CLASS_/, '').toLowerCase() ?? null;
}

function stringField(value: unknown, key: string): string | null {
  return value && typeof value === 'object' && typeof (value as Record<string, unknown>)[key] === 'string'
    ? (value as Record<string, string>)[key]
    : null;
}

function uniqueStrings(values: ReadonlyArray<string | null>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}
