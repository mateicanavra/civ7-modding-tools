import { Command, Flags } from '@oclif/core';
import {
  getCiv7BattlefieldScan,
  getCiv7PlayNotificationView,
  getCiv7ReadyUnitView,
} from '@civ7/direct-control';
import { buildDirectControlOptions } from '../../../utils/game-play-shared';

type Location = Readonly<{ x: number; y: number }>;

type FormationPosture =
  | 'screen-civilian'
  | 'hold-ready-unit'
  | 'stabilize-front'
  | 'advance-with-validation'
  | 'inspect-ready-unit';

type FormationUnit = Readonly<{
  id: unknown;
  owner: unknown;
  stance: string;
  role: string;
  typeName: string | null;
  location: Location | null;
  distance: number | null;
  evidence: unknown;
}>;

type FormationSnapshot = Readonly<{
  posture: FormationPosture;
  headline: string;
  reasons: ReadonlyArray<string>;
  civilians: ReadonlyArray<FormationUnit>;
  screens: ReadonlyArray<FormationUnit>;
  otherOwnerContacts: ReadonlyArray<FormationUnit>;
  nearbyContacts: ReadonlyArray<FormationUnit>;
  /**
   * @deprecated Compatibility alias for older callers. Other-owner proximity
   * does not prove threat/hostility without relationship or validator proof.
   */
  threats: ReadonlyArray<FormationUnit>;
  nextInspections: ReadonlyArray<string>;
}>;

export default class GamePlayFormationSnapshot extends Command {
  static id = 'game play formation-snapshot';
  static summary = 'Read ready-unit formation, escort, and civilian-screen context';
  static description =
    'Composes the current ready unit and a bounded battlefield scan into a read-only formation snapshot for escort, screen, and tactical movement decisions.';

  static examples = [
    '<%= config.bin %> game play formation-snapshot --json',
    '<%= config.bin %> game play formation-snapshot --x 20 --y 18 --radius 6 --json',
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
      description: 'Formation origin x coordinate. Defaults to the first ready unit location.',
      dependsOn: ['y'],
    }),
    y: Flags.integer({
      description: 'Formation origin y coordinate. Defaults to the first ready unit location.',
      dependsOn: ['x'],
    }),
    radius: Flags.integer({
      description: 'Battlefield scan radius around the formation origin',
      default: 6,
      min: 1,
      max: 16,
    }),
    'screen-radius': Flags.integer({
      description: 'Maximum grid distance for friendly units to count as local screens near a civilian',
      default: 2,
      min: 1,
      max: 6,
    }),
    'contact-radius': Flags.integer({
      description: 'Maximum grid distance for other-owner units to count as immediate civilian contacts. Defaults to 4.',
      min: 1,
      max: 8,
    }),
    'threat-radius': Flags.integer({
      description: 'Deprecated compatibility alias for --contact-radius',
      min: 1,
      max: 8,
      hidden: true,
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
    const { flags } = await this.parse(GamePlayFormationSnapshot);
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
    const battlefield = await getCiv7BattlefieldScan({
      playerId: flags['player-id'],
      origins: origin ? [origin] : undefined,
      radius: flags.radius,
      maxUnits: flags['max-units'],
      maxCities: flags['max-cities'],
    }, options);
    const snapshot = buildFormationSnapshot({
      origin,
      readyUnit,
      battlefield,
      screenRadius: flags['screen-radius'],
      contactRadius: flags['contact-radius'] ?? flags['threat-radius'] ?? 4,
    });
    const view = {
      localPlayerId: hud.localPlayerId,
      turn: hud.turn,
      turnDate: hud.turnDate,
      blocker: hud.blocker,
      nextDecision: hud.hud?.nextDecision ?? null,
      origin,
      readyUnit: readyUnit
        ? {
            unitId: readyUnit.unitId,
            unit: readyUnit.unit,
            legalOperationScope: 'no-target',
            legalNoTargetOperationCount: readyUnit.legalOperations.length,
          }
        : null,
      battlefield,
      formation: snapshot,
      notes: [
        'Read-only formation snapshot; it does not move, attack, found, or reserve routes.',
        'Use this lens to decide what to inspect next, then validate concrete plot actions with game play unit-target.',
        'Battlefield scan distances are cheap grid heuristics and may include debug-visible entities unless paired with visibility reads.',
      ],
    };

    if (flags.json) {
      this.log(JSON.stringify({ ok: true, view }));
      return;
    }

    this.log(snapshot.headline);
    this.log(`Posture: ${snapshot.posture}`);
    for (const reason of snapshot.reasons) this.log(`Reason: ${reason}`);
    for (const command of snapshot.nextInspections) this.log(`Next: ${command}`);
  }
}

