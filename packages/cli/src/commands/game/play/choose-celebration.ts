import { Command, Flags } from '@oclif/core';
import {
  buildApproval,
  buildDirectControlOptions,
  emitPlayResult,
  requireSendReason,
  sendPlayOperation,
  validatePlayOperation,
} from '../../../utils/game-play-shared';

const CHOOSE_GOLDEN_AGE = 'CHOOSE_GOLDEN_AGE';

export default class GamePlayChooseCelebration extends Command {
  static id = 'game play choose-celebration';
  static summary = 'Validate or choose a celebration bonus';
  static description =
    'Wraps player-operation CHOOSE_GOLDEN_AGE with the GoldenAgeType hash from the live celebration chooser.';

  static examples = [
    '<%= config.bin %> game play choose-celebration --player-id 0 --golden-age-type -340825966 --json',
    '<%= config.bin %> game play choose-celebration --player-id 0 --golden-age-type -340825966 --send --reason "choose live validated culture celebration" --json',
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
    'golden-age-type': Flags.integer({
      description: 'GoldenAgeType hash from the live celebration chooser',
      required: true,
    }),
    send: Flags.boolean({
      description: 'Send CHOOSE_GOLDEN_AGE after validator success',
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
    const { flags } = await this.parse(GamePlayChooseCelebration);
    const reason = requireSendReason(flags.send, flags.reason, 'game play choose-celebration');
    const input = {
      operationType: CHOOSE_GOLDEN_AGE,
      playerId: flags['player-id'],
      args: {
        GoldenAgeType: flags['golden-age-type'],
      },
    };
    const options = buildDirectControlOptions(flags);
    const result = flags.send
      ? await sendPlayOperation('player-operation', input, options, buildApproval(reason))
      : await validatePlayOperation('player-operation', input, options);

    emitPlayResult(this.log.bind(this), flags.json, result);
  }
}
