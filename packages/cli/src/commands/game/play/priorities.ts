import { Command, Flags } from '@oclif/core';
import {
  getCiv7BattlefieldScan,
  getCiv7PlayNotificationView,
  getCiv7ReadyCityView,
  getCiv7ReadyUnitView,
} from '@civ7/direct-control';
import {
  buildDirectControlOptions,
  recommendedCliFromDecisionDetails,
} from '../../../utils/game-play-shared';
import { createSemanticCliEnvelope, type SemanticCliEnvelope } from '../../../game-play/semantic-envelope';

type PriorityItem = {
  priority: number;
  kind: string;
  summary: string;
  reason: string;
  blocking: boolean;
  command?: string;
  evidence?: unknown;
};

type Probe<T = unknown> = { ok: true; value: T } | { ok: false; error: string };

type PriorityView = {
  localPlayerId: unknown;
  turn: Probe;
  turnDate: Probe;
  blocker: Probe;
  canEndTurn: Probe;
  hasSentTurnComplete: Probe;
  firstReadyUnitId: Probe;
  selectedCityId: Probe;
  hud: unknown;
  readyUnit: {
    unitId: unknown;
    unit: unknown;
    legalOperationScope: string;
    legalNoTargetOperationCount: number;
    legalOperationCount: number;
    promotionReadiness: unknown;
  } | null;
  readyCity: {
    cityId: unknown;
    city: unknown;
    legalOperationCount: number;
    productionCandidateCount: number;
    townFocusOptionCount: number;
    populationPlacement: unknown;
  } | null;
  battlefield: {
    origins: unknown;
    radius: unknown;
    hiddenInfoPolicy: unknown;
    pointsOfInterest: unknown;
    owners: unknown;
  } | null;
  priorities: PriorityItem[];
  notes: string[];
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
    const options = buildDirectControlOptions(flags);
    const hud = await getCiv7PlayNotificationView({
      ...options,
      maxNotifications: flags.max,
    });
    const readyUnitId = probeValue(hud.firstReadyUnitId);
    const readyUnit = readyUnitId
      ? await getCiv7ReadyUnitView({
          unitId: readyUnitId,
          radius: 2,
          maxOperations: flags['max-operations'],
        }, options)
      : null;
    const readyCity = await getCiv7ReadyCityView({}, options);
    const origin = getReadyUnitLocation(readyUnit);
    const battlefield = !flags['no-battlefield'] && origin
      ? await getCiv7BattlefieldScan({
          origins: [origin],
          radius: flags.radius,
          maxUnits: flags['max-units'],
        }, options)
      : null;
    const priorities = buildPriorities({ hud, readyUnit, readyCity, battlefield });
    const view: PriorityView = {
      localPlayerId: hud.localPlayerId,
      turn: hud.turn,
      turnDate: hud.turnDate,
      blocker: hud.blocker,
      canEndTurn: hud.canEndTurn,
      hasSentTurnComplete: hud.hasSentTurnComplete,
      firstReadyUnitId: hud.firstReadyUnitId,
      selectedCityId: hud.selectedCityId,
      hud: hud.hud,
      readyUnit: readyUnit
        ? {
            unitId: readyUnit.unitId,
            unit: readyUnit.unit,
            legalOperationScope: 'no-target',
            legalNoTargetOperationCount: readyUnit.legalOperations.length,
            legalOperationCount: readyUnit.legalOperations.length,
            promotionReadiness: readyUnit.promotionReadiness,
          }
        : null,
      readyCity: readyCity.cityId
        ? {
            cityId: readyCity.cityId,
            city: readyCity.city,
            legalOperationCount: readyCity.legalOperations.length,
            productionCandidateCount: probeArrayLength(readyCity.productionCandidates),
            townFocusOptionCount: probeArrayLength(readyCity.townFocusOptions),
            populationPlacement: readyCity.populationPlacement,
          }
        : null,
      battlefield: battlefield
        ? {
            origins: battlefield.origins,
            radius: battlefield.radius,
            hiddenInfoPolicy: battlefield.hiddenInfoPolicy,
            pointsOfInterest: battlefield.pointsOfInterest,
            owners: battlefield.owners,
          }
        : null,
      priorities,
      notes: [
        'Read-only priority dashboard; it does not send operations or choose strategy.',
        'Use listed commands as next inspections, then validate mutations with the specific command family.',
        'Battlefield scan distances are cheap grid heuristics and may include debug-visible entities unless paired with visibility reads.',
      ],
    };

    if (flags.json) {
      this.log(JSON.stringify(flags.compact ? buildCompactView(view) : { ok: true, view }));
      return;
    }

    this.log(`Turn ${formatProbe(view.turn)} (${formatProbe(view.turnDate)})`);
    this.log(`Blocker: ${formatProbe(view.blocker)}; can end turn: ${formatProbe(view.canEndTurn)}`);
    for (const item of priorities) {
      this.log(`- [${item.priority}] ${item.kind}: ${item.summary}`);
      this.log(`  why: ${item.reason}`);
      if (item.command) this.log(`  next: ${item.command}`);
    }
  }
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
    turn: view.turn,
    turnDate: view.turnDate,
    blocker: view.blocker,
    canEndTurn: view.canEndTurn,
    hasSentTurnComplete: view.hasSentTurnComplete,
    firstReadyUnitId: view.firstReadyUnitId,
    selectedCityId: view.selectedCityId,
    readyUnit: view.readyUnit
      ? {
          unitId: view.readyUnit.unitId,
          legalNoTargetOperationCount: view.readyUnit.legalNoTargetOperationCount,
        }
      : null,
    readyCity: view.readyCity
      ? {
          cityId: view.readyCity.cityId,
          legalOperationCount: view.readyCity.legalOperationCount,
          populationPlacement: view.readyCity.populationPlacement,
        }
      : null,
    battlefieldPoiCount: Array.isArray(view.battlefield?.pointsOfInterest)
      ? view.battlefield.pointsOfInterest.length
      : 0,
  };
  const next = top?.command ?? null;
  const semanticBlockers = view.priorities.filter(isSemanticBlockerPriority).slice(0, 6);
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
            approvalRequired: command.includes('--send'),
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
      label: 'local-cli-priorities-compact',
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
      { path: 'view.hud', reason: 'use --json without --compact for full HUD details' },
      { path: 'view.readyUnit.unit', reason: 'use --json without --compact or game play ready-unit --json for full unit details' },
      { path: 'view.readyCity.city', reason: 'use --json without --compact or game play ready-city --json for full city details' },
      { path: 'view.battlefield.pointsOfInterest[].evidence', reason: 'use --json without --compact or the listed tactical lens command for raw evidence' },
      { path: 'priorities[].evidence', reason: 'use --json without --compact for raw priority evidence' },
    ],
    hiddenInfoPolicy: view.battlefield?.hiddenInfoPolicy ?? 'not-expanded',
  };
}

