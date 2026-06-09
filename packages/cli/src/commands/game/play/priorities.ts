import { Command, Flags } from '@oclif/core';
import {
  createCiv7ControlOrpcServerClient,
  type Civ7AttentionPrioritiesResult,
} from '@civ7/control-orpc';
import { liveCiv7ControlOrpcDirectControlFacade } from '@civ7/control-orpc/runtime';
import { createSemanticCliEnvelope, type SemanticCliEnvelope } from '../../../game-play/semantic-envelope';
import { buildDirectControlOptions } from '../../../utils/game-play-shared';

type PriorityItem = Civ7AttentionPrioritiesResult['priorities'][number] & {
  command?: string;
};
type PriorityView = Omit<Civ7AttentionPrioritiesResult, 'priorities'> & {
  priorities: PriorityItem[];
  cliNotes: string[];
};

export default class GamePlayPriorities extends Command {
  static id = 'game play priorities';
  static summary = 'Read a turn-priority dashboard without sending operations';
  static description =
    'Composes the live HUD, ready unit/city views, and an optional bounded battlefield scan into a read-only priority list for deciding what to inspect next.';

  static examples = [
    '<%= config.bin %> game play priorities --json',
    '<%= config.bin %> game play priorities --compact --json',
    '<%= config.bin %> game play priorities --radius 6 --json',
    '<%= config.bin %> game play priorities --no-battlefield',
  ];

