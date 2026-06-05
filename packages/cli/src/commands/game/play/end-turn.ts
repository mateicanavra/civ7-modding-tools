import { Command, Flags } from '@oclif/core';
import { createCiv7ControlOrpcServerClient } from '@civ7/control-orpc';
import { liveCiv7ControlOrpcDirectControlFacade } from '@civ7/control-orpc/runtime';
import { getCiv7TurnCompletionStatus } from '@civ7/direct-control';
import { buildDirectControlOptions, emitPlayResult } from '../../../utils/game-play-shared';

export default class GamePlayEndTurn extends Command {
  static id = 'game play end-turn';
  static summary = 'Check or send Civ7 end turn';
  static description =
    'Reads the direct-control turn completion guard first, then optionally sends turn complete through the native control-oRPC turn procedure when --send is explicit.';

  static examples = [
    '<%= config.bin %> game play end-turn --json',
    '<%= config.bin %> game play end-turn --send --json',
  ];

  static flags = {
    host: Flags.string({
      description: 'Civ7 tuner socket host',
    }),
    port: Flags.integer({
      description: 'Civ7 tuner socket port',
    }),
    send: Flags.boolean({
      description: 'Send GameContext.sendTurnComplete() after direct-control guards pass',
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
    const { flags } = await this.parse(GamePlayEndTurn);
    const options = buildDirectControlOptions(flags);
    const result = flags.send
      ? await createCiv7ControlOrpcServerClient({
          directControl: liveCiv7ControlOrpcDirectControlFacade,
          endpointDefaults: options,
        }).turn.complete.request({})
      : await getCiv7TurnCompletionStatus(options);

    emitPlayResult(this.log.bind(this), flags.json, result);
  }
}