function buildPriorities(input: {
  hud: Awaited<ReturnType<typeof getCiv7PlayNotificationView>>;
  readyUnit: Awaited<ReturnType<typeof getCiv7ReadyUnitView>> | null;
  readyCity: Awaited<ReturnType<typeof getCiv7ReadyCityView>>;
  battlefield: Awaited<ReturnType<typeof getCiv7BattlefieldScan>> | null;
}): PriorityItem[] {
  const items: PriorityItem[] = [];
  const runtimeErrors = hudProbeErrors(input.hud);
  if (runtimeErrors.length > 0) {
    items.push({
      priority: 95,
      kind: 'runtime-state-error',
      summary: 'core HUD probes failed; live blocker state is not proven clean',
      reason: 'A missing turn, blocker, or blocking-notification probe means the App UI read is partial. Do not treat an empty notification queue as end-turn proof.',
      blocking: true,
      command: 'game play rehydrate --json; game watch --count 1 --include-ready-unit --include-ready-city --jsonl',
      evidence: runtimeErrors,
    });
  }

  const nextDecision = input.hud.hud?.nextDecision;
  if (nextDecision) {
    const isEndTurnBlocking = nextDecision.isEndTurnBlocking === true;
    const priority = isEndTurnBlocking ? 100 : 70;
    const staleUnitCommand = staleUnitCommandPriority(nextDecision);
    const recommendedDetailCommand = recommendedCliFromDecisionDetails((nextDecision as { details?: unknown }).details);
    const decisionCommand = commandFromDecision(nextDecision);
    const detailCommand = commandFromDecisionDetails(nextDecision);
    const readyUnitCommand = nextDecision.category === 'unit-command' && input.readyUnit
      ? 'game play ready-unit --json; game play unit-target --unit-id \'<unit-id>\' --x <x> --y <y> --json'
      : undefined;
    items.push({
      priority,
      kind: staleUnitCommand?.kind ?? `hud:${nextDecision.category}`,
      summary: staleUnitCommand?.summary ?? nextDecision.summary ?? nextDecision.message ?? nextDecision.typeName ?? 'current HUD decision',
      reason: staleUnitCommand?.reason ?? (recommendedDetailCommand
          ? detailCommandReason(recommendedDetailCommand)
        : decisionCommand
          ? 'HUD notification includes the live ComponentID; use the exact closeout command after reviewing the report context.'
        : detailCommand
          ? detailCommandReason(detailCommand)
        : readyUnitCommand
          ? 'A ready unit exists; inspect the ready-unit and target surfaces instead of treating COMMAND_UNITS as stale reconciliation.'
        : 'HUD decisions are the shortest-lived live authority and should be resolved or consciously deferred before broad strategy.'),
      blocking: isEndTurnBlocking,
      command: staleUnitCommand?.command ?? recommendedDetailCommand ?? decisionCommand ?? detailCommand ?? readyUnitCommand ?? nextDecision.cli,
      evidence: nextDecision,
    });
  }

  if (input.readyUnit) {
    const unit = probeValue(input.readyUnit.unit) as { typeName?: string; location?: { x: number; y: number } } | null;
    const location = unit?.location ? ` at (${unit.location.x},${unit.location.y})` : '';
    items.push({
      priority: 85,
      kind: 'ready-unit',
      summary: `${unit?.typeName ?? 'ready unit'}${location}`,
      reason: 'A ready unit blocks turn flow and target-plot actions require unit-target validation even when no-target operations are present.',
      blocking: true,
      command: 'game play ready-unit --json; game play unit-target --unit-id \'<unit-id>\' --x <x> --y <y> --json',
      evidence: {
        unitId: input.readyUnit.unitId,
        legalNoTargetOperationCount: input.readyUnit.legalOperations.length,
      },
    });
  }

  if (input.readyCity.cityId) {
    const city = probeValue(input.readyCity.city) as { name?: string } | null;
    items.push({
      priority: 80,
      kind: 'ready-city',
      summary: city?.name ?? 'ready city',
      reason: 'City blockers often branch between production, town focus, population placement, and expansion.',
      blocking: true,
      command: 'game play ready-city --json',
      evidence: {
        cityId: input.readyCity.cityId,
        legalOperationCount: input.readyCity.legalOperations.length,
      },
    });
  }

  for (const point of asArray(input.battlefield?.pointsOfInterest)) {
    const severity = typeof point.severity === 'string' ? point.severity : 'medium';
    items.push({
      priority: severityPriority(severity),
      kind: `battlefield:${String(point.kind ?? 'point-of-interest')}`,
      summary: String(point.summary ?? point.kind ?? 'battlefield point of interest'),
      reason: 'Battlefield POIs identify immediate inspection needs around the current ready-unit origin.',
      blocking: false,
      command: battlefieldCommandFor(point),
      evidence: point,
    });
  }

  if (items.length === 0) {
    items.push({
      priority: 10,
      kind: 'clean-read',
      summary: 'no HUD, ready-unit, ready-city, or battlefield priority surfaced',
      reason: 'Fresh clean reads can use the guarded end-turn command; it rechecks blockers before sending.',
      blocking: false,
      command: "game play end-turn --send --reason 'clean read: no HUD, ready-unit, ready-city, or battlefield priority surfaced' --json",
    });
  }

  return items.sort((a, b) => b.priority - a.priority);
}