function buildFormationSnapshot(input: {
  origin: Location | null;
  readyUnit: Awaited<ReturnType<typeof getCiv7ReadyUnitView>> | null;
  battlefield: Awaited<ReturnType<typeof getCiv7BattlefieldScan>>;
  screenRadius: number;
  contactRadius: number;
}): FormationSnapshot {
  const units = asRecords(input.battlefield.units).map(toFormationUnit);
  const civilians = units.filter((unit) => unit.stance === 'friendly' && unit.role === 'civilian');
  const friendlies = units.filter((unit) => unit.stance === 'friendly' && unit.role !== 'civilian');
  const otherOwnerContacts = units.filter((unit) => unit.stance !== 'friendly');
  const screens = friendlies.filter((unit) =>
    civilians.some((civilian) => civilian.location && unit.location && gridDistance(civilian.location, unit.location) <= input.screenRadius),
  );
  const nearbyContacts = otherOwnerContacts.filter((unit) =>
    civilians.some((civilian) => civilian.location && unit.location && gridDistance(civilian.location, unit.location) <= input.contactRadius),
  );
  const poiReasons = pointReasons(input.battlefield.pointsOfInterest);
  const ready = readyUnitSummary(input.readyUnit);
  const posture = postureFor({ civilians, screens, nearbyContacts, poiReasons, readyUnit: input.readyUnit });
  const originLabel = input.origin ? `(${input.origin.x},${input.origin.y})` : '<unknown origin>';
  const headline = `${ready} formation at ${originLabel}: ${civilians.length} civilians, ${screens.length} local screens, ${nearbyContacts.length} nearby other-owner contacts`;
  return {
    posture,
    headline,
    reasons: uniqueStrings([
      ...poiReasons,
      ...civilianContactReasons(civilians, nearbyContacts),
      ...screenReasons(civilians, screens),
    ]).slice(0, 10),
    civilians,
    screens,
    otherOwnerContacts,
    nearbyContacts,
    threats: nearbyContacts,
    nextInspections: nextInspectionCommands(input.origin, civilians, nearbyContacts, posture),
  };
}

function postureFor(input: {
  civilians: ReadonlyArray<FormationUnit>;
  screens: ReadonlyArray<FormationUnit>;
  nearbyContacts: ReadonlyArray<FormationUnit>;
  poiReasons: ReadonlyArray<string>;
  readyUnit: Awaited<ReturnType<typeof getCiv7ReadyUnitView>> | null;
}): FormationPosture {
  if (!input.readyUnit) return 'inspect-ready-unit';
  if (input.civilians.length > 0 && input.nearbyContacts.length > 0) return 'screen-civilian';
  if (input.civilians.length > 0 && input.screens.length === 0) return 'hold-ready-unit';
  if (input.poiReasons.some((reason) =>
    reason.includes('nearby-other-owners')
    || reason.includes('nearby-opponents')
    || reason.includes('owner-pressure')
  )) return 'stabilize-front';
  return 'advance-with-validation';
}

function toFormationUnit(unit: Record<string, unknown>): FormationUnit {
  return {
    id: unit.id ?? null,
    owner: unit.owner ?? null,
    stance: typeof unit.stance === 'string' ? unit.stance : 'unknown',
    role: typeof unit.role === 'string' ? unit.role : 'unknown',
    typeName: typeof unit.typeName === 'string' ? unit.typeName : null,
    location: getLocation(unit.location),
    distance: typeof unit.distance === 'number' ? unit.distance : null,
    evidence: unit,
  };
}

function pointReasons(value: unknown): string[] {
  return asRecords(value).map((point) => {
    const severity = String(point.severity ?? 'medium');
    const kind = String(point.kind ?? 'point-of-interest');
    const summary = String(point.summary ?? kind);
    return `${severity} ${kind}: ${summary}`;
  });
}

function civilianContactReasons(civilians: ReadonlyArray<FormationUnit>, nearbyContacts: ReadonlyArray<FormationUnit>): string[] {
  if (civilians.length === 0 || nearbyContacts.length === 0) return [];
  return civilians.map((civilian) => {
    const location = civilian.location ? `(${civilian.location.x},${civilian.location.y})` : '<unknown>';
    return `${civilian.typeName ?? 'civilian'} at ${location} has ${nearbyContacts.length} other-owner units within contact radius`;
  });
}

function screenReasons(civilians: ReadonlyArray<FormationUnit>, screens: ReadonlyArray<FormationUnit>): string[] {
  if (civilians.length === 0) return [];
  if (screens.length === 0) return ['no friendly screen units are within local screen radius of the civilian'];
  return [`${screens.length} friendly screen units are within local screen radius of the civilian`];
}

function nextInspectionCommands(
  origin: Location | null,
  civilians: ReadonlyArray<FormationUnit>,
  nearbyContacts: ReadonlyArray<FormationUnit>,
  posture: FormationPosture,
): string[] {
  const commands = ['game play priorities --json', 'game play ready-unit --json'];
  if (origin) commands.push(`game play battlefield-scan --x ${origin.x} --y ${origin.y} --json`);
  const civilian = civilians.find((unit) => unit.location);
  if (civilian?.location) commands.push(`game play civilian-route-triage --x ${civilian.location.x} --y ${civilian.location.y} --json`);
  const contact = nearbyContacts.find((unit) => unit.location);
  if (contact?.location) commands.push(`game play battlefield-scan --x ${contact.location.x} --y ${contact.location.y} --json`);
  if (posture === 'screen-civilian' || posture === 'stabilize-front') {
    commands.push("game play unit-target --unit-id '<unit-id>' --x <screen-or-contact-x> --y <screen-or-contact-y> --json");
  } else {
    commands.push("game play unit-target --unit-id '<unit-id>' --x <x> --y <y> --json");
  }
  return uniqueStrings(commands);
}

function readyUnitSummary(readyUnit: Awaited<ReturnType<typeof getCiv7ReadyUnitView>> | null): string {
  const unit = readyUnit ? probeValue(readyUnit.unit) as { typeName?: string } | null : null;
  return unit?.typeName ?? 'ready unit';
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

function gridDistance(left: Location, right: Location): number {
  return Math.max(Math.abs(left.x - right.x), Math.abs(left.y - right.y));
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
