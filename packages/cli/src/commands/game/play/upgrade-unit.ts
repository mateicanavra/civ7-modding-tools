import { Command, Flags } from '@oclif/core';
import { createCiv7ControlOrpcServerClient } from '@civ7/control-orpc';
import { liveCiv7ControlOrpcDirectControlFacade } from '@civ7/control-orpc/runtime';
import {
  buildDirectControlOptions,
  emitPlayResult,
  parseComponentId,
  validatePlayOperation,
} from '../../../utils/game-play-shared';

const UPGRADE = 'UNITCOMMAND_UPGRADE';

export default class GamePlayUpgradeUnit extends Command {
  static id = 'game play upgrade-unit';
  static summary = 'Validate or send a unit upgrade command';
  static description =
    'Validates unit-command UNITCOMMAND_UPGRADE, or sends unit upgrade through the native unit upgrade procedure when --send is explicit.';

  static examples = [
    '<%= config.bin %> game play upgrade-unit --unit-id \'{"owner":0,"id":1769488,"type":26}\' --json',
    '<%= config.bin %> game play upgrade-unit --unit-id \'{"owner":0,"id":1769488,"type":26}\' --send --json',
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
    const input = {
      operationType: UPGRADE,
      unitId: parseComponentId(flags['unit-id'], 'unit-id'),
      args: {},
    };
    const options = buildDirectControlOptions(flags);
    const result = flags.send
      ? await createCiv7ControlOrpcServerClient({
        directControl: liveCiv7ControlOrpcDirectControlFacade,
        endpointDefaults: options,
      }).unit.upgrade.request({
        unitId: input.unitId,
      })
      : await validatePlayOperation('unit-command', input, options);

    emitPlayResult(this.log.bind(this), flags.json, result);
  }
}