function isSemanticBlockerPriority(item: PriorityItem): boolean {
  return item.blocking;
}

function hudProbeErrors(hud: Awaited<ReturnType<typeof getCiv7PlayNotificationView>>): Array<{ field: string; error: string }> {
  return [
    ['turn', hud.turn],
    ['turnDate', hud.turnDate],
    ['blocker', hud.blocker],
    ['blockingNotificationId', hud.blockingNotificationId],
  ].flatMap(([field, probe]) =>
    isProbeError(probe)
      ? [{ field: String(field), error: probe.error }]
      : [],
  );
}

function isProbeError(probe: unknown): probe is { ok: false; error: string } {
  return Boolean(probe && typeof probe === 'object' && 'ok' in probe && (probe as { ok?: unknown }).ok === false);
}

function getReadyUnitLocation(readyUnit: Awaited<ReturnType<typeof getCiv7ReadyUnitView>> | null): { x: number; y: number } | null {
  const unit = readyUnit ? probeValue(readyUnit.unit) as { location?: { x?: unknown; y?: unknown } } | null : null;
  const x = unit?.location?.x;
  const y = unit?.location?.y;
  return typeof x === 'number' && typeof y === 'number' ? { x, y } : null;
}

function severityPriority(severity: string): number {
  if (severity === 'high') return 75;
  if (severity === 'medium') return 55;
  if (severity === 'low') return 35;
  return 45;
}

