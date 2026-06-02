import { Command, Flags } from '@oclif/core';
import {
  getCiv7BattlefieldScan,
  getCiv7PlayNotificationView,
  getCiv7ReadyCityView,
  getCiv7ReadyUnitView,
} from '@civ7/direct-control';
import { buildDirectControlOptions } from '../../../utils/game-play-shared';

type PriorityItem = {
  priority: number;
  kind: string;
  summary: string;
  reason: string;
  command?: string;
  evidence?: unknown;
};

export default class GamePlayPriorities extends Command {
  static id = 'game play priorities';
  static summary = 'Read a turn-priority dashboard without sending operations';
  static description =
    'Composes the live HUD, ready unit/city views, and an optional bounded battlefield scan into a read-only priority list for deciding what to inspect next.';

  static examples = [
    '<%= config.bin %> game play priorities --json',
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
    const view = {
      localPlayerId: hud.localPlayerId,
      turn: hud.turn,
      turnDate: hud.turnDate,
      blocker: hud.blocker,
      canEndTurn: hud.canEndTurn,
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
      this.log(JSON.stringify({ ok: true, view }));
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
      command: 'game play rehydrate --json; game watch --count 1 --include-ready-unit --include-ready-city --jsonl',
      evidence: runtimeErrors,
    });
  }

  const nextDecision = input.hud.hud?.nextDecision;
  if (nextDecision) {
    const isBlocking = nextDecision.isEndTurnBlocking ? 100 : 70;
    items.push({
      priority: isBlocking,
      kind: `hud:${nextDecision.category}`,
      summary: nextDecision.summary ?? nextDecision.message ?? nextDecision.typeName ?? 'current HUD decision',
      reason: 'HUD decisions are the shortest-lived live authority and should be resolved or consciously deferred before broad strategy.',
      command: nextDecision.cli,
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
      command: battlefieldCommandFor(point),
      evidence: point,
    });
  }

  if (items.length === 0) {
    items.push({
      priority: 10,
      kind: 'clean-read',
      summary: 'no HUD, ready-unit, ready-city, or battlefield priority surfaced',
      reason: 'Fresh clean reads can support end-turn or autoplay only after a final blocker check.',
      command: 'game play end-turn --json',
    });
  }

  return items.sort((a, b) => b.priority - a.priority);
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

function formatProbe<T>(probe: { ok: true; value: T } | { ok: false; error: string }): string {
  if (!probe.ok) return `<error: ${probe.error}>`;
  return typeof probe.value === 'object' ? JSON.stringify(probe.value) : String(probe.value);
}