  static flags = {
    host: Flags.string({
      description: 'Civ7 tuner socket host',
    }),
    port: Flags.integer({
      description: 'Civ7 tuner socket port',
    }),
    max: Flags.integer({
      description: 'Maximum notifications to materialize',
      default: 25,
    }),
    radius: Flags.integer({
      description: 'Battlefield scan radius around the ready unit when available',
      default: 6,
      min: 1,
      max: 16,
    }),
    'max-operations': Flags.integer({
      description: 'Maximum operation enum keys to probe for ready-unit view',
      default: 96,
    }),
    'max-units': Flags.integer({
      description: 'Maximum nearby unit summaries to return from battlefield scan',
      default: 80,
    }),
    'timeout-ms': Flags.integer({
      description: 'Socket timeout',
      default: 45_000,
    }),
    'no-battlefield': Flags.boolean({
      description: 'Skip battlefield scan and only read HUD plus ready entity views',
      default: false,
    }),
    compact: Flags.boolean({
      description: 'In JSON mode, emit a summary-first play-agent envelope instead of the full dashboard payload',
      default: false,
    }),
    json: Flags.boolean({
      description: 'Emit machine-readable JSON',
      default: false,
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(GamePlayPriorities);
    const client = createCiv7ControlOrpcServerClient({
      directControl: liveCiv7ControlOrpcDirectControlFacade,
      endpointDefaults: buildDirectControlOptions(flags),
    });
    const result = await client.attention.priorities({
      maxNotifications: flags.max,
      includeBattlefield: !flags['no-battlefield'],
      battlefieldRadius: flags.radius,
      maxBattlefieldUnits: flags['max-units'],
      readyUnitRadius: 2,
      maxReadyUnitOperations: flags['max-operations'],
    });
    const view = buildCliPriorityView(result);

    if (flags.json) {
      this.log(JSON.stringify(flags.compact ? buildCompactView(view) : { ok: true, view }));
      return;
    }

    this.log(`Turn ${formatValue(view.turn)} (${formatValue(view.turnDate)})`);
    this.log(`Readiness: ${view.readiness}; can end turn: ${formatValue(view.canEndTurn)}`);
    for (const item of view.priorities) {
      this.log(`- [${item.priority}] ${item.kind}: ${item.summary}`);
      this.log(`  why: ${item.reason}`);
      if (item.command) this.log(`  next: ${item.command}`);
    }
  }
}

function buildCliPriorityView(result: Civ7AttentionPrioritiesResult): PriorityView {
  return {
    ...result,
    priorities: result.priorities.map((item) => ({
      ...item,
      command: commandForPriority(item),
    })),
    cliNotes: [
      'Read-only priority dashboard; it does not send operations or choose strategy.',
      'Command suggestions are CLI presentation derived from service next-step descriptors.',
      'Battlefield scan distances are planning heuristics and may include debug-visible entities unless paired with visibility reads.',
    ],
  };
}

function buildCompactView(view: PriorityView): {
  ok: true;
  contractVersion: 'play-agent-v0';
  command: 'game play priorities';
  summary: string;
  decisionHud: Record<string, unknown>;
  priorities: Array<Pick<PriorityItem, 'priority' | 'kind' | 'summary' | 'reason' | 'command'>>;
  semanticEnvelope: SemanticCliEnvelope;
  next: string | null;
  warnings: string[];
  omitted: Array<{ path: string; reason: string }>;
  hiddenInfoPolicy: unknown;
} {
  const top = view.priorities[0] ?? null;
  const runtimeError = view.priorities.find((item) => item.kind === 'runtime-state-error');
  const warnings = [
    runtimeError
      ? 'Core HUD probes failed; rehydrate or watch before treating the turn as clean.'
      : null,
    view.battlefield
      ? 'Battlefield scan is read-only planning evidence; validate and postcondition-check any mutation separately.'
      : null,
  ].filter((warning): warning is string => Boolean(warning));
  const compactPriorities = view.priorities.slice(0, 6).map(({ priority, kind, summary, reason, command }) => ({
    priority,
    kind,
    summary,
    reason,
    command,
  }));
  const decisionHud = {
    playable: view.playable,
    readiness: view.readiness,
    turn: view.turn,
    turnDate: view.turnDate,
    canEndTurn: view.canEndTurn,
    hasSentTurnComplete: view.turnCompletion.hasSentTurnComplete,
    turnCompletion: view.turnCompletion,
    readyUnit: view.readyUnit,
    readyCity: view.readyCity,
    battlefieldPoiCount: view.battlefield?.pointOfInterestCount ?? 0,
  };
  const next = top?.command ?? null;
  const semanticBlockers = view.priorities.filter((item) => item.blocking).slice(0, 6);
  const semanticEnvelope = createSemanticCliEnvelope({
    scope: {
      surface: 'game play priorities',
      playerScope: 'local-player',
      localPlayerId: view.localPlayerId,
    },
    state: decisionHud,
    blockers: semanticBlockers.map(({ priority, kind, summary, reason }) => ({
      priority,
      kind,
      summary,
      reason,
    })),
    decisions: compactPriorities.map(({ kind, summary, command }) => ({
      kind,
      summary,
      command: command ?? null,
    })),
    actions: compactPriorities.flatMap(({ kind, command }) =>
      command
        ? [{
            family: kind,
            command,
            readOnly: !command.includes('--send'),
            sendsMutation: command.includes('--send'),
          }]
        : [],
    ),
    result: {
      status: 'read-only',
      sent: false,
      classification: 'not-sent',
    },
    nextSteps: next ? [next] : [],
    evidence: [{
      label: 'control-orpc-priorities-compact',
      proofClass: 'local-cli-output',
      command: 'game play priorities --compact --json',
    }],
    notes: [
      'Read-only compact priorities semantic envelope; it does not prove live mutation behavior.',
      ...warnings,
    ],
  });

  return {
    ok: true,
    contractVersion: 'play-agent-v0',
    command: 'game play priorities',
    summary: top
      ? `${top.kind}: ${top.summary}`
      : 'no priorities surfaced',
    decisionHud,
    priorities: compactPriorities,
    semanticEnvelope,
    next,
    warnings,
    omitted: [
      { path: 'view.notes', reason: 'use --json without --compact for full service notes' },
      { path: 'view.readyUnit', reason: 'use --json without --compact or game play ready-unit --json for ready-unit detail' },
      { path: 'view.readyCity', reason: 'use --json without --compact or game play ready-city --json for ready-city detail' },
      { path: 'view.battlefield.pointsOfInterest', reason: 'use --json without --compact or a tactical lens command for battlefield point detail' },
      { path: 'priorities[].evidenceLabels', reason: 'use --json without --compact for bounded service evidence labels' },
    ],
    hiddenInfoPolicy: view.battlefield?.hiddenInfoPolicy ?? 'not-expanded',
  };
}

function commandForPriority(item: Civ7AttentionPrioritiesResult['priorities'][number]): string | undefined {
  const step = item.nextStep;
  if (step == null) return undefined;
  const params = step.parameters;
  switch (step.kind) {
    case 'restore-readiness':
    case 'observe':
      return 'game play rehydrate --json; game watch --count 1 --include-ready-unit --include-ready-city --jsonl';
    case 'inspect-ready-unit':
    case 'validate-unit-target':
      return "game play ready-unit --json; game play unit-target --unit-id '<unit-id>' --x <x> --y <y> --json";
    case 'inspect-ready-city':
      return item.kind.startsWith('hud:')
        ? 'game play ready-city --compact --json'
        : 'game play ready-city --json';
    case 'inspect-progression':
      return progressionCommand(params.category);
    case 'inspect-decision':
      return decisionCommand(params.category);
    case 'inspect-notification':
      return params.componentId == null
        ? 'game play dismiss-notification --json'
        : params.category === 'narrative-choice'
          ? `game play dismiss-notification --target '${JSON.stringify(params.componentId)}' --json`
          : `game play dismiss-notification --target '${JSON.stringify(params.componentId)}' --send`;
    case 'validate-unit-command':
      return params.unitId != null && params.operationType != null
        ? `game play operation --family unit --type ${params.operationType} --unit-id '${JSON.stringify(params.unitId)}' --send`
        : 'game play operation --family unit --json';
    case 'send-turn-complete':
    case 'end-turn':
      return 'game play end-turn --send --json';
    case 'observe-turn-advance':
      return 'game watch --count 3 --interval-ms 1000 --include-ready-unit --include-ready-city --jsonl';
    case 'inspect-battlefield-point':
      return battlefieldCommand(params.location, item.kind);
  }
}

function progressionCommand(category: unknown): string {
  if (category === 'technology-choice') return 'game play choose-tech --options --json';
  if (category === 'culture-choice') return 'game play choose-culture --options --json';
  if (category === 'tradition-review') return 'game play traditions --compact --json';
  return 'game play priorities --compact --json';
}

function decisionCommand(category: unknown): string {
  if (category === 'celebration-choice') return 'game play choose-celebration --options --json';
  if (category === 'government-choice') return 'game play choose-government --options --json';
  if (category === 'narrative-choice') return 'game play choose-narrative --options --json';
  if (category === 'first-meet-diplomacy') return 'game play respond-first-meet --json';
  return 'game play priorities --compact --json';
}

function battlefieldCommand(
  location: Readonly<{ x: number; y: number }> | undefined,
  kind: string,
): string {
  if (location == null) return 'game play battlefield-scan --x <front-x> --y <front-y> --json';
  if (kind === 'battlefield:city-front') {
    return `game play destination-analysis --to-x ${location.x} --to-y ${location.y} --json`;
  }
  return `game play battlefield-scan --x ${location.x} --y ${location.y} --json`;
}

function formatValue(value: unknown): string {
  return value == null || typeof value === 'object' ? JSON.stringify(value) : String(value);
}
