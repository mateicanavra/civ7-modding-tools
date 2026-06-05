import { Command, Flags } from '@oclif/core';
import {
  buildDirectControlOptions,
  emitPlayResult,
  executePlayOperationSequence,
  sendPlayOperation,
  validatePlayOperation,
} from '../../../utils/game-play-shared';

const BUY_ATTRIBUTE_TREE_NODE = 'BUY_ATTRIBUTE_TREE_NODE';
const CONSIDER_ASSIGN_ATTRIBUTE = 'CONSIDER_ASSIGN_ATTRIBUTE';

export default class GamePlayBuyAttribute extends Command {
  static id = 'game play buy-attribute';
  static summary = 'Validate or buy an attribute tree node';
  static description =
    'Wraps player-operation BUY_ATTRIBUTE_TREE_NODE with the official ProgressionTreeNodeType argument.';

  static examples = [
    '<%= config.bin %> game play buy-attribute --player-id 0 --node 20 --json',
    '<%= config.bin %> game play buy-attribute --player-id 0 --node 20 --send --json',
    '<%= config.bin %> game play buy-attribute --player-id 0 --node 20 --send --closeout --json',
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
    node: Flags.integer({
      description: 'ProgressionTreeNodeType id from live attribute tree reads',
      required: true,
    }),
    send: Flags.boolean({
      description: 'Send BUY_ATTRIBUTE_TREE_NODE after validator success',
      default: false,
    }),
    closeout: Flags.boolean({
      description: 'Also run CONSIDER_ASSIGN_ATTRIBUTE as part of the same caller-level workflow',
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
    const { flags } = await this.parse(GamePlayBuyAttribute);    const input = {
      operationType: BUY_ATTRIBUTE_TREE_NODE,
      playerId: flags['player-id'],
      args: {
        ProgressionTreeNodeType: flags.node,
      },
    };
    const options = buildDirectControlOptions(flags);
    if (flags.closeout) {
      const result = await executePlayOperationSequence([
        {
          label: 'buy attribute',
          family: 'player-operation',
          input,
        },
        {
          label: 'close attribute review',
          family: 'player-operation',
          input: {
            operationType: CONSIDER_ASSIGN_ATTRIBUTE,
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
