import { Command, Flags } from '@oclif/core';
import {
  type Civ7ComponentId,
  type Civ7PlayNotificationViewResult,
  type Civ7ReadyUnitViewResult,
  type Civ7RuntimeProbe,
  getCiv7PlayNotificationView,
  getCiv7ReadyUnitView,
} from '@civ7/direct-control';
import {
  buildDirectControlOptions,
  parseComponentId,
} from '../../../utils/game-play-shared';

type ContinuityStatus = 'unchecked' | 'matches' | 'mismatch';

type ContinuityCheck = Readonly<{
  label: string;
  expected: unknown;
  actual: unknown;
  matches: boolean;
}>;

type RehydrateSnapshot = Readonly<{
  source: 'live-direct-control';
  purpose: 'restart-rehydration';
  capturedAt: string;
  notifications: Civ7PlayNotificationViewResult;
  readyUnit: Civ7ReadyUnitViewResult | null;
  continuity: Readonly<{
    status: ContinuityStatus;
    checks: ReadonlyArray<ContinuityCheck>;
    warnings: ReadonlyArray<string>;
  }>;
  commonActions: ReadonlyArray<{
    kind: string;
    label: string;
    parameters: Record<string, unknown>;
    readOnly: boolean;
    sendsMutation: boolean;
    when: string;
  }>;
  notes: ReadonlyArray<string>;
}>;

type RehydrateCommonAction = RehydrateSnapshot['commonActions'][number];

export default class GamePlayRehydrate extends Command {
  static id = 'game play rehydrate';
  static summary = 'Read the live session after restart or reconnect';
  static description =
    'Composes the live notification HUD with the current ready-unit view and optional continuity checks so agents can discard stale pre-restart assumptions.';

  static examples = [
    '<%= config.bin %> game play rehydrate --json',
    '<%= config.bin %> game play rehydrate --expected-turn 97 --json',
    '<%= config.bin %> game play rehydrate --expected-ready-unit \'{"owner":0,"id":917508,"type":26}\' --json',
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
      description: 'Nearby occupied-plot radius when reading the ready unit',
      default: 2,
    }),
    'max-operations': Flags.integer({
      description: 'Maximum operation enum keys to probe per family for the ready unit',
      default: 96,
    }),
    'expected-turn': Flags.integer({
      description: 'Expected turn from the previous watcher or active-agent state',
    }),
    'expected-date': Flags.string({
      description: 'Expected turn date from the previous watcher or active-agent state',
    }),
    'expected-ready-unit': Flags.string({
      description: 'Expected first ready unit ComponentID JSON from the previous state',
    }),
    'skip-ready-unit': Flags.boolean({
      description: 'Only read the notification HUD; do not compose the ready-unit view',
      default: false,
    }),
    'timeout-ms': Flags.integer({
      description: 'Socket timeout',
      default: 45_000,
    }),
    json: Flags.boolean({
      description: 'Emit machine-readable JSON',
      default: false,
    }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(GamePlayRehydrate);
    const options = buildDirectControlOptions(flags);
    const notifications = await getCiv7PlayNotificationView({
      ...options,
      maxNotifications: flags.max,
    });
    const readyUnitId = probeValue(notifications.firstReadyUnitId);
    const expectedReadyUnit = flags['expected-ready-unit']
      ? parseComponentId(flags['expected-ready-unit'], 'expected-ready-unit')
      : undefined;
    const readyUnit = flags['skip-ready-unit']
      ? null
      : await readReadyUnit(readyUnitId ?? expectedReadyUnit, flags.radius, flags['max-operations'], options);
    const snapshot = buildSnapshot({
      notifications,
      readyUnit,
      expectedTurn: flags['expected-turn'],
      expectedDate: flags['expected-date'],
      expectedReadyUnit,
    });

    if (flags.json) {
      this.log(JSON.stringify({ ok: true, snapshot }));
      return;
    }

    this.log(`Live turn: ${formatProbe(notifications.turn)} (${formatProbe(notifications.turnDate)})`);
    this.log(`Continuity: ${snapshot.continuity.status}`);
    for (const warning of snapshot.continuity.warnings) this.log(`Warning: ${warning}`);
    this.log(`Blocker: ${formatProbe(notifications.blocker)}; next decision: ${notifications.hud.nextDecision?.category ?? '<none>'}`);
    this.log(`First ready unit: ${formatProbe(notifications.firstReadyUnitId)}`);
    if (readyUnit?.unitId) {
      this.log(`Ready-unit view: ${formatValue(readyUnit.unitId)} ${formatProbe(readyUnit.unit)}`);
    }
    this.log('Common actions:');
    for (const action of snapshot.commonActions) this.log(`- ${action.label}: ${action.kind}`);
    for (const note of snapshot.notes) this.log(`Note: ${note}`);
  }
}

async function readReadyUnit(
  unitId: Civ7ComponentId | undefined,
  radius: number,
  maxOperations: number,
  options: Parameters<typeof getCiv7ReadyUnitView>[1],
): Promise<Civ7ReadyUnitViewResult | null> {
  if (!unitId) return null;
  return await getCiv7ReadyUnitView({ unitId, radius, maxOperations }, options);
}