function battlefieldCommandFor(point: Record<string, unknown>): string {
  const location = point.location as { x?: unknown; y?: unknown } | undefined;
  if (location && typeof location.x === 'number' && typeof location.y === 'number') {
    if (point.kind === 'city-front') {
      return `game play destination-analysis --to-x ${location.x} --to-y ${location.y} --json`;
    }
    return `game play battlefield-scan --x ${location.x} --y ${location.y} --json`;
  }
  return 'game play battlefield-scan --x <front-x> --y <front-y> --json';
}

function probeValue<T>(probe: { ok: true; value: T } | { ok: false; error: string } | null | undefined): T | null {
  return probe?.ok ? probe.value : null;
}

function probeArrayLength(probe: { ok: true; value: unknown } | { ok: false; error: string }): number {
  return probe.ok && Array.isArray(probe.value) ? probe.value.length : 0;
}

function asArray(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => item !== null && typeof item === 'object') : [];
}

function detailCommandReason(command: string): string {
  if (command.includes('dismiss-notification') && !command.includes('--send')) {
    return 'HUD details prove no live operation option is available; inspect dismissal postcondition evidence before attempting any closeout.';
  }
  if (command.includes('dismiss-notification')) {
    return 'HUD details expose a reviewed notification closeout candidate; it is only successful if the dismissal command reports verified:true.';
  }
  if (command.includes('--options')) {
    return 'HUD details expose a live option surface; read the compact options before selecting a validated command.';
  }
  return 'HUD details expose a validator-backed operation candidate; use that exact command or consciously defer before broad strategy.';
}

function commandFromDecision(nextDecision: Record<string, unknown>): string | undefined {
  if (nextDecision.category === 'production-choice' || nextDecision.category === 'population-placement') {
    return 'game play ready-city --compact --json';
  }
  if (nextDecision.category === 'tradition-review') {
    return 'game play traditions --compact --json';
  }
  if (nextDecision.category === 'informational-notification' && nextDecision.operationFamily === 'app-ui-action') {
    const notificationId = nextDecision.notificationId;
    if (notificationId && typeof notificationId === 'object') {
      return `game play dismiss-notification --target '${JSON.stringify(notificationId)}' --send --reason '<reviewed: ${reasonSlug(nextDecision)}>'`;
    }
  }
  return undefined;
}

