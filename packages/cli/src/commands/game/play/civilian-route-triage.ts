import { Command, Flags } from '@oclif/core';
import {
  getCiv7BattlefieldScan,
  getCiv7DestinationAnalysis,
  getCiv7PlayNotificationView,
  getCiv7ReadyUnitView,
  getCiv7SettlementRecommendations,
} from '@civ7/direct-control';
import { buildDirectControlOptions } from '../../../utils/game-play-shared';

type Location = Readonly<{ x: number; y: number }>;

type TriageStatus = 'proceed-with-validation' | 'hold-or-screen' | 'reroute-or-stage' | 'inspect-candidate';

type CivilianRouteTriage = Readonly<{
  status: TriageStatus;
  summary: string;
  reasons: ReadonlyArray<string>;
  nextInspections: ReadonlyArray<string>;
}>;

export default class GamePlayCivilianRouteTriage extends Command {
  static id = 'game play civilian-route-triage';
  static summary = 'Read civilian route risk from settlement, battlefield, and destination lenses';
  static description =
    'Composes ready-unit, settlement recommendation, battlefield, and destination/corridor reads into a read-only triage for Settler or civilian movement.';

  static examples = [
    '<%= config.bin %> game play civilian-route-triage --json',
    '<%= config.bin %> game play civilian-route-triage --x 18 --y 16 --json',
    '<%= config.bin %> game play civilian-route-triage --x 18 --y 16 --to-x 20 --to-y 20 --json',
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
    x: Flags.integer({
      description: 'Civilian or Settler origin x coordinate. Defaults to the first ready unit when omitted.',
      dependsOn: ['y'],
    }),
    y: Flags.integer({
      description: 'Civilian or Settler origin y coordinate. Defaults to the first ready unit when omitted.',
      dependsOn: ['x'],
    }),
    'to-x': Flags.integer({
      description: 'Optional candidate destination x coordinate. Defaults to the first settlement recommendation when available.',
      dependsOn: ['to-y'],
    }),
    'to-y': Flags.integer({
      description: 'Optional candidate destination y coordinate. Defaults to the first settlement recommendation when available.',
      dependsOn: ['to-x'],
    }),
    count: Flags.integer({
      description: 'Maximum settlement recommendation count for the origin',
      default: 5,
      min: 1,
      max: 12,
    }),
    radius: Flags.integer({
      description: 'Battlefield scan radius around the civilian origin',
      default: 6,
      min: 1,
      max: 16,
    }),
    'corridor-radius': Flags.integer({
      description: 'Grid radius around the candidate route corridor to inspect',
      default: 2,
      min: 0,
      max: 8,
    }),
    'destination-radius': Flags.integer({
      description: 'Grid radius around the candidate destination to inspect',
      default: 4,
      min: 1,
      max: 16,
    }),
    'max-units': Flags.integer({
      description: 'Maximum nearby unit summaries to return',
      default: 96,
    }),
    'max-cities': Flags.integer({
      description: 'Maximum nearby city summaries to return',
      default: 40,
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
    const { flags } = await this.parse(GamePlayCivilianRouteTriage);
    const options = buildDirectControlOptions(flags);
    const hud = await getCiv7PlayNotificationView({
      ...options,
      maxNotifications: 10,
    });
    const requestedOrigin = flags.x === undefined || flags.y === undefined ? null : { x: flags.x, y: flags.y };
    const readyUnitId = probeValue(hud.firstReadyUnitId);
    const readyUnit = requestedOrigin || !readyUnitId
      ? null
      : await getCiv7ReadyUnitView({ unitId: readyUnitId, radius: 2 }, options);
    const origin = requestedOrigin ?? getReadyUnitLocation(readyUnit);
    const locations = origin ? [origin] : undefined;
    const settlement = await getCiv7SettlementRecommendations({
      playerId: flags['player-id'],
      locations,
      count: flags.count,
      includeSettlers: !origin,
      includeCities: false,
    }, options);
    const requestedDestination = flags['to-x'] === undefined || flags['to-y'] === undefined
      ? null
      : { x: flags['to-x'], y: flags['to-y'] };
    const destination = requestedDestination ?? getFirstSettlementSuggestion(settlement);
    const battlefield = await getCiv7BattlefieldScan({
      playerId: flags['player-id'],
      origins: locations,
      radius: flags.radius,
      maxUnits: flags['max-units'],
      maxCities: flags['max-cities'],
    }, options);
    const destinationAnalysis = origin && destination
      ? await getCiv7DestinationAnalysis({
          playerId: flags['player-id'],
          origin,
          destination,
          corridorRadius: flags['corridor-radius'],
          destinationRadius: flags['destination-radius'],
          maxUnits: flags['max-units'],
          maxCities: flags['max-cities'],
        }, options)
      : null;
    const triage = buildTriage({ origin, destination, battlefield, destinationAnalysis });
    const view = {
      localPlayerId: hud.localPlayerId,
      turn: hud.turn,
      turnDate: hud.turnDate,
      blocker: hud.blocker,
      nextDecision: hud.hud?.nextDecision ?? null,
      origin,
      destination,
      readyUnit: readyUnit
        ? {
            unitId: readyUnit.unitId,
            unit: readyUnit.unit,
            legalOperationScope: 'no-target',
            legalNoTargetOperationCount: readyUnit.legalOperations.length,
          }
        : null,
      settlement,
      battlefield,
      destinationAnalysis,
      triage,
      notes: [
        'Read-only civilian route triage; it does not move, found, buy, or reserve routes.',
        'Settlement recommendations are site hints, not movement orders.',
        'Use unit-target or operation validation for any concrete move after re-reading the ready unit.',
      ],
    };

    if (flags.json) {
      this.log(JSON.stringify({ ok: true, view }));
      return;
    }

    this.log(triage.summary);
    this.log(`Status: ${triage.status}`);
    for (const reason of triage.reasons) this.log(`Reason: ${reason}`);
    for (const command of triage.nextInspections) this.log(`Next: ${command}`);
  }
}

function buildTriage(input: {
  origin: Location | null;
  destination: Location | null;
  battlefield: Awaited<ReturnType<typeof getCiv7BattlefieldScan>>;
  destinationAnalysis: Awaited<ReturnType<typeof getCiv7DestinationAnalysis>> | null;
}): CivilianRouteTriage {
  const reasons = [
    ...pointReasons(input.battlefield.pointsOfInterest, 'local'),
    ...pointReasons(input.destinationAnalysis?.pointsOfInterest, 'route'),
    ...destinationPressureReasons(input.destinationAnalysis),
  ];
  const hasCivilianRisk = reasons.some((reason) => reason.includes('civilian-risk'));
  const hasHighRouteRisk = reasons.some((reason) => reason.includes('high route') || reason.includes('high local'));
  const status: TriageStatus = !input.destination
    ? 'inspect-candidate'
    : hasCivilianRisk
      ? 'hold-or-screen'
      : hasHighRouteRisk
        ? 'reroute-or-stage'
        : 'proceed-with-validation';
  const originLabel = input.origin ? `(${input.origin.x},${input.origin.y})` : '<unknown origin>';
  const destinationLabel = input.destination ? `(${input.destination.x},${input.destination.y})` : '<no candidate destination>';
  return {
    status,
    summary: `civilian route ${originLabel} -> ${destinationLabel}`,
    reasons: uniqueStrings(reasons).slice(0, 10),
    nextInspections: nextInspectionCommands(input.origin, input.destination, status),
  };
}

function pointReasons(value: unknown, scope: string): string[] {
  return asRecords(value).map((point) => {
    const severity = String(point.severity ?? 'medium');
    const kind = String(point.kind ?? 'point-of-interest');
    const summary = String(point.summary ?? kind);
    return `${severity} ${scope} ${kind}: ${summary}`;
  });
}

function destinationPressureReasons(destination: Awaited<ReturnType<typeof getCiv7DestinationAnalysis>> | null): string[] {
  const pressure = destination?.destinationPressure as { unitCount?: unknown; cityCount?: unknown; apparentOtherStrength?: unknown } | undefined;
  const reasons: string[] = [];
  if (typeof pressure?.unitCount === 'number' && pressure.unitCount > 0) {
    reasons.push(`${pressure.unitCount} non-friendly units near candidate destination`);
  }
  if (typeof pressure?.cityCount === 'number' && pressure.cityCount > 0) {
    reasons.push(`${pressure.cityCount} non-friendly cities near candidate destination`);
  }
  if (typeof pressure?.apparentOtherStrength === 'number' && pressure.apparentOtherStrength > 0) {
    reasons.push(`apparent candidate pressure ${pressure.apparentOtherStrength}`);
  }
  return reasons;
}

function nextInspectionCommands(origin: Location | null, destination: Location | null, status: TriageStatus): string[] {
  const commands: string[] = ['game play priorities --json'];
  if (origin) commands.push(`game play battlefield-scan --x ${origin.x} --y ${origin.y} --json`);
  if (origin) commands.push(`game play settlement-recommendations --x ${origin.x} --y ${origin.y} --json`);
  if (origin && destination) {
    commands.push(`game play destination-analysis --from-x ${origin.x} --from-y ${origin.y} --to-x ${destination.x} --to-y ${destination.y} --json`);
  }
  if (status === 'hold-or-screen' || status === 'reroute-or-stage') {
    commands.push('game play front-summary --x <screen-x> --y <screen-y> --json');
  }
  commands.push("game play ready-unit --json");
  commands.push("game play unit-target --unit-id '<unit-id>' --x <x> --y <y> --json");
  return uniqueStrings(commands);
}

function getFirstSettlementSuggestion(settlement: Awaited<ReturnType<typeof getCiv7SettlementRecommendations>>): Location | null {
  for (const recommendation of settlement.recommendations) {
    const suggestions = probeValue(recommendation.suggestions);
    for (const suggestion of asRecords(suggestions)) {
      const location = getLocation(suggestion.location);
      if (location) return location;
    }
  }
  return null;
}

function getReadyUnitLocation(readyUnit: Awaited<ReturnType<typeof getCiv7ReadyUnitView>> | null): Location | null {
  const unit = readyUnit ? probeValue(readyUnit.unit) as { location?: unknown } | null : null;
  return getLocation(unit?.location);
}

function getLocation(value: unknown): Location | null {
  const location = asRecord(value);
  return typeof location?.x === 'number' && typeof location.y === 'number'
    ? { x: location.x, y: location.y }
    : null;
}

function probeValue<T>(probe: { ok: true; value: T } | { ok: false; error: string } | null | undefined): T | null {
  return probe?.ok ? probe.value : null;
}

function asRecords(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => item !== null && typeof item === 'object') : [];
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' ? value as Record<string, unknown> : null;
}

function uniqueStrings(values: ReadonlyArray<string>): string[] {
  return [...new Set(values.filter((value) => value.length > 0))];
}
