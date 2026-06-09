import { Command, Flags } from '@oclif/core';
import { createCiv7ControlOrpcServerClient } from '@civ7/control-orpc';
import { liveCiv7ControlOrpcDirectControlFacade } from '@civ7/control-orpc/runtime';
import { getCiv7TurnCompletionStatus } from '@civ7/direct-control';
import { buildApproval, buildDirectControlOptions, emitPlayResult, requireSendReason } from '../../../utils/game-play-shared';

export default class GamePlayEndTurn extends Command {
  static id = 'game play end-turn';
  static summary = 'Check or send Civ7 end turn';
  static description =
    'Reads the direct-control turn completion guard first, then optionally sends turn complete through the native control-oRPC turn procedure when --send and --reason are explicit.';

  static examples = [
    '<%= config.bin %> game play end-turn --json',
    '<%= config.bin %> game play end-turn --send --reason "manual live-play turn handoff" --json',
  ];

  static flags = {
    host: Flags.string({
      description: 'Civ7 tuner socket host',
    }),
    port: Flags.integer({
      description: 'Civ7 tuner socket port',
    }),
    send: Flags.boolean({
      description: 'Send GameContext.sendTurnComplete() after direct-control guard approval',
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
    const { flags } = await this.parse(GamePlayEndTurn);
    const reason = requireSendReason(flags.send, flags.reason, 'game play end-turn');
    const options = buildDirectControlOptions(flags);
    const result = flags.send
      ? await createCiv7ControlOrpcServerClient({
          directControl: liveCiv7ControlOrpcDirectControlFacade,
          endpointDefaults: options,
          approval: buildApproval(reason ?? ''),
        }).turn.complete.request({})
      : await getCiv7TurnCompletionStatus(options);

    emitPlayResult(this.log.bind(this), flags.json, result);
  }
}
