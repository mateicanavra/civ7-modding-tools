import { Command, Flags } from '@oclif/core';
import { createCiv7ControlOrpcServerClient } from '@civ7/control-orpc';
import { liveCiv7ControlOrpcDirectControlFacade } from '@civ7/control-orpc/runtime';
import { buildDirectControlOptions, resolveCoordinateFlags } from '../../../utils/game-play-shared';

export default class GamePlayDestinationAnalysis extends Command {
  static id = 'game play destination-analysis';
  static summary = 'Read tactical pressure around an intended destination';
  static description =
    'Returns a read-only destination and corridor lens for movement planning. It reports nearby units, cities, plot samples, and points of interest, but it is not pathfinding, movement authority, or attack authority.';

  static examples = [
    '<%= config.bin %> game play destination-analysis --to-x 13 --to-y 17 --json',
    '<%= config.bin %> game play destination-analysis --from-x 20 --from-y 14 --to-x 13 --to-y 17 --corridor-radius 2 --json',
    '<%= config.bin %> game play destination-analysis --origin 20,14 --destination 13,17 --json',
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
    'from-x': Flags.integer({
      description: 'Optional origin x coordinate. Defaults to the first ready or selected unit when omitted.',
      dependsOn: ['from-y'],
    }),
    'from-y': Flags.integer({
      description: 'Optional origin y coordinate. Defaults to the first ready or selected unit when omitted.',
      dependsOn: ['from-x'],
    }),
    origin: Flags.string({
      description: 'Optional origin as x,y. Defaults to the first ready or selected unit when omitted.',
    }),
    'to-x': Flags.integer({
      description: 'Destination x coordinate',
      dependsOn: ['to-y'],
    }),
    'to-y': Flags.integer({
      description: 'Destination y coordinate',
      dependsOn: ['to-x'],
    }),
    destination: Flags.string({
      description: 'Destination as x,y',
    }),
    'corridor-radius': Flags.integer({
      description: 'Grid radius around the straight-line corridor to inspect',
      default: 2,
      min: 0,
      max: 8,
    }),
    'destination-radius': Flags.integer({
      description: 'Grid radius around the destination endpoint to inspect',
      default: 4,
      min: 1,
      max: 16,
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
    const { flags } = await this.parse(GamePlayDestinationAnalysis);
    const origin = resolveCoordinateFlags({
      x: flags['from-x'],
      y: flags['from-y'],
      pair: flags.origin,
      xFlag: 'from-x',
      yFlag: 'from-y',
      pairFlag: 'origin',
    });
    const destination = resolveCoordinateFlags({
      x: flags['to-x'],
      y: flags['to-y'],
      pair: flags.destination,
      xFlag: 'to-x',
      yFlag: 'to-y',
      pairFlag: 'destination',
      required: true,
    });
    if (!destination) throw new Error('provide --destination or --to-x and --to-y');
    const view = await createCiv7ControlOrpcServerClient({
      directControl: liveCiv7ControlOrpcDirectControlFacade,
      endpointDefaults: buildDirectControlOptions(flags),
    }).strategy.destinationAnalysis({
      playerId: flags['player-id'],
      origin,
      destination,
      corridorRadius: flags['corridor-radius'],
      destinationRadius: flags['destination-radius'],
      maxPlayers: flags['max-players'],
      maxUnits: flags['max-units'],
      maxCities: flags['max-cities'],
    });

    if (flags.json) {
      this.log(JSON.stringify({ ok: true, view }));
      return;
    }

    this.log(`Player: ${view.playerId}; origin: ${formatValue(view.origin)}; destination: ${formatValue(view.destination)}`);
    this.log(`Corridor radius=${view.corridorRadius}; destination radius=${view.destinationRadius}`);
    this.log(`Hidden info policy: ${view.hiddenInfoPolicy}`);
    this.log(`Corridor: ${formatValue(view.corridor)}`);
    this.log(`Destination pressure: ${formatValue(view.destinationPressure)}`);
    for (const point of asArray(view.pointsOfInterest)) {
      this.log(`- ${formatValue(point)}`);
    }
    for (const note of view.notes) this.log(`Note: ${note}`);
  }
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function formatValue(value: unknown): string {
  return typeof value === 'object' ? JSON.stringify(value) : String(value);
}
