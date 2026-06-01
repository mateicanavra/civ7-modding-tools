import { Command, Flags } from '@oclif/core';
import {
  getCiv7BattlefieldScan,
  getCiv7DestinationAnalysis,
  getCiv7PlayNotificationView,
  getCiv7ReadyUnitView,
  getCiv7TargetCandidates,
} from '@civ7/direct-control';
import { buildDirectControlOptions, resolveCoordinateFlags } from '../../../utils/game-play-shared';

type Location = Readonly<{ x: number; y: number }>;

type FrontPressure = Readonly<{
  kind: string;
  severity: string;
  summary: string;
  location: Location | null;
  source: string;
  evidence: unknown;
}>;

type FrontSummary = Readonly<{
  posture: string;
  headline: string;
  risks: ReadonlyArray<string>;
  nextInspections: ReadonlyArray<string>;
  pressure: ReadonlyArray<FrontPressure>;
}>;

export default class GamePlayFrontSummary extends Command {
  static id = 'game play front-summary';
  static summary = 'Read a composed front and formation summary without sending operations';
  static description =
    'Composes live target candidates, battlefield pressure, and optional destination/corridor analysis into a read-only front summary for military planning.';

  static examples = [
    '<%= config.bin %> game play front-summary --json',
    '<%= config.bin %> game play front-summary --x 15 --y 21 --json',
    '<%= config.bin %> game play front-summary --x 15 --y 21 --to-x 13 --to-y 17 --json',
    '<%= config.bin %> game play front-summary --origin 15,21 --destination 13,17 --json',
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
      description: 'Formation, siege line, or ready-unit origin x coordinate',
      dependsOn: ['y'],
    }),
    y: Flags.integer({
      description: 'Formation, siege line, or ready-unit origin y coordinate',
      dependsOn: ['x'],
    }),
    origin: Flags.string({
      description: 'Formation, siege line, or ready-unit origin as x,y',
    }),
    'to-x': Flags.integer({
      description: 'Optional intended target/front x coordinate. Defaults to the nearest target candidate city when available.',
      dependsOn: ['to-y'],
    }),
    'to-y': Flags.integer({
      description: 'Optional intended target/front y coordinate. Defaults to the nearest target candidate city when available.',
      dependsOn: ['to-x'],
    }),
    destination: Flags.string({
      description: 'Optional intended target/front as x,y. Defaults to the nearest target candidate city when available.',
    }),
    'target-x': Flags.integer({
      description: 'Alias for --to-x',
      dependsOn: ['target-y'],
    }),
    'target-y': Flags.integer({
      description: 'Alias for --to-y',
      dependsOn: ['target-x'],
    }),
    radius: Flags.integer({
      description: 'Battlefield scan radius around the front origin',
      default: 8,
      min: 1,
      max: 32,
    }),
    'corridor-radius': Flags.integer({
      description: 'Grid radius around the intended front corridor to inspect',
      default: 2,
      min: 0,
      max: 8,
    }),
    'destination-radius': Flags.integer({
      description: 'Grid radius around the intended target/front endpoint to inspect',
      default: 4,
      min: 1,
      max: 16,
    }),
    'max-candidates': Flags.integer({
      description: 'Maximum target candidates to return',
      default: 5,
    }),
    'max-players': Flags.integer({
      description: 'Maximum alive players to inspect',
      default: 32,
    }),
    'max-units': Flags.integer({
      description: 'Maximum nearby unit summaries to return',
      default: 96,
    }),
    'max-cities': Flags.integer({
      description: 'Maximum nearby city summaries to return',
      default: 40,
    }),
    'unit-radius': Flags.integer({
      description: 'Radius around target cities for apparent unit density',
      default: 4,
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
    const { flags } = await this.parse(GamePlayFrontSummary);
    const options = buildDirectControlOptions(flags);
    const hud = await getCiv7PlayNotificationView({
      ...options,
      maxNotifications: 10,
    });
    const requestedOrigin = resolveCoordinateFlags({
      x: flags.x,
      y: flags.y,
      pair: flags.origin,
      xFlag: 'x',
      yFlag: 'y',
      pairFlag: 'origin',
    }) ?? null;
    const readyUnitId = probeValue(hud.firstReadyUnitId);
    const readyUnit = requestedOrigin || !readyUnitId
      ? null
      : await getCiv7ReadyUnitView({ unitId: readyUnitId, radius: 2 }, options);
    const inferredOrigin = requestedOrigin ?? getReadyUnitLocation(readyUnit);
    const origins = inferredOrigin ? [inferredOrigin] : undefined;
    const targetCandidates = await getCiv7TargetCandidates({
      playerId: flags['player-id'],
      origins,
      maxCandidates: flags['max-candidates'],
      maxPlayers: flags['max-players'],
      unitRadius: flags['unit-radius'],
    }, options);
    const requestedTarget = resolveFrontTarget(flags);
    const target = requestedTarget ?? getFirstCandidateCityLocation(targetCandidates.candidates);
    const battlefield = await getCiv7BattlefieldScan({
      playerId: flags['player-id'],
      origins,
      radius: flags.radius,
      maxPlayers: flags['max-players'],
      maxUnits: flags['max-units'],
      maxCities: flags['max-cities'],
    }, options);
    const destination = target
      ? await getCiv7DestinationAnalysis({
          playerId: flags['player-id'],
          origin: inferredOrigin ?? undefined,
          destination: target,
          corridorRadius: flags['corridor-radius'],
          destinationRadius: flags['destination-radius'],
          maxPlayers: flags['max-players'],
          maxUnits: flags['max-units'],
          maxCities: flags['max-cities'],
        }, options)
      : null;
    const summary = buildFrontSummary({
      origin: inferredOrigin,
      target,
      targetCandidates,
      battlefield,
      destination,
    });
    const view = {
      localPlayerId: hud.localPlayerId,
      turn: hud.turn,
      turnDate: hud.turnDate,
      blocker: hud.blocker,
      nextDecision: hud.hud?.nextDecision ?? null,
      origin: inferredOrigin,
      target,
      readyUnit: readyUnit
        ? {
            unitId: readyUnit.unitId,
            unit: readyUnit.unit,
            legalOperationScope: 'no-target',
            legalNoTargetOperationCount: readyUnit.legalOperations.length,
          }
        : null,
      targetCandidates,
      battlefield,
      destination,
      summary,
      notes: [
        'Read-only front summary; it does not move units, attack, declare war, or choose strategy.',
        'Use this to pick the next inspection, then validate concrete unit actions with game play unit-target or operation.',
        'Distances and corridors are cheap grid heuristics and may include debug-visible entities until paired with visibility reads.',
      ],
    };

    if (flags.json) {
      this.log(JSON.stringify({ ok: true, view }));
      return;
    }

    this.log(summary.headline);
    this.log(`Posture: ${summary.posture}`);
    for (const risk of summary.risks) this.log(`Risk: ${risk}`);
    for (const item of summary.pressure.slice(0, 8)) {
      this.log(`- [${item.severity}] ${item.kind}: ${item.summary}`);
    }
    for (const command of summary.nextInspections) this.log(`Next: ${command}`);
  }
}