function commandFromDecisionDetails(nextDecision: { details?: unknown }): string | undefined {
  const details = nextDecision.details;
  if (!details || typeof details !== 'object') return undefined;
  const record = details as Record<string, unknown>;
  if (record.kind === 'technology-choice-options') {
    const enabledOptions = asArray(record.enabledOptions);
    return enabledOptions.length > 0 ? 'game play choose-tech --options --json' : undefined;
  }
  if (record.kind === 'culture-choice-options') {
    const enabledOptions = asArray(record.enabledOptions);
    return enabledOptions.length > 0 ? 'game play choose-culture --options --json' : undefined;
  }
  if (record.kind === 'celebration-choice-options') {
    const enabledOptions = asArray(record.enabledOptions);
    return enabledOptions.length > 0 ? 'game play choose-celebration --options --json' : undefined;
  }
  if (record.kind === 'government-choice-options') {
    const enabledOptions = asArray(record.enabledOptions);
    return enabledOptions.length > 0 ? 'game play choose-government --options --json' : undefined;
  }
  if (record.kind === 'narrative-choice-options') {
    const enabledOptions = asArray(record.enabledOptions);
    if (enabledOptions.length > 0) return 'game play choose-narrative --options --json';
    return typeof record.dismissalDiagnosticCli === 'string' && record.dismissalDiagnosticCli.length > 0
      ? record.dismissalDiagnosticCli
      : 'game play choose-narrative --options --json';
  }
  if (record.kind !== 'unit-command-reconciliation') return undefined;
  if (record.staleReadyPointerSuspected === true) {
    const candidate = asArray(record.enabledCloseoutCandidates).find((item) => typeof item.cli === 'string' && item.cli.length > 0);
    if (typeof candidate?.cli === 'string') return candidate.cli;
  }
  const repair = asArray(record.repairCandidates).find((item) => typeof item.cli === 'string' && item.cli.length > 0);
  return typeof repair?.cli === 'string' ? repair.cli : undefined;
}

function staleUnitCommandPriority(nextDecision: { details?: unknown }): Pick<PriorityItem, 'kind' | 'summary' | 'reason' | 'command'> | null {
  const details = nextDecision.details;
  if (!details || typeof details !== 'object') return null;
  const record = details as Record<string, unknown>;
  if (record.kind !== 'unit-command-reconciliation') return null;
  if (record.staleExpiredWithoutEnabledCloseout !== true && record.classification !== 'unit-command-stale-expired') return null;
  const repair = asArray(record.repairCandidates).find((item) => typeof item.cli === 'string' && item.cli.length > 0);
  const hasSent = probeValue(record.hasSentTurnComplete as Probe<boolean>) === true;
  return {
    kind: 'hud:unit-command-stale-expired',
    summary: hasSent
      ? 'expired COMMAND_UNITS has no ready unit or enabled closeout after turn-complete was sent'
      : 'expired COMMAND_UNITS has no ready unit or enabled unit closeout',
    reason: hasSent
      ? 'Official command-units activation has no selected/first-ready unit and every scanned unit closeout is disabled; turn-complete is already sent, so wait/watch for turn advance or a new blocker instead of repeating unit operations.'
      : 'Official command-units activation has no selected/first-ready unit and every scanned unit closeout is disabled; use the normal end-turn path once, then verify the turn advances or a new blocker appears.',
    command: typeof repair?.cli === 'string' ? repair.cli : undefined,
  };
}

function reasonSlug(item: Record<string, unknown>): string {
  const text = String(item.typeName ?? item.summary ?? item.category)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return text || 'notification-reviewed';
}

function formatProbe<T>(probe: { ok: true; value: T } | { ok: false; error: string }): string {
  if (!probe.ok) return `<error: ${probe.error}>`;
  return typeof probe.value === 'object' ? JSON.stringify(probe.value) : String(probe.value);
}