function buildSnapshot(input: Readonly<{
  notifications: Civ7PlayNotificationViewResult;
  readyUnit: Civ7ReadyUnitViewResult | null;
  expectedTurn?: number;
  expectedDate?: string;
  expectedReadyUnit?: Civ7ComponentId;
}>): RehydrateSnapshot {
  const checks = buildContinuityChecks(input);
  const warnings = checks
    .filter((check) => !check.matches)
    .map((check) => `${check.label} mismatch: expected ${formatValue(check.expected)}, live ${formatValue(check.actual)}`);
  return {
    source: 'live-direct-control',
    purpose: 'restart-rehydration',
    capturedAt: new Date().toISOString(),
    notifications: input.notifications,
    readyUnit: input.readyUnit,
    continuity: {
      status: checks.length === 0 ? 'unchecked' : warnings.length === 0 ? 'matches' : 'mismatch',
      checks,
      warnings,
    },
    commonActions: buildCommonActions(input.notifications, input.readyUnit),
    notes: [
      'This snapshot is live runtime evidence, not a local SQLite/catalog read.',
      'After a restart or reconnect, prefer this snapshot over pre-restart turn, unit, and blocker assumptions.',
      'Use SQLite/resource catalogs for names and definitions; use live validators before any send.',
    ],
  };
}

function buildContinuityChecks(input: Readonly<{
  notifications: Civ7PlayNotificationViewResult;
  expectedTurn?: number;
  expectedDate?: string;
  expectedReadyUnit?: Civ7ComponentId;
}>): ReadonlyArray<ContinuityCheck> {
  const checks: ContinuityCheck[] = [];
  if (input.expectedTurn !== undefined) {
    const actual = probeValue(input.notifications.turn);
    checks.push({
      label: 'turn',
      expected: input.expectedTurn,
      actual,
      matches: actual === input.expectedTurn,
    });
  }
  if (input.expectedDate !== undefined) {
    const actual = probeValue(input.notifications.turnDate);
    checks.push({
      label: 'turn date',
      expected: input.expectedDate,
      actual,
      matches: actual === input.expectedDate,
    });
  }
  if (input.expectedReadyUnit !== undefined) {
    const actual = probeValue(input.notifications.firstReadyUnitId);
    checks.push({
      label: 'first ready unit',
      expected: input.expectedReadyUnit,
      actual,
      matches: componentIdEquals(actual, input.expectedReadyUnit),
    });
  }
  return checks;
}

function buildCommonActions(
  notifications: Civ7PlayNotificationViewResult,
  readyUnit: Civ7ReadyUnitViewResult | null,
): RehydrateSnapshot['commonActions'] {
  const actions: RehydrateCommonAction[] = [
    {
      kind: 'refresh-notifications',
      label: 'refresh live blocker HUD',
      parameters: { maxNotifications: notifications.limits.maxNotifications },
      readOnly: true,
      sendsMutation: false,
      when: 'before acting on any stale watcher or active-agent assumption',
    },
  ];
  if (readyUnit?.unitId) {
    actions.push({
      kind: 'inspect-ready-unit',
      label: 'inspect current ready unit',
      parameters: { unitId: readyUnit.unitId },
      readOnly: true,
      sendsMutation: false,
      when: 'before choosing movement, attack, fortify, skip, or other unit action',
    });
  } else if (probeValue(notifications.firstReadyUnitId)) {
    actions.push({
      kind: 'inspect-ready-unit',
      label: 'inspect first ready unit',
      parameters: {},
      readOnly: true,
      sendsMutation: false,
      when: 'before choosing a unit action',
    });
  }
  if (notifications.hud.nextDecision) {
    const decision = notifications.hud.nextDecision as Record<string, unknown>;
    actions.push({
      kind: 'handle-hud-decision',
      label: 'handle next HUD decision',
      parameters: {
        category: decision.category,
        operationFamily: decision.operationFamily,
        operationType: decision.operationType,
        target: decision.target,
      },
      readOnly: false,
      sendsMutation: true,
      when: 'after collecting the required inputs named by the HUD decision',
    });
  }
  return actions;
}

function probeValue<T>(probe: Civ7RuntimeProbe<T>): T | undefined {
  return probe.ok ? probe.value : undefined;
}

function componentIdEquals(left: unknown, right: Civ7ComponentId): boolean {
  if (!isComponentId(left)) return false;
  return left.owner === right.owner && left.id === right.id && left.type === right.type;
}

function isComponentId(value: unknown): value is Civ7ComponentId {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<Civ7ComponentId>;
  return typeof candidate.owner === 'number' && typeof candidate.id === 'number';
}

function formatProbe<T>(probe: Civ7RuntimeProbe<T>): string {
  if (!probe.ok) return `<error: ${probe.error}>`;
  return formatValue(probe.value);
}

function formatValue(value: unknown): string {
  return typeof value === 'object' ? JSON.stringify(value) : String(value);
}
