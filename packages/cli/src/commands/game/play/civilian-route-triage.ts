import { Command, Flags } from '@oclif/core';
import {
  createCiv7ControlOrpcServerClient,
  type Civ7StrategyCivilianRouteTriageResult,
} from '@civ7/control-orpc';
import { liveCiv7ControlOrpcDirectControlFacade } from '@civ7/control-orpc/runtime';
import { buildDirectControlOptions } from '../../../utils/game-play-shared';

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
    for (const next of view.triage.nextInspections) this.log(`Next: ${next}`);
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
        .map(nextInspectionLabel)
        .filter((item): item is string => item != null),
    },
  };
}

function nextInspectionLabel(step: TriageNextStep): string | null {
  switch (step.kind) {
    case 'read-priorities':
    case 'inspect-battlefield':
    case 'inspect-settlement':
    case 'inspect-destination':
    case 'inspect-front':
    case 'inspect-ready-unit':
    case 'validate-unit-action':
      return step.label;
  }
  return null;
}
