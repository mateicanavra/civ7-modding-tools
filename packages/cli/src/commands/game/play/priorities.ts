import { Command, Flags } from '@oclif/core';
import {
  createCiv7ControlOrpcServerClient,
  type Civ7AttentionPrioritiesResult,
} from '@civ7/control-orpc';
import { liveCiv7ControlOrpcDirectControlFacade } from '@civ7/control-orpc/runtime';
import { createSemanticCliEnvelope, type SemanticCliEnvelope } from '../../../game-play/semantic-envelope';
import { buildDirectControlOptions } from '../../../utils/game-play-shared';

type PriorityItem = Civ7AttentionPrioritiesResult['priorities'][number] & {
  nextAction?: PriorityActionDescriptor;
};
type PriorityView = Omit<Civ7AttentionPrioritiesResult, 'priorities'> & {
  priorities: PriorityItem[];
  cliNotes: string[];
};
type PriorityNextStep = NonNullable<Civ7AttentionPrioritiesResult['priorities'][number]['nextStep']>;
type PriorityActionDescriptor = {
  kind: PriorityNextStep['kind'];
  label: string;
  parameters: PriorityNextStep['parameters'];
  readOnly: boolean;
  sendsMutation: boolean;
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
      if (item.nextAction) this.log(`  next: ${item.nextAction.label}`);
    }
  }
}

function buildCliPriorityView(result: Civ7AttentionPrioritiesResult): PriorityView {
  return {
    ...result,
    priorities: result.priorities.map((item) => ({
      ...item,
      nextAction: actionForPriority(item),
    })),
    cliNotes: [
      'Read-only priority dashboard; it does not send operations or choose strategy.',
      'Battlefield scan distances are planning heuristics and may include debug-visible entities unless paired with visibility reads.',
    ],
  };
}

function buildCompactView(view: PriorityView): {
  ok: true;
  contractVersion: 'play-agent-v0';
  surface: 'priorities';
  summary: string;
  decisionHud: Record<string, unknown>;
  priorities: Array<Pick<PriorityItem, 'priority' | 'kind' | 'summary' | 'reason' | 'nextAction'>>;
  semanticEnvelope: SemanticCliEnvelope;
  nextAction: PriorityActionDescriptor | null;
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
  const compactPriorities = view.priorities.slice(0, 6).map(({ priority, kind, summary, reason, nextAction }) => ({
    priority,
    kind,
    summary,
    reason,
    nextAction,
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
  const nextAction = top?.nextAction ?? null;
  const semanticBlockers = view.priorities.filter((item) => item.blocking).slice(0, 6);
  const semanticEnvelope = createSemanticCliEnvelope({
    scope: {
      surface: 'priorities',
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
    decisions: compactPriorities.map(({ kind, summary, nextAction }) => ({
      kind,
      summary,
      nextAction: nextAction ?? null,
    })),
    actions: compactPriorities.flatMap(({ kind, nextAction }) =>
      nextAction
        ? [{
            family: kind,
            ...nextAction,
          }]
        : [],
    ),
    result: {
      status: 'read-only',
      sent: false,
      classification: 'not-sent',
    },
    nextSteps: nextAction ? [nextAction] : [],
    evidence: [{
      label: 'control-orpc-priorities-compact',
      proofClass: 'local-cli-output',
      surface: 'priorities',
    }],
    notes: [
      'Read-only compact priorities semantic envelope; it does not prove live mutation behavior.',
      ...warnings,
    ],
  });

  return {
    ok: true,
    contractVersion: 'play-agent-v0',
    surface: 'priorities',
    summary: top
      ? `${top.kind}: ${top.summary}`
      : 'no priorities surfaced',
    decisionHud,
    priorities: compactPriorities,
    semanticEnvelope,
    nextAction,
    warnings,
    omitted: [
      { path: 'view.notes', reason: 'compact output keeps priority notes out of the main action surface' },
      { path: 'view.readyUnit', reason: 'compact output keeps ready-unit detail summarized by priority rows' },
      { path: 'view.readyCity', reason: 'compact output keeps ready-city detail summarized by priority rows' },
      { path: 'view.battlefield.pointsOfInterest', reason: 'compact output keeps battlefield detail summarized by priority rows' },
      { path: 'priorities[].evidenceLabels', reason: 'compact output omits bounded service evidence labels' },
    ],
    hiddenInfoPolicy: view.battlefield?.hiddenInfoPolicy ?? 'not-expanded',
  };
}

function actionForPriority(item: Civ7AttentionPrioritiesResult['priorities'][number]): PriorityActionDescriptor | undefined {
  const step = item.nextStep;
  if (step == null) return undefined;
  const sendsMutation = ['send-turn-complete', 'end-turn'].includes(step.kind);
  return {
    kind: step.kind,
    label: step.label,
    parameters: step.parameters,
    readOnly: !sendsMutation,
    sendsMutation,
  };
}

function formatValue(value: unknown): string {
  return value == null || typeof value === 'object' ? JSON.stringify(value) : String(value);
}