function buildFrontSummary(input: {
  origin: Location | null;
  target: Location | null;
  targetCandidates: Awaited<ReturnType<typeof getCiv7TargetCandidates>>;
  battlefield: Awaited<ReturnType<typeof getCiv7BattlefieldScan>>;
  destination: Awaited<ReturnType<typeof getCiv7DestinationAnalysis>> | null;
}): FrontSummary {
  const candidate = input.targetCandidates.candidates[0];
  const pressure = [
    ...frontPressure(input.battlefield.pointsOfInterest, 'battlefield'),
    ...frontPressure(input.destination?.pointsOfInterest, 'destination'),
  ].sort((a, b) => severityRank(b.severity) - severityRank(a.severity));
  const highPressure = pressure.filter((item) => item.severity === 'high');
  const risks = [
    ...highPressure.map((item) => item.summary),
    ...unsupportedDestinationRisks(input.destination),
  ];
  const targetLabel = input.target
    ? `target/front (${input.target.x},${input.target.y})`
    : 'no target/front selected';
  const originLabel = input.origin
    ? `origin (${input.origin.x},${input.origin.y})`
    : 'inferred runtime origins';
  const candidateLabel = candidate
    ? `owner ${candidate.owner}${candidate.nearestCity ? ` near ${formatCity(candidate.nearestCity)}` : ''}`
    : 'no ranked target candidate';
  const posture = postureFromPressure(pressure, input.destination);
  const nextInspections = nextInspectionCommands(input.origin, input.target, pressure);
  return {
    posture,
    headline: `${originLabel} toward ${targetLabel}; leading candidate: ${candidateLabel}`,
    risks: uniqueStrings(risks).slice(0, 8),
    nextInspections,
    pressure,
  };
}

function frontPressure(value: unknown, source: string): FrontPressure[] {
  return asRecords(value).map((point) => {
    const location = getLocation(point.location);
    return {
      kind: String(point.kind ?? 'point-of-interest'),
      severity: String(point.severity ?? 'medium'),
      summary: String(point.summary ?? point.kind ?? 'front pressure'),
      location,
      source,
      evidence: point,
    };
  });
}

