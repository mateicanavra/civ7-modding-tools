import { Command, Flags } from '@oclif/core';
import { createCiv7ControlOrpcServerClient } from '@civ7/control-orpc';
import { liveCiv7ControlOrpcDirectControlFacade } from '@civ7/control-orpc/runtime';
import {
  buildDirectControlOptions,
  emitPlayResult,
  parseComponentId,
  validatePlayOperation,
} from '../../../utils/game-play-shared';

const EXPAND = 'EXPAND';

export default class GamePlayExpandCity extends Command {
  static id = 'game play expand-city';
  static summary = 'Validate or send a city expansion placement';
  static description =
    'Validates city-command EXPAND choices, or sends city expansion through the native control-oRPC city population procedure when --send is explicit.';

  static examples = [
    '<%= config.bin %> game play expand-city --city-id \'{"owner":0,"id":196610,"type":1}\' --x 16 --y 19 --json',
    '<%= config.bin %> game play expand-city --city-id \'{"owner":0,"id":196610,"type":1}\' --x 16 --y 19 --send --json',
  ];

  static flags = {
    host: Flags.string({
      description: 'Civ7 tuner socket host',
    }),
    port: Flags.integer({
      description: 'Civ7 tuner socket port',
    }),
    'city-id': Flags.string({
      description: 'City ComponentID JSON from the live NEW_POPULATION decision',
      required: true,
    }),
    x: Flags.integer({
      description: 'Expansion plot X coordinate from the live acquire-tile/ready-city view',
      required: true,
    }),
    y: Flags.integer({
      description: 'Expansion plot Y coordinate from the live acquire-tile/ready-city view',
      required: true,
    }),
    send: Flags.boolean({
      description: 'Send EXPAND after validator success',
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
    const { flags } = await this.parse(GamePlayExpandCity);
    const input = {
      operationType: EXPAND,
      cityId: parseComponentId(flags['city-id'], 'city-id'),
      args: {
        X: flags.x,
        Y: flags.y,
      },
    };
    const options = buildDirectControlOptions(flags);
    const result = flags.send
      ? await createCiv7ControlOrpcServerClient({
          directControl: liveCiv7ControlOrpcDirectControlFacade,
          endpointDefaults: options,
        }).city.population.place.request({
          mode: 'expand-city',
          cityId: input.cityId,
          destination: {
            x: flags.x,
            y: flags.y,
          },
        })
      : await validatePlayOperation('city-command', input, options);

    emitPlayResult(this.log.bind(this), flags.json, result);
  }
}
