import { Command, Flags } from '@oclif/core';
import {
  createCiv7ControlOrpcServerClient,
  type Civ7StrategyCivilianRouteTriageResult,
} from '@civ7/control-orpc';
import { liveCiv7ControlOrpcDirectControlFacade } from '@civ7/control-orpc/runtime';
import { buildDirectControlOptions } from '../../../utils/game-play-shared';

type Location = Readonly<{ x: number; y: number }>;
type TriageNextStep = Civ7StrategyCivilianRouteTriageResult['nextSteps'][number];
type CivilianRouteTriageCliView = Omit<Civ7StrategyCivilianRouteTriageResult, 'triage'> & {
  triage: Civ7StrategyCivilianRouteTriageResult['triage'] & {
    nextInspections: string[];
  };
};

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
    const origin = flags.x === undefined || flags.y === undefined
      ? undefined
      : { x: flags.x, y: flags.y };
    const destination = flags['to-x'] === undefined || flags['to-y'] === undefined
      ? undefined
      : { x: flags['to-x'], y: flags['to-y'] };
    const client = createCiv7ControlOrpcServerClient({
      directControl: liveCiv7ControlOrpcDirectControlFacade,
      endpointDefaults: buildDirectControlOptions(flags),
    });
    const result = await client.strategy.civilianRouteTriage({
      playerId: flags['player-id'],
      origin,
      destination,
      settlementCount: flags.count,
      scanRadius: flags.radius,
      corridorRadius: flags['corridor-radius'],
      destinationRadius: flags['destination-radius'],
      maxUnits: flags['max-units'],
      maxCities: flags['max-cities'],
    });
    const view = buildCliView(result);

    if (flags.json) {
      this.log(JSON.stringify({ ok: true, view }));
      return;
    }

    this.log(view.triage.summary);
    this.log(`Status: ${view.triage.status}`);
    for (const reason of view.triage.reasons) this.log(`Reason: ${reason}`);
    for (const command of view.triage.nextInspections) this.log(`Next: ${command}`);
  }
}

function buildCliView(
  result: Civ7StrategyCivilianRouteTriageResult,
): CivilianRouteTriageCliView {
  return {
    ...result,
    triage: {
      ...result.triage,
      nextInspections: result.nextSteps
        .map(commandForNextStep)
        .filter((item): item is string => item != null),
    },
  };
}

function commandForNextStep(step: TriageNextStep): string | null {
  switch (step.kind) {
    case 'read-priorities':
      return 'game play priorities --json';
    case 'inspect-battlefield':
      return step.parameters.origin == null
        ? 'game play battlefield-scan --json'
        : `game play battlefield-scan ${locationFlags(step.parameters.origin)} --json`;
    case 'inspect-settlement':
      return step.parameters.origin == null
        ? 'game play settlement-recommendations --json'
        : `game play settlement-recommendations ${locationFlags(step.parameters.origin)} --json`;
    case 'inspect-destination':
      return step.parameters.origin != null && step.parameters.destination != null
        ? `game play destination-analysis --from-x ${step.parameters.origin.x} --from-y ${step.parameters.origin.y} --to-x ${step.parameters.destination.x} --to-y ${step.parameters.destination.y} --json`
        : 'game play destination-analysis --json';
    case 'inspect-front':
      return 'game play front-summary --x <screen-x> --y <screen-y> --json';
    case 'inspect-ready-unit':
      return 'game play ready-unit --json';
    case 'validate-unit-action':
      return "game play unit-target --unit-id '<unit-id>' --x <x> --y <y> --json";
  }
}

function locationFlags(location: Location): string {
  return `--x ${location.x} --y ${location.y}`;
}
