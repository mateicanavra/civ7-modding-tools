import { Command, Flags } from '@oclif/core';
import { getCiv7UnitMovePreview } from '@civ7/direct-control';
import {
  buildDirectControlOptions,
  parseComponentId,
  resolveCoordinateFlags,
} from '../../../utils/game-play-shared';

export default class GamePlayUnitMovePreview extends Command {
  static id = 'game play unit-move-preview';
  static summary = 'Read official unit movement, target, path, and queued-destination preview';
  static description =
    'Returns a read-only movement preview using the same Units movement/path APIs the Civ7 UI uses for reachable movement, targets, queued destinations, and hover paths.';

  static examples = [
    '<%= config.bin %> game play unit-move-preview --json',
    '<%= config.bin %> game play unit-move-preview --unit-id \'{"owner":0,"id":65536,"type":26}\' --json',
    '<%= config.bin %> game play unit-move-preview --unit-id \'{"owner":0,"id":65536,"type":26}\' --destination 25,35 --json',
  ];

  static flags = {
    host: Flags.string({
      description: 'Civ7 tuner socket host',
    }),
    port: Flags.integer({
      description: 'Civ7 tuner socket port',
    }),
    'unit-id': Flags.string({
      description: 'Explicit unit ComponentID JSON. Defaults to selected unit, then first ready unit.',
    }),
    x: Flags.integer({
      description: 'Optional preview destination x coordinate',
      dependsOn: ['y'],
    }),
    y: Flags.integer({
      description: 'Optional preview destination y coordinate',
      dependsOn: ['x'],
    }),
    destination: Flags.string({
      description: 'Optional preview destination as x,y',
    }),
    'max-plots': Flags.integer({
      description: 'Maximum reachable movement/target plot entries to normalize',
      default: 80,
    }),
    'max-path-plots': Flags.integer({
      description: 'Maximum queued/requested path plot entries to normalize',
      default: 32,
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
    const { flags } = await this.parse(GamePlayUnitMovePreview);
    const destination = resolveCoordinateFlags({
      x: flags.x,
      y: flags.y,
      pair: flags.destination,
      xFlag: 'x',
      yFlag: 'y',
      pairFlag: 'destination',
    });
    const view = await getCiv7UnitMovePreview({
      unitId: flags['unit-id'] ? parseComponentId(flags['unit-id'], 'unit-id') : undefined,
      destination,
      maxPlots: flags['max-plots'],
      maxPathPlots: flags['max-path-plots'],
    }, buildDirectControlOptions(flags));

    if (flags.json) {
      this.log(JSON.stringify({ ok: true, view }));
      return;
    }

    this.log(JSON.stringify(view, null, 2));
  }
}