function unsupportedDestinationRisks(destination: Awaited<ReturnType<typeof getCiv7DestinationAnalysis>> | null): string[] {
  const destinationPressure = destination?.destinationPressure as { unitCount?: unknown; cityCount?: unknown; apparentOtherStrength?: unknown } | undefined;
  const risks: string[] = [];
  if (typeof destinationPressure?.unitCount === 'number' && destinationPressure.unitCount > 0) {
    risks.push(`${destinationPressure.unitCount} non-friendly units near intended front`);
  }
  if (typeof destinationPressure?.cityCount === 'number' && destinationPressure.cityCount > 0) {
    risks.push(`${destinationPressure.cityCount} non-friendly cities near intended front`);
  }
  if (typeof destinationPressure?.apparentOtherStrength === 'number' && destinationPressure.apparentOtherStrength > 0) {
    risks.push(`apparent destination pressure ${destinationPressure.apparentOtherStrength}`);
  }
  return risks;
}

function nextInspectionCommands(origin: Location | null, target: Location | null, pressure: ReadonlyArray<FrontPressure>): string[] {
  const commands: string[] = ['game play priorities --json'];
  if (origin) commands.push(`game play battlefield-scan --x ${origin.x} --y ${origin.y} --json`);
  if (origin && target) {
    commands.push(`game play destination-analysis --from-x ${origin.x} --from-y ${origin.y} --to-x ${target.x} --to-y ${target.y} --json`);
  }
  const highestLocated = pressure.find((item) => item.location);
  if (highestLocated?.location) {
    commands.push(`game play battlefield-scan --x ${highestLocated.location.x} --y ${highestLocated.location.y} --json`);
  }
  commands.push("game play ready-unit --json");
  commands.push("game play unit-target --unit-id '<unit-id>' --x <x> --y <y> --json");
  return uniqueStrings(commands);
}

function postureFromPressure(
  pressure: ReadonlyArray<FrontPressure>,
  destination: Awaited<ReturnType<typeof getCiv7DestinationAnalysis>> | null,
): string {
  if (pressure.some((item) => item.kind === 'civilian-risk' && item.severity === 'high')) return 'screen-civilians-before-advance';
  if (pressure.some((item) => item.kind === 'nearby-opponents' && item.severity === 'high')) return 'stabilize-front-before-committing-siege';
  const destinationPressure = destination?.destinationPressure as { unitCount?: unknown; cityCount?: unknown } | undefined;
  if ((Number(destinationPressure?.unitCount) || 0) > 0 || (Number(destinationPressure?.cityCount) || 0) > 0) {
    return 'stage-before-entering-target-pressure';
  }
  return 'inspect-and-advance-cautiously';
}

function severityRank(severity: string): number {
  if (severity === 'high') return 3;
  if (severity === 'medium') return 2;
  if (severity === 'low') return 1;
  return 0;
}

function getCandidateCityLocation(candidate: unknown): Location | null {
  const record = asRecord(candidate);
  const city = asRecord(record?.nearestCity);
  return getLocation(city?.location);
}

function getFirstCandidateCityLocation(candidates: ReadonlyArray<unknown>): Location | null {
  for (const candidate of candidates) {
    const location = getCandidateCityLocation(candidate);
    if (location) return location;
  }
  return null;
}

function resolveFrontTarget(flags: {
  'to-x'?: number;
  'to-y'?: number;
  'target-x'?: number;
  'target-y'?: number;
  destination?: string;
}): Location | null {
  const hasTo = flags['to-x'] !== undefined || flags['to-y'] !== undefined;
  const hasTarget = flags['target-x'] !== undefined || flags['target-y'] !== undefined;
  if (hasTo && hasTarget) {
    throw new Error('--target-x/--target-y cannot be combined with --to-x/--to-y');
  }
  return resolveCoordinateFlags({
    x: hasTarget ? flags['target-x'] : flags['to-x'],
    y: hasTarget ? flags['target-y'] : flags['to-y'],
    pair: flags.destination,
    xFlag: hasTarget ? 'target-x' : 'to-x',
    yFlag: hasTarget ? 'target-y' : 'to-y',
    pairFlag: 'destination',
  }) ?? null;
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

function formatCity(city: unknown): string {
  const record = asRecord(city);
  const name = typeof record?.name === 'string' ? record.name : 'city';
  const location = getLocation(record?.location);
  return location ? `${name} (${location.x},${location.y})` : name;
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
