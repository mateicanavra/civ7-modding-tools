import { Command, Flags } from '@oclif/core';
import {
  buildApproval,
  buildDirectControlOptions,
  emitPlayResult,
  parseComponentId,
  requireSendReason,
  sendPlayOperation,
  validatePlayOperation,
} from '../../../utils/game-play-shared';

const UPGRADE = 'UNITCOMMAND_UPGRADE';

export default class GamePlayUpgradeUnit extends Command {
  static id = 'game play upgrade-unit';
  static summary = 'Validate or send a unit upgrade command';
  static description =
    'Wraps unit-command UNITCOMMAND_UPGRADE for a unit whose live action panel/ready-unit validator exposes an eligible upgrade.';

  static examples = [
    '<%= config.bin %> game play upgrade-unit --unit-id \'{"owner":0,"id":1769488,"type":26}\' --json',
    '<%= config.bin %> game play upgrade-unit --unit-id \'{"owner":0,"id":1769488,"type":26}\' --send --reason "upgrade eligible warrior to preserve the defensive line" --json',
  ];

  static flags = {
    host: Flags.string({
      description: 'Civ7 tuner socket host',
    }),
    port: Flags.integer({
      description: 'Civ7 tuner socket port',
    }),
    'unit-id': Flags.string({
      description: 'Unit ComponentID JSON from the live ready-unit/action-panel view',
      required: true,
    }),
    send: Flags.boolean({
      description: 'Send UNITCOMMAND_UPGRADE after validator success',
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
    const { flags } = await this.parse(GamePlayUpgradeUnit);
    const reason = requireSendReason(flags.send, flags.reason, 'game play upgrade-unit');
    const input = {
      operationType: UPGRADE,
      unitId: parseComponentId(flags['unit-id'], 'unit-id'),
      args: {},
    };
    const options = buildDirectControlOptions(flags);
    const result = flags.send
      ? await sendPlayOperation('unit-command', input, options, buildApproval(reason))
      : await validatePlayOperation('unit-command', input, options);

    emitPlayResult(this.log.bind(this), flags.json, result);
  }
}
