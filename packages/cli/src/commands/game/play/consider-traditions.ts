import { Command, Flags } from '@oclif/core';
import { createCiv7ControlOrpcServerClient } from '@civ7/control-orpc';
import { liveCiv7ControlOrpcDirectControlFacade } from '@civ7/control-orpc/runtime';
import {
  buildDirectControlOptions,
  emitPlayResult,
  validatePlayOperation,
} from '../../../utils/game-play-shared';

const CONSIDER_ASSIGN_TRADITIONS = 'CONSIDER_ASSIGN_TRADITIONS';

export default class GamePlayConsiderTraditions extends Command {
  static id = 'game play consider-traditions';
  static summary = 'Validate or close out tradition assignment review';
  static description =
    'Wraps player-operation CONSIDER_ASSIGN_TRADITIONS for the post-tradition assignment closeout path.';

  static examples = [
    '<%= config.bin %> game play consider-traditions --player-id 0 --json',
    '<%= config.bin %> game play consider-traditions --send --json',
  ];

  static flags = {
    host: Flags.string({
      description: 'Civ7 tuner socket host',
    }),
    port: Flags.integer({
      description: 'Civ7 tuner socket port',
    }),
    'player-id': Flags.integer({
      description: 'Player id for read-only validation; send mode uses live local-player evidence',
    }),
    send: Flags.boolean({
      description: 'Send CONSIDER_ASSIGN_TRADITIONS after validator success',
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
    const { flags } = await this.parse(GamePlayConsiderTraditions);
    const options = buildDirectControlOptions(flags);
    if (flags.send) {
      const client = createCiv7ControlOrpcServerClient({
        directControl: liveCiv7ControlOrpcDirectControlFacade,
        endpointDefaults: options,
      });
      const result = await client.progression.tradition.review.request({});
      emitPlayResult(this.log.bind(this), flags.json, result);
      return;
    }

    if (typeof flags['player-id'] !== 'number') {
      throw new Error('game play consider-traditions requires --player-id unless --send is used');
    }
    const input = {
      operationType: CONSIDER_ASSIGN_TRADITIONS,
      playerId: flags['player-id'],
      args: {},
    };
    const result = await validatePlayOperation('player-operation', input, options);

    emitPlayResult(this.log.bind(this), flags.json, result);
  }
}
