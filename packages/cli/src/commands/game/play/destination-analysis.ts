import { Command, Flags } from '@oclif/core';
import { getCiv7DestinationAnalysis } from '@civ7/direct-control';
import { buildDirectControlOptions } from '../../../utils/game-play-shared';

export default class GamePlayDestinationAnalysis extends Command {
  static id = 'game play destination-analysis';
  static summary = 'Read tactical pressure around an intended destination';
  static description =
    'Returns a read-only destination and corridor lens for movement planning. It reports nearby units, cities, plot samples, and points of interest, but it is not pathfinding, movement authority, or attack authority.';

  static examples = [
    '<%= config.bin %> game play destination-analysis --to-x 13 --to-y 17 --json',
    '<%= config.bin %> game play destination-analysis --from-x 20 --from-y 14 --to-x 13 --to-y 17 --corridor-radius 2 --json',
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
    'to-x': Flags.integer({
      description: 'Destination x coordinate',
      required: true,
      dependsOn: ['to-y'],
    }),
    'to-y': Flags.integer({
      description: 'Destination y coordinate',
      required: true,
      dependsOn: ['to-x'],
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
    const origin = flags['from-x'] === undefined || flags['from-y'] === undefined
      ? undefined
      : { x: flags['from-x'], y: flags['from-y'] };
    const view = await getCiv7DestinationAnalysis({
      playerId: flags['player-id'],
      origin,
      destination: { x: flags['to-x'], y: flags['to-y'] },
      corridorRadius: flags['corridor-radius'],
      destinationRadius: flags['destination-radius'],
      maxPlayers: flags['max-players'],
      maxUnits: flags['max-units'],
      maxCities: flags['max-cities'],
    }, buildDirectControlOptions(flags));

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
