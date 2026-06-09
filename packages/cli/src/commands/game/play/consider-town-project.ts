import { Command, Flags } from '@oclif/core';
import { createCiv7ControlOrpcServerClient } from '@civ7/control-orpc';
import { liveCiv7ControlOrpcDirectControlFacade } from '@civ7/control-orpc/runtime';
import {
  buildDirectControlOptions,
  emitPlayResult,
  parseComponentId,
  validatePlayOperation,
} from '../../../utils/game-play-shared';

const CONSIDER_TOWN_PROJECT = 'CONSIDER_TOWN_PROJECT';

export default class GamePlayConsiderTownProject extends Command {
  static id = 'game play consider-town-project';
  static summary = 'Validate or close out town project review';
  static description =
    'Wraps city-operation CONSIDER_TOWN_PROJECT, the production panel closeout used after town focus project review.';

  static examples = [
    '<%= config.bin %> game play consider-town-project --city-id \'{"owner":0,"id":131073,"type":1}\' --json',
    '<%= config.bin %> game play consider-town-project --city-id \'{"owner":0,"id":131073,"type":1}\' --send --json',
  ];

  static flags = {
    host: Flags.string({
      description: 'Civ7 tuner socket host',
    }),
    port: Flags.integer({
      description: 'Civ7 tuner socket port',
    }),
    'city-id': Flags.string({
      description: 'Town ComponentID JSON',
      required: true,
    }),
    send: Flags.boolean({
      description: 'Send CONSIDER_TOWN_PROJECT after validator success',
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
    const { flags } = await this.parse(GamePlayConsiderTownProject);
    const cityId = parseComponentId(flags['city-id'], 'city-id');
    const options = buildDirectControlOptions(flags);
    if (flags.send) {
      const client = createCiv7ControlOrpcServerClient({
        directControl: liveCiv7ControlOrpcDirectControlFacade,
        endpointDefaults: options,
      });
      const result = await client.city.townFocus.review.request({ cityId });

      emitPlayResult(this.log.bind(this), flags.json, result);
      return;
    }

    const input = {
      operationType: CONSIDER_TOWN_PROJECT,
      cityId,
      args: {},
    };
    const result = await validatePlayOperation('city-operation', input, options);

    emitPlayResult(this.log.bind(this), flags.json, result);
  }
}
