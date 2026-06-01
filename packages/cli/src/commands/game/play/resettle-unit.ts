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

const RESETTLE = 'UNITCOMMAND_RESETTLE';

export default class GamePlayResettleUnit extends Command {
  static id = 'game play resettle-unit';
  static summary = 'Validate or send a population resettle command';
  static description =
    'Wraps unit-command UNITCOMMAND_RESETTLE for Migrant/population units after the live acquire-tile view has identified a valid owned district plot.';

  static examples = [
    '<%= config.bin %> game play resettle-unit --unit-id \'{"owner":0,"id":1703951,"type":26}\' --x 17 --y 25 --json',
    '<%= config.bin %> game play resettle-unit --unit-id \'{"owner":0,"id":1703951,"type":26}\' --x 17 --y 25 --send --reason "resettle migrant into validated owned district" --json',
  ];

  static flags = {
    host: Flags.string({
      description: 'Civ7 tuner socket host',
    }),
    port: Flags.integer({
      description: 'Civ7 tuner socket port',
    }),
    'unit-id': Flags.string({
      description: 'Population unit ComponentID JSON from the live ready-unit/acquire-tile view',
      required: true,
    }),
    x: Flags.integer({
      description: 'Owned district target plot X coordinate from the live acquire-tile view',
      required: true,
    }),
    y: Flags.integer({
      description: 'Owned district target plot Y coordinate from the live acquire-tile view',
      required: true,
    }),
    send: Flags.boolean({
      description: 'Send UNITCOMMAND_RESETTLE after validator success',
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
    const { flags } = await this.parse(GamePlayResettleUnit);
    const reason = requireSendReason(flags.send, flags.reason, 'game play resettle-unit');
    const input = {
      operationType: RESETTLE,
      unitId: parseComponentId(flags['unit-id'], 'unit-id'),
      args: {
        X: flags.x,
        Y: flags.y,
      },
    };
    const options = buildDirectControlOptions(flags);
    const result = flags.send
      ? await sendPlayOperation('unit-command', input, options, buildApproval(reason))
      : await validatePlayOperation('unit-command', input, options);

    emitPlayResult(this.log.bind(this), flags.json, result);
  }
}
