import { Command, Flags } from '@oclif/core';
import {
  buildApproval,
  buildDirectControlOptions,
  emitPlayResult,
  executePlayOperationSequence,
  requireSendReason,
  sendPlayOperation,
  validatePlayOperation,
} from '../../../utils/game-play-shared';

const SET_TECH_TREE_NODE = 'SET_TECH_TREE_NODE';
const SET_TECH_TREE_TARGET_NODE = 'SET_TECH_TREE_TARGET_NODE';

export default class GamePlayChooseTech extends Command {
  static id = 'game play choose-tech';
  static summary = 'Validate or choose a technology node';
  static description =
    'Wraps player-operation SET_TECH_TREE_NODE with the official ProgressionTreeNodeType argument.';

  static examples = [
    '<%= config.bin %> game play choose-tech --player-id 0 --node -1255676052 --json',
    '<%= config.bin %> game play choose-tech --player-id 0 --node -1255676052 --send --reason "choose Masonry after advisor warning" --json',
    '<%= config.bin %> game play choose-tech --player-id 0 --node -1255676052 --send --closeout --reason "choose and target live Masonry node" --json',
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
      description: 'ProgressionTreeNodeType id from live GameInfo/progression tree reads',
      required: true,
    }),
    send: Flags.boolean({
      description: 'Send SET_TECH_TREE_NODE after validator success',
      default: false,
    }),
    closeout: Flags.boolean({
      description: 'Also run SET_TECH_TREE_TARGET_NODE as part of the same caller-level workflow',
      default: false,
    }),
    reason: Flags.string({
      description: 'Required approval reason for --send',
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
    const { flags } = await this.parse(GamePlayChooseTech);
    const reason = requireSendReason(flags.send, flags.reason, 'game play choose-tech');
    const input = {
      operationType: SET_TECH_TREE_NODE,
      playerId: flags['player-id'],
      args: {
        ProgressionTreeNodeType: flags.node,
      },
    };
    const options = buildDirectControlOptions(flags);
    if (flags.closeout) {
      const result = await executePlayOperationSequence([
        {
          label: 'choose technology node',
          family: 'player-operation',
          input,
        },
        {
          label: 'set technology target node',
          family: 'player-operation',
          input: {
            operationType: SET_TECH_TREE_TARGET_NODE,
            playerId: flags['player-id'],
            args: {
              ProgressionTreeNodeType: flags.node,
            },
          },
        },
      ], options, { send: flags.send, reason });

      emitPlayResult(this.log.bind(this), flags.json, result);
      return;
    }

    const result = flags.send
      ? await sendPlayOperation('player-operation', input, options, buildApproval(reason))
      : await validatePlayOperation('player-operation', input, options);

    emitPlayResult(this.log.bind(this), flags.json, result);
  }
}
