import { Command, Flags } from '@oclif/core';
import {
  buildDirectControlOptions,
  emitPlayResult,
  executePlayOperationSequence,
  sendPlayOperation,
  validatePlayOperation,
} from '../../../utils/game-play-shared';

const CHANGE_TRADITION = 'CHANGE_TRADITION';
const CONSIDER_ASSIGN_TRADITIONS = 'CONSIDER_ASSIGN_TRADITIONS';

export default class GamePlayChangeTradition extends Command {
  static id = 'game play change-tradition';
  static summary = 'Validate or change an active tradition';
  static description =
    'Wraps player-operation CHANGE_TRADITION with a live TraditionType and action enum value.';

  static examples = [
    '<%= config.bin %> game play change-tradition --player-id 0 --tradition-type 2057145683 --action 1318334332 --json',
    '<%= config.bin %> game play change-tradition --player-id 0 --tradition-type -331546976 --action -1326475004 --send --json',
    '<%= config.bin %> game play change-tradition --player-id 0 --tradition-type -331546976 --action -1326475004 --send --closeout --json',
  ];

  static flags = {
    host: Flags.string({
      description: 'Civ7 tuner socket host',
    }),
    port: Flags.integer({
      description: 'Civ7 tuner socket port',
    }),
    'player-id': Flags.integer({
      description: 'Player id',
      required: true,
    }),
    'tradition-type': Flags.integer({
      description: 'TraditionType id from live traditions UI/GameInfo',
      required: true,
    }),
    action: Flags.integer({
      description: 'Tradition action enum value from the live traditions UI',
      required: true,
    }),
    send: Flags.boolean({
      description: 'Send CHANGE_TRADITION after validator success',
      default: false,
    }),
    closeout: Flags.boolean({
      description: 'Also run CONSIDER_ASSIGN_TRADITIONS as part of the same caller-level workflow',
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
    const { flags } = await this.parse(GamePlayChangeTradition);    const input = {
      operationType: CHANGE_TRADITION,
      playerId: flags['player-id'],
      args: {
        TraditionType: flags['tradition-type'],
        Action: flags.action,
      },
    };
    const options = buildDirectControlOptions(flags);
    if (flags.closeout) {
      const result = await executePlayOperationSequence([
        {
          label: 'change tradition',
          family: 'player-operation',
          input,
        },
        {
          label: 'close tradition review',
          family: 'player-operation',
          input: {
            operationType: CONSIDER_ASSIGN_TRADITIONS,
            playerId: flags['player-id'],
            args: {},
          },
        },
      ], options, { send: flags.send });

      emitPlayResult(this.log.bind(this), flags.json, result);
      return;
    }

    const result = flags.send
      ? await sendPlayOperation('player-operation', input, options)
      : await validatePlayOperation('player-operation', input, options);

    emitPlayResult(this.log.bind(this), flags.json, result);
  }
}
