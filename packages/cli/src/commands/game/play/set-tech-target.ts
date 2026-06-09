import { Command, Flags } from '@oclif/core';
import { createCiv7ControlOrpcServerClient } from '@civ7/control-orpc';
import { liveCiv7ControlOrpcDirectControlFacade } from '@civ7/control-orpc/runtime';
import {
  buildDirectControlOptions,
  emitPlayResult,
  validatePlayOperation,
} from '../../../utils/game-play-shared';

const SET_TECH_TREE_TARGET_NODE = 'SET_TECH_TREE_TARGET_NODE';

export default class GamePlaySetTechTarget extends Command {
  static id = 'game play set-tech-target';
  static summary = 'Validate or set a technology tree target node';
  static description =
    'Wraps player-operation SET_TECH_TREE_TARGET_NODE with the official ProgressionTreeNodeType argument.';

  static examples = [
    '<%= config.bin %> game play set-tech-target --player-id 0 --node -1255676052 --json',
    '<%= config.bin %> game play set-tech-target --player-id 0 --node -1255676052 --send --json',
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
      description: 'Send SET_TECH_TREE_TARGET_NODE after validator success',
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
    const { flags } = await this.parse(GamePlaySetTechTarget);
    const input = {
      operationType: SET_TECH_TREE_TARGET_NODE,
      playerId: flags['player-id'],
      args: {
        ProgressionTreeNodeType: flags.node,
      },
    };
    const options = buildDirectControlOptions(flags);
    const result = flags.send
      ? await createCiv7ControlOrpcServerClient({
          directControl: liveCiv7ControlOrpcDirectControlFacade,
          endpointDefaults: options,
        }).progression.technology.target.request({
          playerId: flags['player-id'],
          node: flags.node,
        })
      : await validatePlayOperation('player-operation', input, options);

    emitPlayResult(this.log.bind(this), flags.json, result);
  }
}
